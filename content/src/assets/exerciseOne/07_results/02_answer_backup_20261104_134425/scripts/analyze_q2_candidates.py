#!/usr/bin/env python3

from pathlib import Path
import csv
import math
from collections import defaultdict

ROOT = Path.home() / "exerciseOne"
DE_DIR = ROOT / "05_DE_analysis"
GENE_DIR = ROOT / "06_pathway/gene_sets"
Q1_DIR = ROOT / "07_results/01_answer/tables"
OUT = ROOT / "07_results/02_answer"
TABLES = OUT / "tables"
DATA = OUT / "data"
LOGS = OUT / "logs"

for directory in (TABLES, DATA, LOGS):
    directory.mkdir(parents=True, exist_ok=True)

STRESSES = ["Cold", "Drought", "Heat", "Salinity"]
PADJ_CUTOFF = 0.05
LFC_CUTOFF = 1.0


def read_tsv(path):
    if not path.exists():
        raise FileNotFoundError(f"Required file not found: {path}")
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        if not reader.fieldnames:
            raise ValueError(f"No header found in {path}")
        rows = list(reader)
        return reader.fieldnames, rows


def gene_id(value):
    value = (value or "").strip()
    if value.startswith("gene:"):
        value = value[len("gene:"):]
    return value


def number(value):
    try:
        if value is None or value.strip() in ("", "NA", "NaN", "nan"):
            return None
        result = float(value)
        return result if math.isfinite(result) else None
    except (ValueError, AttributeError):
        return None


def is_candidate(row):
    padj = number(row.get("padj"))
    lfc = number(row.get("log2FoldChange"))
    return (
        padj is not None
        and padj <= PADJ_CUTOFF
        and lfc is not None
        and abs(lfc) >= LFC_CUTOFF
    )


def direction(row):
    lfc = number(row.get("log2FoldChange"))
    if lfc is None:
        return "Unavailable"
    if lfc > 0:
        return "Upregulated"
    if lfc < 0:
        return "Downregulated"
    return "No change"


def write_tsv(path, rows, columns):
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle, fieldnames=columns, delimiter="\t",
            extrasaction="ignore", lineterminator="\n"
        )
        writer.writeheader()
        writer.writerows(rows)


def fmt(value):
    return "" if value is None else value


log_lines = [
    "Question 2 metabolic-enzyme candidate analysis",
    f"Candidate criteria: adjusted p-value <= {PADJ_CUTOFF}; "
    f"absolute log2 fold change >= {LFC_CUTOFF}",
    "Ranking order: more significant adjusted p-value, larger absolute "
    "log2 fold change, then more associated enriched GO processes.",
    "This is a prioritization heuristic, not a validated biological score.",
    ""
]

# Read all-gene DESeq2 results and the existing metabolic-enzyme DEG lists.
all_results = {}
candidate_sets = {}
candidate_rows = {}
candidate_fields = {}

for stress in STRESSES:
    all_path = DE_DIR / f"{stress}_vs_Control_all_results.tsv"
    _, rows = read_tsv(all_path)

    indexed = {}
    bad_rows = 0
    for row in rows:
        gid = gene_id(row.get("Geneid"))
        if not gid or "log2FoldChange" not in row or "padj" not in row:
            bad_rows += 1
            continue
        indexed[gid] = row

    all_results[stress] = indexed
    log_lines.append(
        f"{stress}: all-results rows={len(rows)}; "
        f"usable indexed genes={len(indexed)}; incomplete rows={bad_rows}"
    )

    candidate_path = GENE_DIR / f"{stress}_metabolic_enzyme_DEGs.tsv"
    fields, rows = read_tsv(candidate_path)
    candidate_fields[stress] = fields

    kept = {}
    dropped = 0
    for row in rows:
        gid = gene_id(row.get("Geneid"))
        if not gid:
            dropped += 1
            continue

        # Verify the candidate row against the declared criteria.
        if is_candidate(row):
            kept[gid] = row
        else:
            dropped += 1

    candidate_sets[stress] = set(kept)
    candidate_rows[stress] = kept
    log_lines.append(
        f"{stress}: listed enzyme DEGs={len(rows)}; "
        f"retained after criteria check={len(kept)}; "
        f"excluded={dropped}"
    )

log_lines.append("")

# Load significant metabolic-process enrichment results from Question 1.
enrichment_path = Q1_DIR / "Q1_metabolic_process_enrichment.tsv"
_, enrichment_rows = read_tsv(enrichment_path)

gene_processes = defaultdict(set)
process_metadata = {}

for row in enrichment_rows:
    stress = (row.get("Stress") or row.get("CountStress") or "").strip()
    go_id = (row.get("ID") or "").strip()
    description = (row.get("Description") or "").strip()

    if stress not in STRESSES or not go_id:
        continue

    process_metadata[(stress, go_id)] = description
    for item in (row.get("geneID") or "").split("/"):
        gid = gene_id(item)
        if gid:
            gene_processes[(stress, gid)].add((go_id, description))

# Candidate-to-enriched-process links.
link_rows = []
for stress in STRESSES:
    for gid in sorted(candidate_sets[stress]):
        terms = sorted(gene_processes.get((stress, gid), set()))
        if terms:
            for go_id, description in terms:
                link_rows.append({
                    "Stress": stress,
                    "Geneid": gid,
                    "GO_ID": go_id,
                    "GO_Description": description
                })
        else:
            link_rows.append({
                "Stress": stress,
                "Geneid": gid,
                "GO_ID": "",
                "GO_Description": ""
            })

write_tsv(
    TABLES / "Q2_candidate_to_GO_processes.tsv",
    link_rows,
    ["Stress", "Geneid", "GO_ID", "GO_Description"]
)

# Ranked candidates, one table per stress and one combined table.
ranked_all = []

for stress in STRESSES:
    rows = []
    for gid in candidate_sets[stress]:
        row = candidate_rows[stress][gid]
        padj = number(row.get("padj"))
        lfc = number(row.get("log2FoldChange"))
        processes = sorted(gene_processes.get((stress, gid), set()))

        rows.append({
            "Stress": stress,
            "Geneid": gid,
            "baseMean": row.get("baseMean", ""),
            "log2FoldChange": row.get("log2FoldChange", ""),
            "lfcSE": row.get("lfcSE", ""),
            "stat": row.get("stat", ""),
            "pvalue": row.get("pvalue", ""),
            "padj": row.get("padj", ""),
            "Direction": direction(row),
            "Absolute_log2FoldChange": abs(lfc) if lfc is not None else None,
            "Enriched_GO_process_count": len(processes),
            "Enriched_GO_processes": "; ".join(
                f"{go_id} | {desc}" for go_id, desc in processes
            ),
            "_padj": padj if padj is not None else 1.0,
            "_abs_lfc": abs(lfc) if lfc is not None else 0.0
        })

    rows.sort(key=lambda r: (
        r["_padj"],
        -r["_abs_lfc"],
        -r["Enriched_GO_process_count"],
        r["Geneid"]
    ))

    for rank, row in enumerate(rows, start=1):
        row["Rank"] = rank
        ranked_all.append(row)

    columns = [
        "Rank", "Stress", "Geneid", "baseMean", "log2FoldChange",
        "Absolute_log2FoldChange", "lfcSE", "stat", "pvalue", "padj",
        "Direction", "Enriched_GO_process_count", "Enriched_GO_processes"
    ]
    write_tsv(
        TABLES / f"Q2_{stress}_ranked_metabolic_enzyme_candidates.tsv",
        rows, columns
    )

combined_columns = [
    "Rank", "Stress", "Geneid", "baseMean", "log2FoldChange",
    "Absolute_log2FoldChange", "lfcSE", "stat", "pvalue", "padj",
    "Direction", "Enriched_GO_process_count", "Enriched_GO_processes"
]
write_tsv(
    TABLES / "Q2_ranked_metabolic_enzyme_candidates_all_stresses.tsv",
    ranked_all, combined_columns
)

# Compare the union of candidates across all stresses using the full DESeq2
# result tables, not only the rows significant in a particular stress.
union_genes = set().union(*candidate_sets.values())
cross_rows = []
summary_rows = []

for gid in sorted(union_genes):
    detected = []
    cross_row = {"Geneid": gid}

    for stress in STRESSES:
        result = all_results[stress].get(gid)
        prefix = stress + "_"

        if result is None:
            cross_row[prefix + "log2FoldChange"] = ""
            cross_row[prefix + "padj"] = ""
            cross_row[prefix + "Direction"] = "No result"
            cross_row[prefix + "Significant_candidate"] = "No"
            continue

        lfc = number(result.get("log2FoldChange"))
        padj = number(result.get("padj"))
        significant = is_candidate(result)

        cross_row[prefix + "log2FoldChange"] = result.get("log2FoldChange", "")
        cross_row[prefix + "padj"] = result.get("padj", "")
        cross_row[prefix + "Direction"] = direction(result)
        cross_row[prefix + "Significant_candidate"] = (
            "Yes" if significant else "No"
        )

        if significant and gid in candidate_sets[stress]:
            detected.append(stress)

    cross_row["Number_of_stresses"] = len(detected)
    cross_row["Detected_stresses"] = "; ".join(detected)
    cross_rows.append(cross_row)

    all_processes = set()
    for stress in STRESSES:
        all_processes.update(gene_processes.get((stress, gid), set()))

    summary_rows.append({
        "Geneid": gid,
        "Number_of_stresses": len(detected),
        "Detected_stresses": "; ".join(detected),
        "Pattern": (
            "Detected in all four stresses" if len(detected) == 4 else
            "Detected in multiple stresses" if len(detected) > 1 else
            "Detected in one stress" if len(detected) == 1 else
            "Not detected under criteria"
        ),
        "Number_of_associated_enriched_GO_processes": len(all_processes)
    })

cross_columns = ["Geneid"]
for stress in STRESSES:
    cross_columns += [
        stress + "_log2FoldChange",
        stress + "_padj",
        stress + "_Direction",
        stress + "_Significant_candidate"
    ]
cross_columns += ["Number_of_stresses", "Detected_stresses"]

write_tsv(
    TABLES / "Q2_cross_stress_candidate_matrix.tsv",
    cross_rows, cross_columns
)
write_tsv(
    TABLES / "Q2_candidate_stress_summary.tsv",
    summary_rows,
    [
        "Geneid", "Number_of_stresses", "Detected_stresses", "Pattern",
        "Number_of_associated_enriched_GO_processes"
    ]
)

# Counts for a concise audit log.
log_lines.append(f"Unique candidate genes across all stresses: {len(union_genes)}")
log_lines.append(f"Ranked candidate rows across stresses: {len(ranked_all)}")
log_lines.append(f"Candidate-to-GO rows (including unmatched candidates): {len(link_rows)}")
log_lines.append("")
log_lines.append("Candidate counts by number of stresses:")
for count in range(1, len(STRESSES) + 1):
    n = sum(1 for row in summary_rows if row["Number_of_stresses"] == count)
    log_lines.append(f"  {count} stress(es): {n}")

log_lines.append("")
log_lines.append("Important interpretation notes:")
log_lines.append("- A GO link means the gene occurs in a reported enriched GO term.")
log_lines.append("- Lack of a link does not mean the gene has no biological function.")
log_lines.append("- A gene's direction is relative to control for that stress.")
log_lines.append("- Cross-stress significance is evaluated separately per contrast.")
log_lines.append("- Expression association alone does not establish regulatory causation.")
log_lines.append("- Regulatory candidates require separate TF/regulator annotation and analysis.")

log_path = LOGS / "q2_candidate_analysis.log"
log_path.write_text("\n".join(log_lines) + "\n", encoding="utf-8")

print("\n".join(log_lines))
print(f"\nOutputs written under: {OUT}")
