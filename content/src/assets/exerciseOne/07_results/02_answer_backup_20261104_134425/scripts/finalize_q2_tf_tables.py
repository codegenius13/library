import csv
from collections import defaultdict
from pathlib import Path

ROOT = Path("07_results/02_answer")
TABLES = ROOT / "tables"
MAPPING = Path(
    "06_pathway/annotation/regulatory_candidate_mapping/"
    "PlantTFDB_TF_mappings.tsv"
)

def read_tsv(path):
    with open(path, newline="", encoding="utf-8-sig") as fh:
        return list(csv.DictReader(fh, delimiter="\t"))

def write_tsv(path, rows, fields):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(
            fh, fieldnames=fields, delimiter="\t",
            extrasaction="ignore"
        )
        writer.writeheader()
        writer.writerows(rows)

def number(row, key):
    try:
        return float(row.get(key, ""))
    except (TypeError, ValueError):
        return float("inf")

tf_file = TABLES / "TF_significant_all_stresses.tsv"
if not tf_file.exists():
    raise SystemExit(f"Missing required file: {tf_file}")

tf_rows = read_tsv(tf_file)
if not tf_rows:
    raise SystemExit(f"No data rows in {tf_file}")

required = {
    "Stress", "TF_ID", "Gene_ID", "Family",
    "RefGen_v4_ID", "Mapping_status", "padj",
    "log2FoldChange"
}
missing = required - set(tf_rows[0])
if missing:
    raise SystemExit(f"Missing TF columns: {sorted(missing)}")

# Keep only records with a RefGen_v4 target and explicitly unique mapping.
# Resolve multiple source records for the same target/stress by retaining
# the record with the smallest adjusted p-value.
eligible = [
    r for r in tf_rows
    if r.get("Mapping_status", "").lower() == "unique"
    and r.get("RefGen_v4_ID", "").strip()
    and r.get("Stress", "").strip()
]

best = {}
for r in eligible:
    key = (r["Stress"], r["RefGen_v4_ID"])
    if key not in best or number(r, "padj") < number(best[key], "padj"):
        best[key] = r

clean = sorted(
    best.values(),
    key=lambda r: (
        r["Stress"], number(r, "padj"), r["RefGen_v4_ID"]
    )
)

clean_path = TABLES / "Q2_TF_candidates_deduplicated_RefGen_v4.tsv"
write_tsv(clean_path, clean, list(tf_rows[0].keys()))

# Summaries are calculated from one record per mapped gene per stress.
stress_counts = defaultdict(lambda: {
    "Mapped_significant_TF_genes": 0,
    "Upregulated_TF_genes": 0,
    "Downregulated_TF_genes": 0
})
family_counts = defaultdict(lambda: {
    "Upregulated_TF_genes": 0,
    "Downregulated_TF_genes": 0,
    "Significant_TF_genes": 0
})

for r in clean:
    stress = r["Stress"]
    family = r.get("Family", "").strip() or "Unknown"
    direction = (
        "Upregulated" if number(r, "log2FoldChange") > 0
        else "Downregulated"
    )
    stress_counts[stress]["Mapped_significant_TF_genes"] += 1
    stress_counts[stress][f"{direction}_TF_genes"] += 1

    fkey = (stress, family)
    family_counts[fkey]["Significant_TF_genes"] += 1
    family_counts[fkey][f"{direction}_TF_genes"] += 1

stress_summary = []
for stress in sorted(stress_counts):
    row = {"Stress": stress, **stress_counts[stress]}
    stress_summary.append(row)

write_tsv(
    TABLES / "Q2_TF_unique_gene_stress_summary.tsv",
    stress_summary,
    [
        "Stress", "Mapped_significant_TF_genes",
        "Upregulated_TF_genes", "Downregulated_TF_genes"
    ]
)

family_summary = []
for (stress, family), counts in sorted(family_counts.items()):
    family_summary.append({
        "Stress": stress,
        "Family": family,
        **counts
    })

write_tsv(
    TABLES / "Q2_TF_unique_gene_family_summary.tsv",
    family_summary,
    [
        "Stress", "Family", "Downregulated_TF_genes",
        "Upregulated_TF_genes", "Significant_TF_genes"
    ]
)

# Summarize mapping ambiguity separately.
mapping_rows = read_tsv(MAPPING)
mapping_status = defaultdict(int)
for r in mapping_rows:
    mapping_status[r.get("Mapping_status", "missing")] += 1

print("=== Cleaned TF counts: one RefGen_v4 gene per stress ===")
for r in stress_summary:
    print(
        f'{r["Stress"]}: {r["Mapped_significant_TF_genes"]} unique '
        f'TF genes; {r["Upregulated_TF_genes"]} up; '
        f'{r["Downregulated_TF_genes"]} down'
    )

print("\n=== Mapping status in the full mapping table ===")
for status, count in sorted(mapping_status.items()):
    print(f"{status}: {count}")

print("\n=== Deduplication ===")
print(f"Original significant TF rows: {len(tf_rows)}")
print(f"Rows with unique mapping and RefGen_v4 ID: {len(eligible)}")
print(f"Unique RefGen_v4 gene-by-stress records retained: {len(clean)}")
print(f"Removed repeated mapped-gene records: {len(eligible) - len(clean)}")

print("\n=== Output files ===")
print(clean_path)
print(TABLES / "Q2_TF_unique_gene_stress_summary.tsv")
print(TABLES / "Q2_TF_unique_gene_family_summary.tsv")

# Check integrated enzyme table and overlap with mapped TF genes.
enzyme_file = TABLES / "Q2_integrated_significant_enzyme_candidates.tsv"
if enzyme_file.exists():
    enzymes = read_tsv(enzyme_file)
    print(f"\n=== Integrated enzyme candidate table: {len(enzymes)} rows ===")
    if enzymes:
        print("Columns:", " | ".join(enzymes[0].keys()))
        print("Example:", enzymes[0])

        gene_columns = [
            c for c in enzymes[0]
            if c.lower() in {
                "gene_id", "gene", "geneid", "refgen_v4_id",
                "gene_id_refgen_v4"
            }
        ]
        if gene_columns:
            col = gene_columns[0]
            enzyme_ids = {
                r.get(col, "").strip()
                for r in enzymes
                if r.get(col, "").strip()
            }
            tf_ids = {r["RefGen_v4_ID"] for r in clean}
            overlap = enzyme_ids & tf_ids
            print(f"Enzyme candidate IDs found in column {col}: {len(enzyme_ids)}")
            print(f"Overlap with significant TF gene IDs: {len(overlap)}")
            print(
                "Note: overlap means a gene is present in both candidate sets; "
                "it does not establish TF-to-enzyme regulation."
            )
        else:
            print("Could not automatically identify the enzyme gene-ID column.")
else:
    print(f"\nIntegrated enzyme table not found: {enzyme_file}")

print("\nCompleted. Original analysis tables were not overwritten.")
