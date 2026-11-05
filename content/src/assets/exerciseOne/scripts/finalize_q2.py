from pathlib import Path
import pandas as pd
import numpy as np

ROOT = Path.home() / "exerciseOne"
TABLES = ROOT / "07_results/02_answer/tables"
OUTDIR = ROOT / "07_results/02_answer/write-up"
OUTDIR.mkdir(parents=True, exist_ok=True)
OUTFILE = OUTDIR / "Q2_final_answer.txt"

STRESSES = ["Cold", "Drought", "Heat", "Salinity"]
ALPHA = 0.05

def read_table(name):
    path = TABLES / name
    if not path.exists():
        raise FileNotFoundError(f"Required existing results table not found: {path}")
    return pd.read_csv(path, sep="\t", low_memory=False)

def num(series):
    return pd.to_numeric(series, errors="coerce")

def fmt_num(x, digits=3):
    try:
        x = float(x)
        if not np.isfinite(x):
            return "NA"
        if x != 0 and abs(x) < 0.001:
            return f"{x:.2e}"
        return f"{x:.{digits}f}"
    except (TypeError, ValueError):
        return "NA"

def direction_label(value):
    if pd.isna(value):
        return "unknown direction"
    value = str(value).strip().lower()
    if value in {"up", "upregulated", "up-regulated"}:
        return "upregulated"
    if value in {"down", "downregulated", "down-regulated"}:
        return "downregulated"
    return value

def clean_text(value):
    if pd.isna(value) or str(value).strip() in {"", "nan", "None"}:
        return ""
    return str(value).strip()

# Load previously generated results.
ranked = read_table("Q2_ranked_metabolic_enzyme_candidates_all_stresses.tsv")
cross = read_table("Q2_cross_stress_candidate_matrix.tsv")
tf = read_table("TF_significant_all_stresses.tsv")
tf_families = read_table("TF_family_summary.tsv")

annotation_path = ROOT / "06_pathway/annotation/RefGen4_metabolic_enzyme_genes.tsv"
annotations = None
if annotation_path.exists():
    annotations = pd.read_csv(annotation_path, sep="\t", low_memory=False)
    if "Gene_ID" in annotations.columns:
        annotations["Geneid"] = annotations["Gene_ID"].astype(str)
        annotations = annotations.drop_duplicates("Geneid")

# Normalize the main candidate table.
ranked["Stress"] = ranked["Stress"].astype(str).str.title()
ranked["padj"] = num(ranked["padj"])
ranked["log2FoldChange"] = num(ranked["log2FoldChange"])
ranked["Absolute_log2FoldChange"] = num(ranked["Absolute_log2FoldChange"])

if annotations is not None:
    ranked = ranked.merge(
        annotations.drop(columns=["Gene_ID"], errors="ignore"),
        on="Geneid", how="left", suffixes=("", "_annotation")
    )

# Restrict the priority lists to statistically significant genes.
sig_ranked = ranked[
    ranked["padj"].notna() & (ranked["padj"] < ALPHA)
].copy()

if "Absolute_log2FoldChange" not in sig_ranked.columns:
    sig_ranked["Absolute_log2FoldChange"] = sig_ranked["log2FoldChange"].abs()

sig_ranked["Absolute_log2FoldChange"] = (
    sig_ranked["Absolute_log2FoldChange"].fillna(
        sig_ranked["log2FoldChange"].abs()
    )
)
sig_ranked = sig_ranked.sort_values(
    ["Stress", "padj", "Absolute_log2FoldChange"],
    ascending=[True, True, False]
)

# Cross-stress candidate matrix.
for stress in STRESSES:
    col = f"{stress}_padj"
    if col in cross.columns:
        cross[col] = num(cross[col])

    lfc_col = f"{stress}_log2FoldChange"
    if lfc_col in cross.columns:
        cross[lfc_col] = num(cross[lfc_col])

    sig_col = f"{stress}_Significant_candidate"
    if sig_col in cross.columns:
        cross[sig_col] = (
            cross[sig_col].astype(str).str.strip().str.lower()
            .isin(["true", "1", "yes"])
        )
    elif col in cross.columns:
        cross[sig_col] = cross[col].notna() & (cross[col] < ALPHA)
    else:
        cross[sig_col] = False

def is_sig(row, stress):
    return bool(row.get(f"{stress}_Significant_candidate", False))

cross["Significant_stress_count"] = cross.apply(
    lambda r: sum(is_sig(r, s) for s in STRESSES), axis=1
)

def gene_directions(row, selected):
    dirs = []
    for s in selected:
        if is_sig(row, s):
            lfc = row.get(f"{s}_log2FoldChange", np.nan)
            if pd.notna(lfc):
                dirs.append("up" if lfc > 0 else "down" if lfc < 0 else "zero")
    return dirs

cross["Significant_directions"] = cross.apply(
    lambda r: gene_directions(r, STRESSES), axis=1
)

shared = cross[cross["Significant_stress_count"] >= 2].copy()
shared["Direction_pattern"] = shared["Significant_directions"].apply(
    lambda ds: (
        "Consistent direction across significant stresses"
        if len(set(ds) - {"zero"}) <= 1
        else "Opposing directions across significant stresses"
    )
)
shared = shared.sort_values(
    ["Significant_stress_count"], ascending=False
)

# TF results: retain significant entries and summarize each stress.
tf["Stress"] = tf["Stress"].astype(str).str.title()
tf["padj"] = num(tf["padj"])
tf["log2FoldChange"] = num(tf["log2FoldChange"])
tf_sig = tf[tf["padj"].notna() & (tf["padj"] < ALPHA)].copy()

# Create the written answer.
lines = []
add = lines.append

add("QUESTION 2: PRIORITY METABOLIC ENZYME CANDIDATES AND POTENTIAL REGULATORY GENES")
add("=" * 82)
add("")
add("Research question:")
add("Which metabolic enzyme genes emerge as key candidates within the pathway responses,")
add("and which candidate regulatory genes may be associated with their coordinated or")
add("stress-specific expression patterns?")
add("")
add("Analysis basis")
add("- This synthesis reuses the existing differential-expression, candidate-ranking,")
add("  cross-stress and transcription-factor tables. The RNA-seq pipeline was not rerun.")
add(f"- Statistical significance was defined as adjusted p-value (FDR) < {ALPHA}.")
add("- Candidate ranking considers statistical significance and the magnitude of the")
add("  log2 fold change. A large fold change alone is not sufficient evidence of importance.")
add("- Annotation availability is incomplete; a gene without a functional annotation")
add("  is not automatically excluded from consideration.")
add("")
add("1. Metabolic enzyme candidates by stress")
add("-" * 38)

for stress in STRESSES:
    group = sig_ranked[sig_ranked["Stress"] == stress].copy()
    add("")
    add(f"{stress.upper()}: {len(group)} significant candidates in the ranked table.")
    if group.empty:
        add("No candidates meeting the significance threshold were found in this table.")
        continue

    add("Highest-priority candidates (up to 8; ordered primarily by adjusted p-value):")
    for _, r in group.head(8).iterrows():
        gene = clean_text(r.get("Geneid", "unknown gene"))
        lfc = fmt_num(r.get("log2FoldChange"))
        padj = fmt_num(r.get("padj"))
        direction = direction_label(r.get("Direction", ""))
        add(f"  - {gene}: log2FC={lfc}, adjusted p={padj}, {direction}.")

        enzyme_terms = clean_text(r.get("Enzyme_GO_Terms", ""))
        bp_terms = clean_text(r.get("Metabolic_BP_Terms", ""))
        go_processes = clean_text(r.get("Enriched_GO_processes", ""))

        if enzyme_terms:
            add(f"      Enzyme GO terms: {enzyme_terms}")
        if bp_terms:
            add(f"      Metabolic biological-process GO terms: {bp_terms}")
        if go_processes:
            add(f"      Enriched GO processes: {go_processes}")

    annotated = 0
    if "Enzyme_GO_Terms" in group.columns:
        annotated = group["Enzyme_GO_Terms"].fillna("").astype(str).str.strip().ne("").sum()
    add(f"Annotation note: {annotated} of these {len(group)} significant candidates "
        "have enzyme GO terms recorded in the annotation table.")

add("")
add("2. Shared and stress-specific expression patterns")
add("-" * 45)
add(f"The cross-stress matrix contains {len(cross)} genes.")
add(f"{len(shared)} genes are marked as significant candidates in at least two stresses.")

if len(shared):
    consistent = (
        shared["Direction_pattern"] ==
        "Consistent direction across significant stresses"
    ).sum()
    opposing = (
        shared["Direction_pattern"] ==
        "Opposing directions across significant stresses"
    ).sum()
    add(f"Among these multi-stress candidates, {consistent} show a consistent direction")
    add(f"and {opposing} show opposing directions across the stresses where they are significant.")
    add("")
    add("Examples of candidates significant in multiple stresses:")
    for _, r in shared.head(15).iterrows():
        gene = clean_text(r.get("Geneid", "unknown gene"))
        detected = []
        for s in STRESSES:
            if is_sig(r, s):
                lfc = r.get(f"{s}_log2FoldChange", np.nan)
                d = "up" if pd.notna(lfc) and lfc > 0 else (
                    "down" if pd.notna(lfc) and lfc < 0 else "direction unclear"
                )
                detected.append(f"{s} {d} (log2FC={fmt_num(lfc)})")
        add(f"  - {gene}: " + "; ".join(detected) +
            f". Pattern: {r['Direction_pattern']}.")
else:
    add("No genes were marked as significant in two or more stresses in the cross-stress matrix.")

add("")
add("Interpretation of the stress patterns:")
add("- Candidates significant in multiple stresses are useful priorities for shared")
add("  stress-response mechanisms, especially where the direction of change is consistent.")
add("- A gene significant in one stress but not another may be stress-specific, but a")
add("  difference in significance alone does not prove that its effects differ statistically.")
add("- Opposite directions across stresses may indicate context-dependent responses and")
add("  should be interpreted alongside effect sizes, sample design and pathway annotations.")
add("")
add("3. Candidate regulatory genes")
add("-" * 30)
add(f"The existing TF differential-expression table contains {len(tf_sig)} significant")
add("TF entries at adjusted p < 0.05. The table's gene mappings and stress labels are")
add("used as supplied; ambiguous mappings should be resolved before making gene-specific claims.")
add("")

for stress in STRESSES:
    group = tf_sig[tf_sig["Stress"] == stress].copy()
    add(f"{stress}: {len(group)} significant TF entries.")
    if group.empty:
        continue

    if "Family" in group.columns:
        fam = group["Family"].fillna("Family not annotated").value_counts().head(5)
        if len(fam):
            add("  Most represented TF families among significant entries: " +
                "; ".join(f"{k} ({v})" for k, v in fam.items()) + ".")

    group = group.sort_values("padj")
    add("  Examples of significant TF candidates:")
    for _, r in group.head(5).iterrows():
        tf_id = clean_text(r.get("TF_ID", "TF ID unavailable"))
        mapped = clean_text(r.get("RefGen_v4_ID", ""))
        old_gene = clean_text(r.get("Gene_ID", ""))
        family = clean_text(r.get("Family", "family not annotated"))
        lfc = fmt_num(r.get("log2FoldChange"))
        padj = fmt_num(r.get("padj"))
        direction = direction_label(r.get("Direction", ""))
        mapping_note = f", mapped gene {mapped}" if mapped else ""
        old_note = f", source gene ID {old_gene}" if old_gene else ""
        add(f"    - {tf_id}{mapping_note}{old_note} ({family}): {direction}, "
            f"log2FC={lfc}, adjusted p={padj}.")
    add("")

add("How the regulatory candidates should be interpreted:")
add("- The TFs listed above are candidate regulators because their expression changes")
add("  significantly under the same stress conditions in which metabolic responses occur.")
add("- These data do not by themselves demonstrate direct TF binding to an enzyme gene,")
add("  a regulatory edge, or causation. The lists are stress-level candidates, not validated")
add("  TF-to-enzyme target pairs.")
add("- Stronger evidence would require reliable gene-ID reconciliation, gene-level")
add("  co-expression across biological replicates or samples, motif/promoter evidence,")
add("  relevant TF-target resources, or experimental validation.")
add("")
add("4. Integrated conclusion")
add("-" * 24)
add("The strongest enzyme candidates are the significantly differentially expressed genes")
add("prioritized within each stress by adjusted p-value and effect size. Genes significant")
add("across multiple stresses provide priorities for shared responses, while genes with")
add("significance confined to one stress are useful candidates for stress-associated responses.")
add("Directionally consistent multi-stress genes may participate in common response programs;")
add("genes with opposing directions may reflect stress-dependent regulation or different")
add("physiological contexts. These interpretations should be refined using functional and")
add("pathway annotations rather than expression magnitude alone.")
add("")
add("The significant TFs and enriched TF families provide a complementary set of candidate")
add("regulatory genes for follow-up. Their stress-associated expression makes them plausible")
add("participants in transcriptional responses, but the present results do not establish")
add("which TF directly regulates which metabolic enzyme gene. Accordingly, the most defensible")
add("outcome of Question 2 is a prioritized list of enzyme candidates plus a stress-specific")
add("list of TF candidates for subsequent co-expression, promoter and regulatory-network analysis.")
add("")
add("Limitations")
add("- Functional annotations are incomplete and some candidate genes may remain uncharacterized.")
add("- Gene-ID mapping differences or ambiguous mappings can affect the identity of TF candidates.")
add("- Differential expression and shared stress response are associations, not proof of causation.")
add("- A formal claim that a response is stress-specific should ideally be tested using")
add("  contrasts or interaction models that directly compare stresses.")
add("")
add("Generated from the existing project tables; no new differential-expression analysis was run.")

OUTFILE.write_text("\n".join(lines) + "\n", encoding="utf-8")

# Save useful compact tables alongside the write-up for traceability.
sig_ranked.to_csv(
    TABLES / "Q2_integrated_significant_enzyme_candidates.tsv",
    sep="\t", index=False
)
shared.to_csv(
    TABLES / "Q2_integrated_multistress_candidates.tsv",
    sep="\t", index=False
)
tf_sig.to_csv(
    TABLES / "Q2_integrated_significant_TF_candidates.tsv",
    sep="\t", index=False
)

print("Question 2 synthesis completed.")
print(f"Written answer: {OUTFILE}")
print(f"Significant enzyme-candidate rows: {len(sig_ranked)}")
print(f"Multi-stress candidate genes: {len(shared)}")
print(f"Significant TF entries: {len(tf_sig)}")
print("Supporting tables saved in:", TABLES)
