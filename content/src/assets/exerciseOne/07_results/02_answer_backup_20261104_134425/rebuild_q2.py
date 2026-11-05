#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import re
import sys
import math

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

ROOT = Path(".").resolve()

DE_DIR = ROOT / "05_DE_analysis"
ANNOTATION = ROOT / "06_pathway/annotation"
Q1 = ROOT / "07_results/01_answer"
OUT = ROOT / "07_results/02_answer"

STRESSES = ["Cold", "Drought", "Heat", "Salinity"]
PADJ_CUTOFF = 0.05
LFC_CUTOFF = 1.0

ENZYME_FILE = ANNOTATION / "RefGen4_metabolic_enzyme_genes.tsv"
TF_FILE = (
    ANNOTATION
    / "regulatory_candidate_mapping"
    / "PlantTFDB_TF_mappings.tsv"
)

Q1_ENRICHMENT = Q1 / "tables/Q1_metabolic_process_enrichment.tsv"
Q1_DIRECTION = Q1 / "tables/Q1_metabolic_process_direction.tsv"

def stop(message):
    raise RuntimeError(message)

def norm(value):
    return re.sub(r"[^a-z0-9]", "", str(value).lower())

def find_col(df, candidates, required=True, label="column"):
    lookup = {norm(c): c for c in df.columns}

    for candidate in candidates:
        key = norm(candidate)
        if key in lookup:
            return lookup[key]

    # Conservative fuzzy matching for common naming variations.
    for candidate in candidates:
        key = norm(candidate)
        matches = [c for c in df.columns if key in norm(c)]
        if len(matches) == 1:
            return matches[0]

    if required:
        stop(
            f"Could not identify {label}.\n"
            f"Expected one of: {candidates}\n"
            f"Available columns: {list(df.columns)}"
        )
    return None

def read_tsv(path):
    if not path.exists():
        stop(f"Required input file not found: {path}")
    return pd.read_csv(path, sep="\t", dtype=str, keep_default_na=False)

def clean_id(value):
    value = str(value).strip()
    value = re.sub(r"^gene:", "", value)
    return value

def numeric(series):
    return pd.to_numeric(series, errors="coerce")

def write_tsv(df, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, sep="\t", index=False, na_rep="")

def parse_gene_list(value):
    if not value:
        return []
    # GO enrichment gene lists commonly use "/" or ";" delimiters.
    parts = re.split(r"[/;,|]", str(value))
    return [clean_id(x) for x in parts if x.strip()]

def find_gene_list_column(df):
    candidates = [
        "geneID", "gene_ids", "genes", "gene_list",
        "core_enrichment", "overlap_genes", "associated_genes"
    ]
    return find_col(df, candidates, required=False)

def main():
    print("\nQ2 REBUILD: source validation")
    print("--------------------------------")

    enzyme = read_tsv(ENZYME_FILE)
    tfmap = read_tsv(TF_FILE)
    enrichment = read_tsv(Q1_ENRICHMENT)
    direction = read_tsv(Q1_DIRECTION)

    enzyme_id_col = find_col(
        enzyme,
        ["Geneid", "Gene_ID", "GeneID", "RefGen_v4_ID",
         "RefGen4_ID", "gene_id"],
        label="enzyme annotation gene ID"
    )

    tf_target_col = find_col(
        tfmap,
        ["RefGen_v4_ID", "RefGen4_ID", "RefGen_v4",
         "Target_Gene_ID", "Mapped_Gene_ID"],
        label="PlantTFDB RefGen4 target ID"
    )

    tf_family_col = find_col(
        tfmap,
        ["TF_family", "Family", "TF_Family_Name",
         "Family_Name", "TF family"],
        label="PlantTFDB TF family"
    )

    tf_old_col = find_col(
        tfmap,
        ["Old_gene_ID", "Old_Gene_ID", "PlantTFDB_ID",
         "Gene_ID", "Geneid", "GeneID"],
        required=False,
        label="PlantTFDB source gene ID"
    )

    tf_status_col = find_col(
        tfmap,
        ["Mapping_status", "Mapping_Status", "Status"],
        required=False,
        label="PlantTFDB mapping status"
    )

    go_stress_col = find_col(
        enrichment,
        ["Stress", "Condition", "Contrast"],
        label="Q1 enrichment stress"
    )
    go_id_col = find_col(
        enrichment,
        ["GO_ID", "ID", "go_id"],
        label="Q1 GO identifier"
    )
    go_name_col = find_col(
        enrichment,
        ["Description", "GO_Description", "Term",
         "Term_Name", "name"],
        label="Q1 GO description"
    )
    go_padj_col = find_col(
        enrichment,
        ["p.adjust", "padj", "Adjusted_p_value",
         "FDR", "qvalue", "p_adj"],
        label="Q1 adjusted p-value"
    )
    go_gene_col = find_gene_list_column(enrichment)

    if go_gene_col is None:
        stop(
            "The current Q1 enrichment table has no identifiable gene-list "
            "column. Candidate-to-GO associations cannot be reconstructed "
            "reliably without it. Q1 columns: "
            + str(list(enrichment.columns))
        )

    # Validate the current DESeq2 exports before touching the old Q2 directory.
    de_results = {}
    for stress in STRESSES:
        path = DE_DIR / f"{stress}_vs_Control_all_results.tsv"
        df = read_tsv(path)

        required = [
            "Geneid", "baseMean", "log2FoldChange",
            "lfcSE", "stat", "pvalue", "padj"
        ]
        missing = [c for c in required if c not in df.columns]
        if missing:
            stop(f"{path} is missing columns: {missing}")

        df["Geneid"] = df["Geneid"].map(clean_id)
        if df["Geneid"].duplicated().any():
            stop(f"Duplicate gene IDs in {path}")

        for col in required[1:]:
            df[col] = numeric(df[col])

        if len(df) != 25968:
            stop(
                f"{path.name} has {len(df)} rows; expected 25,968 "
                "based on the validated current DESeq2 object."
            )

        de_results[stress] = df.set_index("Geneid", drop=False)

    # Build the current RefGen4 enzyme gene set.
    enzyme_ids = set(
        enzyme[enzyme_id_col].map(clean_id).replace("", np.nan).dropna()
    )
    if not enzyme_ids:
        stop("No enzyme gene IDs were found in the annotation file.")

    # Derive candidates directly from current all-gene DESeq2 results.
    candidates = {}
    ranked_frames = []

    for stress in STRESSES:
        df = de_results[stress].copy()
        sig = (
            df["padj"].le(PADJ_CUTOFF)
            & df["log2FoldChange"].abs().ge(LFC_CUTOFF)
            & df.index.isin(enzyme_ids)
        )

        selected = df.loc[sig].copy()
        selected["Stress"] = stress
        selected["Direction"] = np.where(
            selected["log2FoldChange"] > 0,
            "Upregulated",
            "Downregulated"
        )
        selected["Absolute_log2FoldChange"] = (
            selected["log2FoldChange"].abs()
        )

        candidates[stress] = set(selected.index)

        selected = selected.sort_values(
            ["padj", "Absolute_log2FoldChange"],
            ascending=[True, False],
            na_position="last"
        )
        selected["Candidate_Rank"] = range(1, len(selected) + 1)

        ranked_frames.append(
            selected.reset_index(drop=True)[
                [
                    "Geneid", "Stress", "baseMean",
                    "log2FoldChange", "lfcSE", "stat",
                    "pvalue", "padj", "Direction",
                    "Absolute_log2FoldChange", "Candidate_Rank"
                ]
            ]
        )

        print(
            f"{stress}: {len(selected)} significant enzyme candidates"
        )

    # Q1 GO BP records: retain significant terms and their gene membership.
    enrichment = enrichment.copy()
    enrichment["_stress"] = enrichment[go_stress_col].astype(str).str.strip()
    enrichment["_padj"] = numeric(enrichment[go_padj_col])
    enrichment["_genes"] = enrichment[go_gene_col].map(parse_gene_list)

    go_records = []
    for _, row in enrichment.iterrows():
        stress = row["_stress"]
        if stress not in STRESSES:
            continue
        if pd.isna(row["_padj"]) or row["_padj"] > PADJ_CUTOFF:
            continue

        for gid in row["_genes"]:
            go_records.append({
                "Stress": stress,
                "Geneid": gid,
                "GO_ID": row[go_id_col],
                "GO_Description": row[go_name_col],
                "GO_adjusted_p_value": row["_padj"]
            })

    go_links = pd.DataFrame(
        go_records,
        columns=[
            "Stress", "Geneid", "GO_ID",
            "GO_Description", "GO_adjusted_p_value"
        ]
    ).drop_duplicates()

    # Only retain associations for the candidate genes in the same stress.
    candidate_long = pd.concat(ranked_frames, ignore_index=True)
    if not go_links.empty:
        candidate_go = candidate_long[
            ["Geneid", "Stress"]
        ].merge(
            go_links,
            on=["Geneid", "Stress"],
            how="left"
        )
    else:
        candidate_go = candidate_long[["Geneid", "Stress"]].copy()
        candidate_go["GO_ID"] = ""
        candidate_go["GO_Description"] = ""
        candidate_go["GO_adjusted_p_value"] = np.nan

    # Cross-stress candidate matrix.
    union_genes = sorted(set().union(*candidates.values()))
    cross_rows = []

    for gid in union_genes:
        row = {"Geneid": gid}
        detected = []

        for stress in STRESSES:
            result = de_results[stress].loc[gid]
            significant = (
                pd.notna(result["padj"])
                and result["padj"] <= PADJ_CUTOFF
                and abs(result["log2FoldChange"]) >= LFC_CUTOFF
                and gid in candidates[stress]
            )

            row[f"{stress}_log2FoldChange"] = result["log2FoldChange"]
            row[f"{stress}_padj"] = result["padj"]
            row[f"{stress}_Direction"] = (
                "Upregulated" if result["log2FoldChange"] > 0
                else "Downregulated" if result["log2FoldChange"] < 0
                else "No change"
            )
            row[f"{stress}_Significant_candidate"] = (
                "Yes" if significant else "No"
            )

            if significant:
                detected.append(stress)

        row["Number_of_stresses"] = len(detected)
        row["Detected_stresses"] = ";".join(detected)
        row["Pattern"] = (
            "All four stresses" if len(detected) == 4 else
            "Three stresses" if len(detected) == 3 else
            "Two stresses" if len(detected) == 2 else
            "One stress"
        )
        cross_rows.append(row)

    cross = pd.DataFrame(cross_rows)

    # Candidate-to-GO summary: one row per candidate/stress association.
    if not candidate_go.empty:
        candidate_go["GO_ID"] = candidate_go["GO_ID"].fillna("")
        candidate_go["GO_Description"] = (
            candidate_go["GO_Description"].fillna("")
        )

    # Build TF results from current DESeq2 results and the PlantTFDB map.
    tfmap = tfmap.copy()
    tfmap["_target"] = tfmap[tf_target_col].map(clean_id)
    tfmap["_family"] = tfmap[tf_family_col].astype(str).str.strip()
    tfmap = tfmap[
        tfmap["_target"].ne("")
        & tfmap["_family"].ne("")
    ].copy()

    if tf_status_col:
        status = tfmap[tf_status_col].astype(str).str.lower()
        # Exclude only explicitly unmapped records.
        tfmap = tfmap[~status.str.contains("unmapped|not mapped", regex=True)]

    # Keep every distinct target-family association. This avoids losing
    # valid multi-family annotations when summarising unique TF genes.
    tf_pairs = tfmap[["_target", "_family"]].drop_duplicates()
    tf_targets = set(tf_pairs["_target"])

    tf_frames = []
    for stress in STRESSES:
        df = de_results[stress].copy()
        selected = df.loc[df.index.isin(tf_targets)].copy()
        selected["Stress"] = stress
        selected["Direction"] = np.where(
            selected["log2FoldChange"] > 0,
            "Upregulated",
            "Downregulated"
        )
        selected["Significant_TF"] = (
            selected["padj"].le(PADJ_CUTOFF)
            & selected["log2FoldChange"].abs().ge(LFC_CUTOFF)
        )
        selected["RefGen_v4_ID"] = selected.index
        tf_frames.append(
            selected.reset_index(drop=True)[
                [
                    "RefGen_v4_ID", "Stress", "baseMean",
                    "log2FoldChange", "lfcSE", "stat",
                    "pvalue", "padj", "Direction",
                    "Significant_TF"
                ]
            ]
        )

    tf_all = pd.concat(tf_frames, ignore_index=True)
    tf_all = tf_all.merge(
        tf_pairs,
        left_on="RefGen_v4_ID",
        right_on="_target",
        how="left"
    ).drop(columns=["_target"])
    tf_all = tf_all.rename(columns={"_family": "TF_Family"})

    # One unique gene per stress for gene counts.
    # Keep the full gene-family mapping separately.
    tf_gene = (
        tf_all.sort_values(["Stress", "RefGen_v4_ID", "padj"])
        .drop_duplicates(["Stress", "RefGen_v4_ID"])
        .copy()
    )

    tf_sig = tf_gene[tf_gene["Significant_TF"]].copy()

    # Reattach ALL valid family associations to significant unique TF genes.
    tf_sig_pairs = (
        tf_sig[["Stress", "RefGen_v4_ID"]]
        .merge(
            tf_pairs,
            left_on="RefGen_v4_ID",
            right_on="_target",
            how="left"
        )
        .drop(columns=["_target"])
        .drop_duplicates()
        .rename(columns={"_family": "TF_Family"})
    )

    tf_stress_summary = (
        tf_gene.groupby("Stress")
        .agg(
            Mapped_TF_genes=("RefGen_v4_ID", "nunique"),
            Significant_TF_genes=("Significant_TF", "sum"),
            Upregulated_TF_genes=(
                "Direction", lambda x: (x == "Upregulated").sum()
            ),
            Downregulated_TF_genes=(
                "Direction", lambda x: (x == "Downregulated").sum()
            )
        )
        .reset_index()
    )

    tf_family_summary = (
        tf_sig_pairs.groupby(["Stress", "TF_Family"])
        .agg(
            Unique_TF_genes=("RefGen_v4_ID", "nunique")
        )
        .reset_index()
        .sort_values(
            ["Stress", "Unique_TF_genes"],
            ascending=[True, False]
        )
    )

    tf_family_unique = (
        tf_sig_pairs.groupby("TF_Family")
        .agg(
            Unique_TF_genes=("RefGen_v4_ID", "nunique")
        )
        .reset_index()
        .sort_values("Unique_TF_genes", ascending=False)
    )

    # Prepare final gene-level candidate summary.
    summary = cross[
        ["Geneid", "Number_of_stresses", "Detected_stresses", "Pattern"]
    ].copy()

    if not candidate_go.empty:
        go_counts = (
            candidate_go.dropna(subset=["GO_ID"])
            .loc[lambda x: x["GO_ID"].astype(str).ne("")]
            .groupby("Geneid")["GO_ID"].nunique()
            .rename("Number_of_associated_enriched_GO_processes")
        )
        summary = summary.merge(go_counts, on="Geneid", how="left")

    summary["Number_of_associated_enriched_GO_processes"] = (
        summary["Number_of_associated_enriched_GO_processes"]
        .fillna(0).astype(int)
    )

    # Create backup only after all source files and key columns validate.
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup = OUT.parent / f"02_answer_backup_{timestamp}"
    shutil.copytree(
        OUT,
        backup,
        ignore=shutil.ignore_patterns("__pycache__", "*.pyc")
    )
    print(f"\nPrevious Q2 directory backed up to: {backup}")

    # Rebuild the output subdirectories without deleting the rebuild script.
    for subdir in ["tables", "figures", "logs", "data"]:
        path = OUT / subdir
        if path.exists():
            shutil.rmtree(path)
        path.mkdir(parents=True, exist_ok=True)

    tables = OUT / "tables"
    figures = OUT / "figures"
    logs = OUT / "logs"

    # Enzyme candidate tables.
    for stress in STRESSES:
        write_tsv(
            candidate_long[candidate_long["Stress"] == stress],
            tables / f"Q2_{stress}_ranked_metabolic_enzyme_candidates.tsv"
        )

    write_tsv(
        candidate_long,
        tables / "Q2_ranked_metabolic_enzyme_candidates_all_stresses.tsv"
    )
    write_tsv(
        cross,
        tables / "Q2_cross_stress_candidate_matrix.tsv"
    )
    write_tsv(
        summary,
        tables / "Q2_candidate_stress_summary.tsv"
    )
    write_tsv(
        candidate_go,
        tables / "Q2_candidate_to_GO_processes.tsv"
    )

    # Explicitly named integrated candidate tables for continuity.
    write_tsv(
        candidate_long,
        tables / "Q2_integrated_significant_enzyme_candidates.tsv"
    )
    write_tsv(
        summary[summary["Number_of_stresses"] >= 2],
        tables / "Q2_integrated_multistress_candidates.tsv"
    )

    # TF tables.
    write_tsv(
        tf_all,
        tables / "TF_DE_results_all_stresses.tsv"
    )
    write_tsv(
        tf_sig,
        tables / "TF_significant_all_stresses.tsv"
    )
    write_tsv(
        tf_gene,
        tables / "TF_unique_gene_stress_summary.tsv"
    )
    write_tsv(
        tf_stress_summary,
        tables / "TF_stress_summary.tsv"
    )
    write_tsv(
        tf_family_summary,
        tables / "TF_family_summary.tsv"
    )
    write_tsv(
        tf_family_unique,
        tables / "TF_unique_gene_family_summary.tsv"
    )
    write_tsv(
        tf_pairs.rename(columns={
            "_target": "RefGen_v4_ID",
            "_family": "TF_Family"
        }),
        tables / "Q2_TF_gene_family_associations.tsv"
    )

    # TF cross-stress expression matrix, one row per mapped RefGen4 target.
    tf_matrix = tf_gene.pivot(
        index="RefGen_v4_ID",
        columns="Stress",
        values="log2FoldChange"
    ).reset_index()
    tf_matrix.columns.name = None
    write_tsv(
        tf_matrix,
        tables / "TF_cross_stress_expression_matrix.tsv"
    )
    write_tsv(
        tf_sig_pairs,
        tables / "Q2_TF_significant_gene_family_associations.tsv"
    )

    # Figure 1: TF direction by stress.
    plt.figure(figsize=(9, 5))
    tf_direction = (
        tf_sig.groupby(["Stress", "Direction"])
        .size()
        .unstack(fill_value=0)
        .reindex(STRESSES)
    )
    tf_direction.plot(kind="bar", ax=plt.gca())
    plt.xlabel("Stress")
    plt.ylabel("Significant mapped TF genes")
    plt.title("Direction of significant TF expression by stress")
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(figures / "Figure1_TF_direction_by_stress.png", dpi=300)
    plt.savefig(figures / "Figure1_TF_direction_by_stress.pdf")
    plt.close()

    # Figure 2: TF family heatmap.
    if not tf_family_summary.empty:
        top_families = (
            tf_family_summary.groupby("TF_Family")["Unique_TF_genes"]
            .sum()
            .sort_values(ascending=False)
            .head(20)
            .index
        )
        heat = (
            tf_family_summary[
                tf_family_summary["TF_Family"].isin(top_families)
            ]
            .pivot(
                index="TF_Family",
                columns="Stress",
                values="Unique_TF_genes"
            )
            .reindex(columns=STRESSES)
            .fillna(0)
        )

        plt.figure(figsize=(9, max(5, len(heat) * 0.35)))
        plt.imshow(heat.values, aspect="auto")
        plt.colorbar(label="Unique significant TF genes")
        plt.xticks(range(len(heat.columns)), heat.columns)
        plt.yticks(range(len(heat.index)), heat.index)
        plt.title("Significant TF family distribution across stresses")
        plt.tight_layout()
        plt.savefig(figures / "Figure2_TF_family_heatmap.png", dpi=300)
        plt.savefig(figures / "Figure2_TF_family_heatmap.pdf")
        plt.close()

    # Figure 3: TF cross-stress expression heatmap.
    if not tf_matrix.empty:
        plot_matrix = tf_matrix.set_index("RefGen_v4_ID")
        plot_matrix = plot_matrix.reindex(columns=STRESSES)
        plot_matrix = plot_matrix.dropna(how="all")

        # Plot a manageable set of TFs with the largest maximum
        # absolute fold change across the four stress contrasts.
        if not plot_matrix.empty:
            selected_ids = (
                plot_matrix.abs().max(axis=1)
                .sort_values(ascending=False)
                .head(50)
                .index
            )
            plot_matrix = plot_matrix.loc[selected_ids]

            plt.figure(figsize=(9, max(6, len(plot_matrix) * 0.18)))
            plt.imshow(plot_matrix.values, aspect="auto")
            plt.colorbar(label="log2 fold change")
            plt.xticks(range(len(STRESSES)), STRESSES)
            plt.yticks(
                range(len(plot_matrix.index)),
                plot_matrix.index,
                fontsize=6
            )
            plt.title("TF expression patterns across stress contrasts")
            plt.tight_layout()
            plt.savefig(
                figures / "Figure3_TF_cross_stress_heatmap.png",
                dpi=300
            )
            plt.savefig(
                figures / "Figure3_TF_cross_stress_heatmap.pdf"
            )
            plt.close()

    # Figure 4: metabolic enzyme candidate counts.
    plt.figure(figsize=(9, 5))
    counts = candidate_long.groupby("Stress").size().reindex(STRESSES)
    counts.plot(kind="bar", ax=plt.gca())
    plt.ylabel("Significant metabolic enzyme candidate genes")
    plt.xlabel("Stress")
    plt.title("Metabolic enzyme candidates by stress")
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(figures / "Figure4_Q2_candidate_counts.png", dpi=300)
    plt.savefig(figures / "Figure4_Q2_candidate_counts.pdf")
    plt.close()

    # Audit log and final written answer.
    log = [
        "QUESTION 2 REBUILD AUDIT",
        f"Run date: {datetime.now().isoformat(timespec='seconds')}",
        f"DESeq2 genes per contrast: 25968",
        f"Significance criteria: padj <= {PADJ_CUTOFF}; "
        f"abs(log2FoldChange) >= {LFC_CUTOFF}",
        f"Enzyme annotation genes: {len(enzyme_ids)}",
        f"PlantTFDB target-family associations: {len(tf_pairs)}",
        f"Unique mapped RefGen4 TF targets: {len(tf_targets)}",
        "",
        "Metabolic enzyme candidate counts:"
    ]

    for stress in STRESSES:
        log.append(f"  {stress}: {len(candidates[stress])}")

    log += [
        "",
        f"Unique enzyme candidate genes: {len(union_genes)}",
        f"Candidate-stress records: {len(candidate_long)}",
        f"Candidate-to-GO association rows: {len(candidate_go)}",
        "",
        "Candidates detected in:"
    ]

    for n in [1, 2, 3, 4]:
        log.append(
            f"  {n} stress(es): "
            f"{int((summary['Number_of_stresses'] == n).sum())}"
        )

    log += [
        "",
        "TF gene counts by stress:",
        tf_stress_summary.to_string(index=False),
        "",
        "Interpretation cautions:",
        "- Candidate ranking is based on adjusted p-value and absolute "
        "log2 fold change; it is a prioritisation procedure, not a "
        "validated biological score.",
        "- GO associations indicate membership in genes reported for "
        "significantly enriched Q1 GO BP terms.",
        "- Absence from an enriched GO term does not imply absence of "
        "biological function.",
        "- TF differential expression and annotation do not demonstrate "
        "direct regulation of metabolic enzyme genes.",
        "- Co-expression or shared stress responses are associations, "
        "not proof of regulatory causation.",
        "- Each stress comparison is evaluated independently against control.",
        "- The study has two biological replicates per condition; this "
        "limits statistical power and generalisation."
    ]

    (logs / "Q2_rebuild_audit.txt").write_text(
        "\n".join(log) + "\n", encoding="utf-8"
    )

    print("\nQ2 rebuild completed.")
    print(f"Backup: {backup}")
    print(f"Tables: {tables}")
    print(f"Figures: {figures}")
    print(f"Audit: {logs / 'Q2_rebuild_audit.txt'}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("\nQ2 REBUILD STOPPED:", exc, file=sys.stderr)
        print(
            "The existing Q2 outputs have not been replaced if validation "
            "failed before the backup/rebuild stage.",
            file=sys.stderr
        )
        sys.exit(1)
