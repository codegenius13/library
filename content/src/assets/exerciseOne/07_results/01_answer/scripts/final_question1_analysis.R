suppressPackageStartupMessages({
    library(clusterProfiler)
    library(dplyr)
    library(tidyr)
    library(ggplot2)
    library(pheatmap)
})

BASE <- path.expand("~/exerciseOne")
ANSWER <- file.path(BASE, "07_results/01_answer")

ANN <- file.path(BASE, "06_pathway/annotation")
GENE <- file.path(BASE, "06_pathway/gene_sets")

DATA <- file.path(ANSWER, "data")
FIG <- file.path(ANSWER, "figures")
TAB <- file.path(ANSWER, "tables")

dir.create(DATA, recursive=TRUE, showWarnings=FALSE)
dir.create(FIG, recursive=TRUE, showWarnings=FALSE)
dir.create(TAB, recursive=TRUE, showWarnings=FALSE)

stresses <- c("Cold", "Drought", "Heat", "Salinity")

# ============================================================
# 1. Read existing metabolic BP annotations
# ============================================================

term2gene <- read.delim(
    file.path(DATA, "metabolic_BP_TERM2GENE.tsv"),
    stringsAsFactors=FALSE,
    check.names=FALSE
)

term2name <- read.delim(
    file.path(DATA, "metabolic_BP_TERM2NAME.tsv"),
    stringsAsFactors=FALSE,
    check.names=FALSE
)

stopifnot(
    all(c("GO_ID", "Gene_ID") %in% colnames(term2gene)),
    all(c("GO_ID", "Description") %in% colnames(term2name))
)

clean_ids <- function(x) {
    x <- trimws(as.character(x))
    x <- sub("^gene:", "", x)
    x <- x[!is.na(x) & x != ""]
    unique(x)
}

term2gene$Gene_ID <- sub(
    "^gene:",
    "",
    trimws(as.character(term2gene$Gene_ID))
)

term2gene$GO_ID <- as.character(term2gene$GO_ID)

term2name$GO_ID <- as.character(term2name$GO_ID)

term2gene <- term2gene %>%
    filter(
        !is.na(GO_ID),
        !is.na(Gene_ID),
        GO_ID != "",
        Gene_ID != ""
    ) %>%
    distinct(GO_ID, Gene_ID)

metabolic_genes <- clean_ids(
    readLines(
        file.path(ANN, "RefGen4_metabolic_enzyme_genes.txt")
    )
)

annotation_genes <- clean_ids(term2gene$Gene_ID)

# ============================================================
# 2. Read corrected DEGs and construct the verified background

deg_data <- list()

for (stress in stresses) {

    input_file <- file.path(
        GENE,
        paste0(stress, "_metabolic_enzyme_DEGs.tsv")
    )

    if (!file.exists(input_file)) {
        stop("Missing DEG file: ", input_file)
    }

    dat <- read.delim(
        input_file,
        stringsAsFactors=FALSE,
        check.names=FALSE
    )

    gene_candidates <- c(
        "gene", "Gene", "Geneid", "GeneID",
        "Gene_ID", "gene_id", "geneid"
    )

    gene_col <- intersect(
        gene_candidates,
        colnames(dat)
    )[1]

    if (is.na(gene_col)) {
        stop("Cannot identify gene ID column in: ", input_file)
    }

    if (!"log2FoldChange" %in% colnames(dat)) {
        stop("Missing log2FoldChange in: ", input_file)
    }

    dat$Gene_Clean <- sub(
        "^gene:",
        "",
        trimws(as.character(dat[[gene_col]]))
    )

    dat$log2FoldChange <- as.numeric(dat$log2FoldChange)

    deg_data[[stress]] <- dat
}

# Use the intersection of the existing metabolic gene list
# and the genes represented in the existing metabolic BP annotation.
# This is the verified background of 12,051 genes.

background_genes <- intersect(
    metabolic_genes,
    annotation_genes
)

cat("\nQ1 enrichment background\n")
cat("------------------------\n")
cat("Metabolic genes:", length(metabolic_genes), "\n")
cat("GO-annotated genes:", length(annotation_genes), "\n")
cat("Final background:", length(background_genes), "\n")

if (length(background_genes) != 12051) {
    stop(
        "Expected 12,051 genes in the verified enrichment background; found ",
        length(background_genes),
        ". Stopping to prevent incorrect enrichment."
    )
}

writeLines(
    sort(background_genes),
    file.path(DATA, "Q1_final_enrichment_background.txt")
)

# ============================================================
# 3. Perform enrichment and pathway direction analysis
# ============================================================

all_enrichment <- list()
all_direction <- list()

for (stress in stresses) {

    dat <- deg_data[[stress]]

    genes <- intersect(
        clean_ids(dat$Gene_Clean),
        background_genes
    )

    cat(
        "\n", stress,
        "- significant metabolic DEGs in background: ",
        length(genes), "\n",
        sep=""
    )

    if (length(genes) == 0) {
        warning("No eligible DEGs for ", stress)
        next
    }

    ego <- enricher(
        gene=genes,
        universe=background_genes,
        TERM2GENE=term2gene,
        TERM2NAME=term2name,
        pAdjustMethod="BH",
        pvalueCutoff=0.05,
        qvalueCutoff=0.20,
        minGSSize=5,
        maxGSSize=5000
    )

    if (is.null(ego)) {
        next
    }

    enr <- as.data.frame(ego)

    if (nrow(enr) == 0) {
        next
    }

    enr$Stress <- stress
    all_enrichment[[stress]] <- enr

    direction_rows <- list()

    for (i in seq_len(nrow(enr))) {

        pathway_genes <- unlist(
            strsplit(enr$geneID[i], "/")
        )

        pathway_dat <- dat %>%
            filter(Gene_Clean %in% pathway_genes)

        fc <- pathway_dat$log2FoldChange
        fc <- fc[is.finite(fc)]

        if (length(fc) == 0) {
            next
        }

        positive <- sum(fc > 0)
        negative <- sum(fc < 0)

        positive_fraction <- positive / length(fc)
        negative_fraction <- negative / length(fc)

        median_fc <- median(fc)
        mean_fc <- mean(fc)

        coherence <- max(
            positive_fraction,
            negative_fraction
        )

        if (positive_fraction >= 0.70) {
            response_direction <- "Predominantly upregulated"
        } else if (negative_fraction >= 0.70) {
            response_direction <- "Predominantly downregulated"
        } else {
            response_direction <- "Mixed"
        }

        direction_rows[[length(direction_rows) + 1]] <- data.frame(
            Stress=stress,
            GO_ID=enr$ID[i],
            Description=enr$Description[i],
            Gene_Count=length(fc),
            Positive_Genes=positive,
            Negative_Genes=negative,
            Median_log2FC=median_fc,
            Mean_log2FC=mean_fc,
            Coherence=coherence,
            Direction=response_direction,
            Adjusted_P=enr$p.adjust[i]
        )
    }

    if (length(direction_rows) > 0) {
        all_direction[[stress]] <- bind_rows(direction_rows)
    }
}

# ============================================================
# 4. Combine and save enrichment results
# ============================================================

if (length(all_enrichment) == 0) {
    stop("No enriched metabolic processes were identified.")
}

enrichment <- bind_rows(all_enrichment)

direction <- if (length(all_direction) > 0) {
    bind_rows(all_direction)
} else {
    stop("No pathway direction results were generated.")
}

write.table(
    enrichment,
    file.path(TAB, "Q1_metabolic_process_enrichment.tsv"),
    sep="\t",
    quote=FALSE,
    row.names=FALSE
)

write.table(
    direction,
    file.path(TAB, "Q1_metabolic_process_direction.tsv"),
    sep="\t",
    quote=FALSE,
    row.names=FALSE
)

# ============================================================
# 5. Summary by stress
# ============================================================

summary <- data.frame(
    Stress=stresses,
    Enriched_Metabolic_Processes=vapply(
        stresses,
        function(s) sum(enrichment$Stress == s),
        integer(1)
    )
)

write.table(
    summary,
    file.path(TAB, "Q1_enrichment_summary.tsv"),
    sep="\t",
    quote=FALSE,
    row.names=FALSE
)

# ============================================================
# 6. Shared / stress-specific classification
# ============================================================

presence <- enrichment %>%
    distinct(
        GO_ID=ID,
        Description,
        Stress
    )

classification <- presence %>%
    group_by(GO_ID, Description) %>%
    summarise(
        Stress_Count=n_distinct(Stress),
        Stresses=paste(
            sort(unique(Stress)),
            collapse="; "
        ),
        .groups="drop"
    ) %>%
    mutate(
        Response_Class=case_when(
            Stress_Count == 1 ~ "Stress-specific",
            Stress_Count == 4 ~ "Shared across all four stresses",
            TRUE ~ "Shared across multiple stresses"
        )
    )

write.table(
    classification,
    file.path(TAB, "Q1_shared_stress_specific_processes.tsv"),
    sep="\t",
    quote=FALSE,
    row.names=FALSE
)

# ============================================================
# 7. Cross-stress direction matrix
# ============================================================

direction_matrix <- direction %>%
    select(
        GO_ID,
        Description,
        Stress,
        Median_log2FC
    ) %>%
    pivot_wider(
        names_from=Stress,
        values_from=Median_log2FC
    )

for (s in stresses) {
    if (!s %in% colnames(direction_matrix)) {
        direction_matrix[[s]] <- NA_real_
    }
}

direction_matrix <- direction_matrix %>%
    select(GO_ID, Description, all_of(stresses))

write.table(
    direction_matrix,
    file.path(TAB, "Q1_cross_stress_direction_matrix.tsv"),
    sep="\t",
    quote=FALSE,
    row.names=FALSE
)

# ============================================================
# FIGURE 1: Number of enriched metabolic processes
# ============================================================

p1 <- ggplot(
    summary,
    aes(x=Stress, y=Enriched_Metabolic_Processes)
) +
    geom_col() +
    geom_text(
        aes(label=Enriched_Metabolic_Processes),
        vjust=-0.4,
        size=4
    ) +
    labs(
        title="Enriched metabolic processes across abiotic stresses",
        x=NULL,
        y="Number of enriched metabolic processes"
    ) +
    theme_classic(base_size=13)

ggsave(
    file.path(FIG, "Figure_1_enriched_metabolic_processes.png"),
    p1, width=8, height=6, dpi=600
)

ggsave(
    file.path(FIG, "Figure_1_enriched_metabolic_processes.pdf"),
    p1, width=8, height=6
)

# ============================================================
# FIGURE 2: Top 15 metabolic processes
# ============================================================

top <- enrichment %>%
    group_by(Stress) %>%
    arrange(p.adjust, .by_group=TRUE) %>%
    slice_head(n=15) %>%
    ungroup()

p2 <- ggplot(
    top,
    aes(
        x=Count,
        y=reorder(Description, Count)
    )
) +
    geom_point(aes(size=Count)) +
    facet_wrap(~Stress, scales="free_y") +
    labs(
        title="Top enriched metabolic processes by stress",
        x="Metabolic enzyme DEGs",
        y=NULL
    ) +
    theme_classic(base_size=11)

ggsave(
    file.path(FIG, "Figure_2_top_metabolic_processes.png"),
    p2, width=13, height=10, dpi=600
)

ggsave(
    file.path(FIG, "Figure_2_top_metabolic_processes.pdf"),
    p2, width=13, height=10
)

# ============================================================
# FIGURE 3: Cross-stress direction heatmap
# ============================================================

top_shared <- classification %>%
    filter(Stress_Count >= 2) %>%
    arrange(desc(Stress_Count)) %>%
    slice_head(n=25)

hm <- direction_matrix %>%
    filter(GO_ID %in% top_shared$GO_ID)

if (nrow(hm) > 0) {

    mat <- as.matrix(hm[, stresses, drop=FALSE])
    rownames(mat) <- make.unique(hm$Description)

    png(
        file.path(
            FIG,
            "Figure_3_cross_stress_metabolic_direction_heatmap.png"
        ),
        width=2400,
        height=1900,
        res=250
    )

    pheatmap(
        mat,
        cluster_rows=nrow(mat) > 1,
        cluster_cols=FALSE,
        fontsize_row=8,
        fontsize_col=11,
        main="Cross-stress metabolic transcriptional responses",
        border_color=NA
    )

    dev.off()

} else {
    warning("No shared enriched processes available for Figure 3.")
}

# ============================================================
# FIGURE 4: Directional coherence
# ============================================================

coherence_summary <- direction %>%
    group_by(Stress, Direction) %>%
    summarise(
        Processes=n(),
        .groups="drop"
    )

p4 <- ggplot(
    coherence_summary,
    aes(x=Stress, y=Processes)
) +
    geom_col(aes(fill=Direction), position="stack") +
    labs(
        title="Direction of enriched metabolic-process responses",
        x=NULL,
        y="Number of enriched processes",
        fill="Response direction"
    ) +
    theme_classic(base_size=13)

ggsave(
    file.path(FIG, "Figure_4_metabolic_response_direction.png"),
    p4, width=9, height=6, dpi=600
)

ggsave(
    file.path(FIG, "Figure_4_metabolic_response_direction.pdf"),
    p4, width=9, height=6
)

# ============================================================
# FINAL SUMMARY
# ============================================================

cat("\n")
cat("==================================================\n")
cat("QUESTION 1 ANALYSIS COMPLETE\n")
cat("==================================================\n\n")

cat("Final enrichment background:", length(background_genes), "\n")
cat("Enrichment records:", nrow(enrichment), "\n\n")

print(summary)

cat("\nResponse classifications:\n")

print(
    classification %>%
        count(Response_Class)
)

cat("\nFinal results located at:\n")
cat(ANSWER, "\n")
