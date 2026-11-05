#!/usr/bin/env Rscript

suppressPackageStartupMessages({
    library(clusterProfiler)
    library(ggplot2)
    library(pheatmap)
    library(dplyr)
    library(tidyr)
    library(readr)
})

BASE <- path.expand("~/exerciseOne/06_pathway")
ANN  <- file.path(BASE, "annotation")
GENE <- file.path(BASE, "gene_sets")
RES  <- file.path(BASE, "results")

dir.create(RES, recursive = TRUE, showWarnings = FALSE)

# ------------------------------------------------------------
# 1. Read metabolic enzyme gene universe
# ------------------------------------------------------------

metabolic_genes <- readLines(
    file.path(ANN, "RefGen4_metabolic_enzyme_genes.txt")
)

metabolic_genes <- unique(
    metabolic_genes[nzchar(metabolic_genes)]
)

cat("Metabolic enzyme gene universe:", length(metabolic_genes), "\n")

# ------------------------------------------------------------
# 2. Read GO annotation
# ------------------------------------------------------------

gaf <- gzfile(
    file.path(ANN, "maize.B73.AGPv4.aggregate.gaf.gz"),
    "rt"
)

gaf_data <- read.delim(
    gaf,
    header = FALSE,
    comment.char = "!",
    stringsAsFactors = FALSE,
    quote = ""
)

close(gaf)

colnames(gaf_data)[1:17] <- c(
    "DB", "Gene_ID", "Gene_Symbol", "Qualifier",
    "GO_ID", "DB_Reference", "Evidence", "With_From",
    "Aspect", "Gene_Name", "Synonym", "Gene_Type",
    "Taxon", "Date", "Assigned_By", "Extension",
    "Gene_Product_Form"
)

# Keep RefGen4 genes and Biological Process annotations
bp <- gaf_data %>%
    filter(
        Aspect == "P",
        grepl("^Zm00001d", Gene_ID)
    ) %>%
    select(Gene_ID, GO_ID) %>%
    distinct()

# Only metabolic-enzyme genes
bp <- bp %>%
    filter(Gene_ID %in% metabolic_genes)

cat("Metabolic-enzyme BP annotation pairs:", nrow(bp), "\n")

# ------------------------------------------------------------
# 3. Read GO ontology
# ------------------------------------------------------------

obo_file <- file.path(ANN, "go-basic.obo")

go_terms <- readLines(
    obo_file,
    encoding = "UTF-8",
    warn = FALSE
)

# Extract GO IDs and names
go_id <- character()
go_name <- character()

current_id <- NULL
current_name <- NULL

for (line in go_terms) {

    if (line == "[Term]") {

        if (!is.null(current_id) &&
            !is.null(current_name)) {

            go_id <- c(go_id, current_id)
            go_name <- c(go_name, current_name)
        }

        current_id <- NULL
        current_name <- NULL
    }

    if (startsWith(line, "id: GO:")) {
        current_id <- sub("^id: ", "", line)
    }

    if (startsWith(line, "name: ")) {
        current_name <- sub("^name: ", "", line)
    }
}

if (!is.null(current_id) && !is.null(current_name)) {
    go_id <- c(go_id, current_id)
    go_name <- c(go_name, current_name)
}

go_names <- data.frame(
    GO_ID = go_id,
    Description = go_name,
    stringsAsFactors = FALSE
)

# ------------------------------------------------------------
# 4. Metabolic root terms
# ------------------------------------------------------------

metabolic_roots <- c(
    "GO:0008152",
    "GO:0044238",
    "GO:0044281",
    "GO:0005975",
    "GO:0006082",
    "GO:0006091",
    "GO:0006520",
    "GO:0006629"
)

# ------------------------------------------------------------
# 5. Read DEG files
# ------------------------------------------------------------

stresses <- c(
    "Cold",
    "Drought",
    "Heat",
    "Salinity"
)

all_results <- list()

for (stress in stresses) {

    file <- file.path(
        GENE,
        paste0(stress, "_metabolic_enzyme_DEGs.tsv")
    )

    dat <- read.delim(
        file,
        stringsAsFactors = FALSE,
        check.names = FALSE
    )

    # Find gene column
    possible_gene_cols <- c(
        "gene",
        "Gene",
        "Gene_ID",
        "gene_id"
    )

    gene_col <- intersect(
        possible_gene_cols,
        colnames(dat)
    )[1]

    if (is.na(gene_col)) {
        gene_col <- colnames(dat)[1]
    }

    genes <- dat[[gene_col]]

    genes <- sub("^gene:", "", genes)

    genes <- unique(
        genes[nzchar(genes)]
    )

    # --------------------------------------------------------
    # GO enrichment
    # --------------------------------------------------------

    universe <- metabolic_genes

    ego <- enricher(
        gene = genes,
        universe = universe,
        TERM2GENE = bp %>%
            select(GO_ID, Gene_ID),
        TERM2NAME = go_names,
        pAdjustMethod = "BH",
        pvalueCutoff = 0.05,
        qvalueCutoff = 0.20,
        minGSSize = 5,
        maxGSSize = 5000
    )

    if (is.null(ego)) {
        cat(stress, ": no enriched terms\n")
        next
    }

    result <- as.data.frame(ego)

    if (nrow(result) == 0) {
        cat(stress, ": no enriched terms\n")
        next
    }

    result$Stress <- stress

    result <- result %>%
        arrange(p.adjust, desc(Count))

    all_results[[stress]] <- result

    write.table(
        result,
        file.path(
            RES,
            paste0(stress, "_metabolic_pathway_enrichment.tsv")
        ),
        sep = "\t",
        quote = FALSE,
        row.names = FALSE
    )

    cat(
        stress,
        ":",
        nrow(result),
        "enriched metabolic processes\n"
    )
}

# ------------------------------------------------------------
# 6. Combine enrichment results
# ------------------------------------------------------------

combined <- bind_rows(all_results)

write.table(
    combined,
    file.path(
        RES,
        "all_stresses_metabolic_pathway_enrichment.tsv"
    ),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

# ------------------------------------------------------------
# 7. Top pathways per stress
# ------------------------------------------------------------

top_pathways <- combined %>%
    group_by(Stress) %>%
    arrange(p.adjust, desc(Count), .by_group = TRUE) %>%
    slice_head(n = 10) %>%
    ungroup()

write.table(
    top_pathways,
    file.path(
        RES,
        "top10_metabolic_processes_per_stress.tsv"
    ),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

# ------------------------------------------------------------
# 8. Shared metabolic processes
# ------------------------------------------------------------

shared <- combined %>%
    group_by(ID, Description) %>%
    summarise(
        Stress_Count = n_distinct(Stress),
        Stresses = paste(sort(unique(Stress)), collapse = ";"),
        .groups = "drop"
    ) %>%
    arrange(desc(Stress_Count), Description)

write.table(
    shared,
    file.path(
        RES,
        "shared_metabolic_processes.tsv"
    ),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

# ------------------------------------------------------------
# 9. Summary
# ------------------------------------------------------------

summary <- combined %>%
    group_by(Stress) %>%
    summarise(
        Enriched_Metabolic_Processes = n(),
        Significant_Genes = sum(Count),
        .groups = "drop"
    )

write.table(
    summary,
    file.path(
        RES,
        "metabolic_pathway_summary.tsv"
    ),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

# ------------------------------------------------------------
# 10. Plot: number of enriched metabolic processes
# ------------------------------------------------------------

p1 <- ggplot(
    summary,
    aes(
        x = Stress,
        y = Enriched_Metabolic_Processes
    )
) +
    geom_col() +
    labs(
        title = "Metabolic processes enriched across abiotic stresses",
        x = "Stress",
        y = "Number of enriched metabolic processes"
    ) +
    theme_minimal()

ggsave(
    file.path(
        RES,
        "metabolic_process_enrichment_summary.png"
    ),
    p1,
    width = 9,
    height = 6,
    dpi = 300
)

# ------------------------------------------------------------
# 11. Heatmap of top shared processes
# ------------------------------------------------------------

heat_data <- combined %>%
    group_by(ID, Description) %>%
    summarise(
        Stress_Count = n_distinct(Stress),
        .groups = "drop"
    ) %>%
    arrange(desc(Stress_Count)) %>%
    slice_head(n = 20)

heat_long <- combined %>%
    filter(
        ID %in% heat_data$ID
    ) %>%
    select(
        ID,
        Description,
        Stress,
        Count
    )

heat_matrix <- heat_long %>%
    pivot_wider(
        names_from = Stress,
        values_from = Count,
        values_fill = 0
    )

mat <- as.matrix(
    heat_matrix[, stresses, drop = FALSE]
)

rownames(mat) <- heat_matrix$Description

png(
    file.path(
        RES,
        "top_shared_metabolic_processes_heatmap.png"
    ),
    width = 1800,
    height = 1400,
    res = 200
)

pheatmap(
    mat,
    cluster_rows = TRUE,
    cluster_cols = FALSE,
    fontsize_row = 8,
    main = "Metabolic-process responses across stresses"
)

dev.off()

cat("\n==================================================\n")
cat("STEP 39 COMPLETE\n")
cat("==================================================\n")
cat("Results directory:\n")
cat(RES, "\n\n")
cat("Main files:\n")
cat(" - all_stresses_metabolic_pathway_enrichment.tsv\n")
cat(" - top10_metabolic_processes_per_stress.tsv\n")
cat(" - shared_metabolic_processes.tsv\n")
cat(" - metabolic_pathway_summary.tsv\n")
cat(" - metabolic_process_enrichment_summary.png\n")
cat(" - top_shared_metabolic_processes_heatmap.png\n")
