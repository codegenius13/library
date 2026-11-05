from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

root = Path.home() / "exerciseOne"
tables = root / "07_results/02_answer/tables"
figures = root / "07_results/02_answer/figures"
figures.mkdir(parents=True, exist_ok=True)

stresses = ["Cold", "Drought", "Heat", "Salinity"]
alpha = 0.05

ranked = pd.read_csv(
    tables / "Q2_ranked_metabolic_enzyme_candidates_all_stresses.tsv",
    sep="\t", low_memory=False
)
ranked["Stress"] = ranked["Stress"].astype(str).str.title()
ranked["padj"] = pd.to_numeric(ranked["padj"], errors="coerce")
ranked["log2FoldChange"] = pd.to_numeric(
    ranked["log2FoldChange"], errors="coerce"
)

# Figure 4: significant enzyme-candidate counts by stress.
counts = (
    ranked[ranked["padj"] < alpha]
    .groupby("Stress")["Geneid"]
    .count()
    .reindex(stresses, fill_value=0)
)

fig, ax = plt.subplots(figsize=(8, 5))
bars = ax.bar(counts.index, counts.values)
ax.bar_label(bars, padding=3)
ax.set_title("Significant metabolic enzyme candidates by stress")
ax.set_xlabel("Stress treatment")
ax.set_ylabel("Significant candidate rows (adjusted p < 0.05)")
ax.spines[["top", "right"]].set_visible(False)
fig.tight_layout()
fig.savefig(figures / "Figure4_Q2_candidate_counts.png", dpi=300)
fig.savefig(figures / "Figure4_Q2_candidate_counts.pdf")
plt.close(fig)

# Figure 5: expression heatmap for top multi-stress candidates.
cross = pd.read_csv(
    tables / "Q2_cross_stress_candidate_matrix.tsv",
    sep="\t", low_memory=False
)

for s in stresses:
    cross[f"{s}_log2FoldChange"] = pd.to_numeric(
        cross[f"{s}_log2FoldChange"], errors="coerce"
    )
    pcol = f"{s}_padj"
    cross[pcol] = pd.to_numeric(cross[pcol], errors="coerce")

    sigcol = f"{s}_Significant_candidate"
    if sigcol in cross.columns:
        cross[sigcol] = (
            cross[sigcol].astype(str).str.lower().isin(["true", "1", "yes"])
        )
    else:
        cross[sigcol] = cross[pcol] < alpha

cross["Significant_stress_count"] = sum(
    cross[f"{s}_Significant_candidate"].astype(int) for s in stresses
)

shared = cross[cross["Significant_stress_count"] >= 2].copy()

# Prioritize genes significant in the most stresses, then by strongest
# absolute fold change across the four treatments.
lfc_cols = [f"{s}_log2FoldChange" for s in stresses]
shared["Max_abs_log2FC"] = shared[lfc_cols].abs().max(axis=1)
shared = shared.sort_values(
    ["Significant_stress_count", "Max_abs_log2FC"],
    ascending=[False, False]
).head(25)

if shared.empty:
    print("No multi-stress candidates available for the heatmap.")
else:
    values = shared[lfc_cols].to_numpy(dtype=float)
    sig = shared[[f"{s}_Significant_candidate" for s in stresses]].to_numpy(
        dtype=bool
    )
    # Display only significant effects; blank cells mean not significant
    # according to the existing candidate matrix.
    values[~sig] = np.nan

    finite = np.abs(values[np.isfinite(values)])
    limit = max(float(np.max(finite)) if finite.size else 1.0, 1.0)
    masked = np.ma.masked_invalid(values)

    height = max(7, 0.32 * len(shared))
    fig, ax = plt.subplots(figsize=(9, height))
    cmap = plt.get_cmap("coolwarm").copy()
    cmap.set_bad("white")
    im = ax.imshow(
        masked, aspect="auto", cmap=cmap,
        vmin=-limit, vmax=limit, interpolation="nearest"
    )

    ax.set_xticks(range(len(stresses)))
    ax.set_xticklabels(stresses)
    ax.set_yticks(range(len(shared)))
    ax.set_yticklabels(shared["Geneid"].astype(str), fontsize=8)
    ax.set_title(
        "Top multi-stress enzyme candidates: log2 fold change\n"
        "Blank cells indicate no significant candidate flag in that stress"
    )
    ax.set_xlabel("Stress treatment")
    ax.set_ylabel("Candidate gene")
    cbar = fig.colorbar(im, ax=ax, pad=0.03)
    cbar.set_label("log2 fold change")
    fig.tight_layout()
    fig.savefig(figures / "Figure5_Q2_multistress_heatmap.png", dpi=300)
    fig.savefig(figures / "Figure5_Q2_multistress_heatmap.pdf")
    plt.close(fig)

print("Q2 figures generated:")
print(figures / "Figure4_Q2_candidate_counts.png")
print(figures / "Figure4_Q2_candidate_counts.pdf")
print(figures / "Figure5_Q2_multistress_heatmap.png")
print(figures / "Figure5_Q2_multistress_heatmap.pdf")
print("\nSignificant candidate rows by stress:")
print(counts.to_string())
print(f"\nGenes included in the heatmap: {len(shared)}")
