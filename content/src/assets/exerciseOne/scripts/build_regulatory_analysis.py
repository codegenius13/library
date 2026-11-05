import os
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = os.path.expanduser("~/exerciseOne")
MAP_FILE = os.path.join(
    ROOT, "06_pathway/annotation/regulatory_candidate_mapping/"
    "PlantTFDB_TF_mappings.tsv"
)
DE_DIR = os.path.join(ROOT, "05_DE_analysis")
OUT = os.path.join(ROOT, "07_results/02_answer")
TABLES = os.path.join(OUT, "tables")
FIGURES = os.path.join(OUT, "figures")
STRESSES = ["Cold", "Drought", "Heat", "Salinity"]
THRESHOLD = 0.05

os.makedirs(TABLES, exist_ok=True)
os.makedirs(FIGURES, exist_ok=True)

def normalize_id(value):
    value = str(value).strip()
    return value.removeprefix("gene:")

def save_figure(fig, name):
    fig.tight_layout()
    fig.savefig(os.path.join(FIGURES, name + ".png"),
                dpi=300, bbox_inches="tight")
    fig.savefig(os.path.join(FIGURES, name + ".pdf"),
                bbox_inches="tight")
    plt.close(fig)

print("Loading transcription-factor mappings...")
mapping = pd.read_csv(MAP_FILE, sep="\t", dtype=str)

required = {
    "TF_ID", "Gene_ID", "Family",
    "RefGen_v4_ID", "Mapping_status"
}
if not required.issubset(mapping.columns):
    raise ValueError("Unexpected columns in TF mapping file.")

mapping["RefGen_v4_ID"] = mapping["RefGen_v4_ID"].map(normalize_id)
mapping = mapping[
    mapping["RefGen_v4_ID"].str.startswith("Zm00001d", na=False)
].drop_duplicates()

if mapping.empty:
    raise ValueError("No valid RefGen_v4 TF mappings found.")

print("Mapping rows:", len(mapping))
print("Unique mapped genes:", mapping["RefGen_v4_ID"].nunique())

all_results = []
de_by_stress = {}

for stress in STRESSES:
    path = os.path.join(DE_DIR, f"{stress}_vs_Control_all_results.tsv")
    if not os.path.isfile(path):
        raise FileNotFoundError(path)

    de = pd.read_csv(path, sep="\t")
    needed = {"Geneid", "baseMean", "log2FoldChange", "pvalue", "padj"}
    if not needed.issubset(de.columns):
        raise ValueError(f"Unexpected columns in {path}")

    de["RefGen_v4_ID"] = de["Geneid"].map(normalize_id)
    for col in ["baseMean", "log2FoldChange", "pvalue", "padj"]:
        de[col] = pd.to_numeric(de[col], errors="coerce")

    if de["RefGen_v4_ID"].duplicated().any():
        raise ValueError(f"Duplicate normalized gene IDs in {path}")

    de_by_stress[stress] = de
    merged = mapping.merge(
        de[["RefGen_v4_ID", "baseMean", "log2FoldChange", "pvalue", "padj"]],
        on="RefGen_v4_ID", how="inner", validate="many_to_one"
    )
    merged["Stress"] = stress
    merged["Significant"] = merged["padj"].notna() & (
        merged["padj"] <= THRESHOLD
    )
    merged["Direction"] = "Not significant"
    merged.loc[
        merged["Significant"] & (merged["log2FoldChange"] > 0),
        "Direction"
    ] = "Upregulated"
    merged.loc[
        merged["Significant"] & (merged["log2FoldChange"] < 0),
        "Direction"
    ] = "Downregulated"
    all_results.append(merged)

    print(
        f"{stress}: {merged['RefGen_v4_ID'].nunique()} mapped genes; "
        f"{merged.loc[merged['Significant'], 'RefGen_v4_ID'].nunique()} "
        "significant genes"
    )

all_tf = pd.concat(all_results, ignore_index=True)
all_tf = all_tf.sort_values(["Stress", "padj"], na_position="last")
all_tf.to_csv(
    os.path.join(TABLES, "TF_DE_results_all_stresses.tsv"),
    sep="\t", index=False
)

significant = all_tf[all_tf["Significant"]].copy()
significant.to_csv(
    os.path.join(TABLES, "TF_significant_all_stresses.tsv"),
    sep="\t", index=False
)

summary_rows = []
for stress in STRESSES:
    subset = all_tf[all_tf["Stress"] == stress].drop_duplicates("RefGen_v4_ID")
    sig = subset[subset["Significant"]]
    summary_rows.append({
        "Stress": stress,
        "Mapped_TF_genes_detected": subset["RefGen_v4_ID"].nunique(),
        "Significant_TF_genes": sig["RefGen_v4_ID"].nunique(),
        "Upregulated_TF_genes": sig.loc[
            sig["Direction"] == "Upregulated", "RefGen_v4_ID"
        ].nunique(),
        "Downregulated_TF_genes": sig.loc[
            sig["Direction"] == "Downregulated", "RefGen_v4_ID"
        ].nunique()
    })

summary = pd.DataFrame(summary_rows)
summary.to_csv(
    os.path.join(TABLES, "TF_stress_summary.tsv"), sep="\t", index=False
)
print("\nTF stress summary:")
print(summary.to_string(index=False))

family_base = significant.drop_duplicates(
    ["Stress", "Family", "RefGen_v4_ID"]
)
family_summary = (
    family_base.groupby(["Stress", "Family", "Direction"])["RefGen_v4_ID"]
    .nunique().unstack(fill_value=0).reset_index()
)
for col in ["Upregulated", "Downregulated"]:
    if col not in family_summary:
        family_summary[col] = 0
family_summary = family_summary.rename(columns={
    "Upregulated": "Upregulated_TF_genes",
    "Downregulated": "Downregulated_TF_genes"
})
family_summary["Significant_TF_genes"] = (
    family_summary["Upregulated_TF_genes"]
    + family_summary["Downregulated_TF_genes"]
)
family_summary.to_csv(
    os.path.join(TABLES, "TF_family_summary.tsv"), sep="\t", index=False
)

annotations = (
    mapping.groupby("RefGen_v4_ID")
    .agg(
        TF_families=("Family", lambda x: ";".join(sorted(set(x.dropna())))),
        Old_gene_IDs=("Gene_ID", lambda x: ";".join(sorted(set(x.dropna())))),
        Mapping_statuses=(
            "Mapping_status",
            lambda x: ";".join(sorted(set(x.dropna())))
        )
    ).reset_index()
)

matrix = annotations.copy()
for stress in STRESSES:
    de = de_by_stress[stress][
        ["RefGen_v4_ID", "log2FoldChange", "padj"]
    ].copy()
    de = de[de["RefGen_v4_ID"].isin(annotations["RefGen_v4_ID"])]
    de = de.rename(columns={
        "log2FoldChange": f"{stress}_log2FC",
        "padj": f"{stress}_padj"
    })
    de[f"{stress}_significant"] = (
        de[f"{stress}_padj"].notna()
        & (de[f"{stress}_padj"] <= THRESHOLD)
    )
    matrix = matrix.merge(
        de, on="RefGen_v4_ID", how="left", validate="one_to_one"
    )

matrix.to_csv(
    os.path.join(TABLES, "TF_cross_stress_expression_matrix.tsv"),
    sep="\t", index=False
)

# Figure 1: upregulated and downregulated significant TF genes
fig, ax = plt.subplots(figsize=(8, 5))
x = list(range(len(STRESSES)))
up = summary["Upregulated_TF_genes"].tolist()
down = summary["Downregulated_TF_genes"].tolist()
ax.bar(x, up, label="Upregulated")
ax.bar(x, [-n for n in down], label="Downregulated")
ax.axhline(0, color="black", linewidth=0.8)
ax.set_xticks(x)
ax.set_xticklabels(STRESSES)
ax.set_ylabel("Unique significant TF genes")
ax.set_xlabel("Stress comparison")
ax.set_title("Stress-responsive transcription factor genes")
ax.legend(frameon=False)
save_figure(fig, "Figure1_TF_direction_by_stress")

# Figure 2: most represented significant TF families
if not family_summary.empty:
    totals = family_summary.groupby("Family")[
        "Significant_TF_genes"
    ].sum().sort_values(ascending=False)
    top = totals.head(15).index.tolist()
    plot_data = family_summary[
        family_summary["Family"].isin(top)
    ].pivot_table(
        index="Family", columns="Stress",
        values="Significant_TF_genes", aggfunc="sum", fill_value=0
    ).reindex(index=top, columns=STRESSES, fill_value=0)

    fig, ax = plt.subplots(figsize=(9, max(5, len(top) * 0.35)))
    im = ax.imshow(plot_data.values, aspect="auto")
    ax.set_yticks(range(len(plot_data.index)))
    ax.set_yticklabels(plot_data.index)
    ax.set_xticks(range(len(STRESSES)))
    ax.set_xticklabels(STRESSES)
    ax.set_xlabel("Stress comparison")
    ax.set_ylabel("TF family")
    ax.set_title("Significant TF genes across major TF families")
    fig.colorbar(im, ax=ax, label="Unique significant TF genes")
    save_figure(fig, "Figure2_TF_family_heatmap")

# Figure 3: log2 fold changes for genes significant in any stress
fc_cols = [f"{s}_log2FC" for s in STRESSES]
padj_cols = [f"{s}_padj" for s in STRESSES]
sig_cols = [f"{s}_significant" for s in STRESSES]
plot_matrix = matrix.copy()
plot_matrix[sig_cols] = plot_matrix[sig_cols].fillna(False).astype(bool)
plot_matrix = plot_matrix[plot_matrix[sig_cols].any(axis=1)].copy()

if not plot_matrix.empty:
    plot_matrix["best_padj"] = plot_matrix[padj_cols].min(axis=1)
    plot_matrix = plot_matrix.sort_values("best_padj").head(40)
    values = plot_matrix[fc_cols].to_numpy(dtype=float)
    fig, ax = plt.subplots(figsize=(8, max(5, len(plot_matrix) * 0.22)))
    im = ax.imshow(
        values, aspect="auto", interpolation="nearest",
        cmap="RdBu_r", vmin=-5, vmax=5
    )
    ax.set_xticks(range(len(STRESSES)))
    ax.set_xticklabels(STRESSES)
    ax.set_yticks(range(len(plot_matrix)))
    ax.set_yticklabels(plot_matrix["RefGen_v4_ID"], fontsize=7)
    ax.set_xlabel("Stress comparison")
    ax.set_ylabel("RefGen_v4 gene ID")
    ax.set_title("TF gene expression across stress comparisons")
    fig.colorbar(im, ax=ax, label="log2 fold change (clipped to ±5)")
    save_figure(fig, "Figure3_TF_cross_stress_heatmap")

print("\nAnalysis complete.")
print("Tables:", TABLES)
print("Figures:", FIGURES)
print("Important: co-expression does not establish direct regulation.")
