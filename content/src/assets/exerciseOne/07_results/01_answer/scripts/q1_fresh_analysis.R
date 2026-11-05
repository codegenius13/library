#!/usr/bin/env Rscript

# ============================================================
# QUESTION 1: FRESH ANALYSIS
# Maize metabolic enzyme responses to drought, salinity,
# heat and cold
#
# Uses:
#   - Corrected metabolic-enzyme DEG files from 06_pathway
#   - RefGen4 metabolic enzyme gene list
#   - Existing metabolic GO BP TERM2GENE / TERM2NAME
#   - Existing DESeq2 object
#
# Does NOT modify:
#   - Original annotation files
#   - Corrected DEG files
#   - Existing research write-up
#   - DESeq2 object
# ============================================================

options(stringsAsFactors = FALSE, scipen = 999)

suppressPackageStartupMessages({
    library(DESeq2)
    library(clusterProfiler)
    library(dplyr)
    library(tidyr)
    library(readr)
    library(ggplot2)
    library(pheatmap)
})

# ------------------------------------------------------------
# 1. PATHS AND SETTINGS
# ------------------------------------------------------------

BASE <- path.expand("~/exerciseOne")

ANSWER <- file.path(BASE, "07_results/01_answer")
DATA   <- file.path(ANSWER, "data")
FIG    <- file.path(ANSWER, "figures")
TAB    <- file.path(ANSWER, "tables")
QC     <- file.path(ANSWER, "qc_sample_level")
QC_FIG <- file.path(QC, "figures")
QC_TAB <- file.path(QC, "tables")
QC_LOG <- file.path(QC, "logs")

ANN    <- file.path(BASE, "06_pathway/annotation")
GENE   <- file.path(BASE, "06_pathway/gene_sets")
DDS_FILE <- file.path(BASE, "05_DE_analysis/maize_DESeq2.rds")

STRESSES <- c("Cold", "Drought", "Heat", "Salinity")

DEG_FILES <- file.path(
    GENE,
    paste0(STRESSES, "_metabolic_enzyme_DEGs.tsv")
)
names(DEG_FILES) <- STRESSES

METABOLIC_FILE <- file.path(
    ANN, "RefGen4_metabolic_enzyme_genes.txt"
)

TERM2GENE_FILE <- file.path(
    DATA, "metabolic_BP_TERM2GENE.tsv"
)

TERM2NAME_FILE <- file.path(
    DATA, "metabolic_BP_TERM2NAME.tsv"
)

ALPHA <- 0.05
MIN_GS_SIZE <- 5
MAX_GS_SIZE <- 5000
DIRECTION_THRESHOLD <- 0.70

for (d in c(FIG, TAB, QC_FIG, QC_TAB, QC_LOG)) {
    dir.create(d, recursive = TRUE, showWarnings = FALSE)
}

# ------------------------------------------------------------
# 2. VALIDATE INPUT FILES
# ------------------------------------------------------------

required_files <- c(
    DDS_FILE,
    METABOLIC_FILE,
    TERM2GENE_FILE,
    TERM2NAME_FILE,
    DEG_FILES
)

missing_files <- required_files[!file.exists(required_files)]

if (length(missing_files) > 0) {
    stop(
        "The following required files are missing:\n",
        paste(missing_files, collapse = "\n")
    )
}

cat("\n====================================================\n")
cat("QUESTION 1: FRESH ANALYSIS\n")
cat("====================================================\n")

# Standardize gene identifiers to Zm00001d-style IDs.
clean_gene_ids <- function(x) {
    x <- trimws(as.character(x))
    x <- sub("^gene:", "", x)
    x <- sub("\\.\\d+$", "", x)
    x <- x[!is.na(x) & nzchar(x)]
    x
}

# ------------------------------------------------------------
# 3. LOAD AND VALIDATE DESEQ2 OBJECT
# ------------------------------------------------------------

cat("\n[1/8] Loading DESeq2 object...\n")

dds <- readRDS(DDS_FILE)

if (!inherits(dds, "DESeqDataSet")) {
    stop("The RDS file is not a DESeqDataSet.")
}

tested_genes_raw <- rownames(dds)
tested_genes <- unique(clean_gene_ids(tested_genes_raw))

if (length(tested_genes) == 0) {
    stop("No tested genes could be extracted from the DESeq2 object.")
}

cat("DESeq2 genes:", length(tested_genes_raw), "\n")
cat("Unique normalized tested genes:", length(tested_genes), "\n")

# ------------------------------------------------------------
# 4. LOAD METABOLIC ENZYME GENES AND GO BP ANNOTATIONS
# ------------------------------------------------------------

cat("\n[2/8] Loading metabolic enzyme and GO BP annotations...\n")

metabolic_genes <- unique(
    clean_gene_ids(readLines(METABOLIC_FILE, warn = FALSE))
)

term2gene <- read.delim(
    TERM2GENE_FILE,
    header = TRUE,
    sep = "\t",
    quote = "",
    comment.char = "",
    check.names = FALSE
)

term2name <- read.delim(
    TERM2NAME_FILE,
    header = TRUE,
    sep = "\t",
    quote = "",
    comment.char = "",
    check.names = FALSE
)

if (!all(c("GO_ID", "Gene_ID") %in% names(term2gene))) {
    stop("TERM2GENE must contain GO_ID and Gene_ID columns.")
}

if (!all(c("GO_ID", "Description") %in% names(term2name))) {
    stop("TERM2NAME must contain GO_ID and Description columns.")
}

term2gene <- term2gene %>%
    transmute(
        GO_ID = trimws(as.character(GO_ID)),
        Gene_ID = clean_gene_ids(Gene_ID)
    ) %>%
    filter(
        !is.na(GO_ID),
        nzchar(GO_ID),
        !is.na(Gene_ID),
        nzchar(Gene_ID)
    ) %>%
    distinct()

term2name <- term2name %>%
    transmute(
        GO_ID = trimws(as.character(GO_ID)),
        Description = trimws(as.character(Description))
    ) %>%
    filter(!is.na(GO_ID), nzchar(GO_ID)) %>%
    distinct(GO_ID, .keep_all = TRUE)

go_annotated_genes <- unique(term2gene$Gene_ID)

# Correct enrichment universe:
# metabolic enzyme genes that were tested by DESeq2 and
# are represented in the metabolic GO BP TERM2GENE data.
background <- Reduce(
    intersect,
    list(
        metabolic_genes,
        tested_genes,
        go_annotated_genes
    )
)

background <- sort(unique(background))

if (length(background) == 0) {
    stop("The calculated enrichment background is empty.")
}

cat("\nEnrichment background calculation\n")
cat("---------------------------------\n")
cat("Metabolic enzyme genes:", length(metabolic_genes), "\n")
cat("DESeq2-tested genes:", length(tested_genes), "\n")
cat("GO BP-annotated genes:", length(go_annotated_genes), "\n")
cat("Final intersection:", length(background), "\n")

# Save the actual background and an audit summary.
writeLines(
    background,
    file.path(DATA, "Q1_enrichment_background.txt")
)

background_audit <- data.frame(
    Category = c(
        "Metabolic enzyme genes",
        "DESeq2-tested genes",
        "GO BP-annotated genes",
        "Final enrichment background"
    ),
    Gene_Count = c(
        length(metabolic_genes),
        length(tested_genes),
        length(go_annotated_genes),
        length(background)
    )
)

write.table(
    background_audit,
    file.path(TAB, "Q1_background_audit.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

write.table(
    data.frame(Gene_ID = background),
    file.path(TAB, "Q1_enrichment_background_genes.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

# Restrict GO associations to the calculated universe.
term2gene_bg <- term2gene %>%
    filter(Gene_ID %in% background) %>%
    distinct()

if (nrow(term2gene_bg) == 0) {
    stop("No GO BP associations remain after background restriction.")
}

# Remove GO terms with no name mapping.
term2gene_bg <- term2gene_bg %>%
    filter(GO_ID %in% term2name$GO_ID)

if (nrow(term2gene_bg) == 0) {
    stop("No GO BP associations have matching term descriptions.")
}

cat("GO BP associations inside background:", nrow(term2gene_bg), "\n")
cat("GO BP terms inside background:", length(unique(term2gene_bg$GO_ID)), "\n")

# Save the actual annotation subset used in enrichment.
write.table(
    term2gene_bg,
    file.path(DATA, "Q1_TERM2GENE_background.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

# ------------------------------------------------------------
# 5. LOAD AND VALIDATE CORRECTED DEG FILES
# ------------------------------------------------------------

cat("\n[3/8] Loading corrected metabolic enzyme DEGs...\n")

deg_data <- list()
deg_audit <- list()

for (stress in STRESSES) {

    dat <- read.delim(
        DEG_FILES[[stress]],
        header = TRUE,
        sep = "\t",
        quote = "",
        comment.char = "",
        check.names = FALSE
    )

    if (!"Geneid" %in% names(dat)) {
        stop(stress, " DEG file does not contain a Geneid column.")
    }

    if (!"log2FoldChange" %in% names(dat)) {
        stop(stress, " DEG file does not contain log2FoldChange.")
    }

    dat$Gene_ID <- clean_gene_ids(dat$Geneid)
    dat$log2FoldChange <- suppressWarnings(
        as.numeric(dat$log2FoldChange)
    )

    if ("padj" %in% names(dat)) {
        dat$padj <- suppressWarnings(as.numeric(dat$padj))
    }

    dat <- dat %>%
        filter(
            !is.na(Gene_ID),
            nzchar(Gene_ID),
            is.finite(log2FoldChange)
        ) %>%
        distinct(Gene_ID, .keep_all = TRUE)

    original_n <- nrow(dat)

    dat <- dat %>%
        filter(Gene_ID %in% background)

    retained_n <- nrow(dat)

    if (retained_n == 0) {
        stop(
            "No ", stress,
            " DEG genes remain inside the calculated background."
        )
    }

    deg_data[[stress]] <- dat

    deg_audit[[stress]] <- data.frame(
        Stress = stress,
        Unique_DEG_Rows = original_n,
        Retained_In_Background = retained_n,
        Excluded_From_Background = original_n - retained_n
    )

    cat(
        stress, ":",
        original_n, "unique DEGs;",
        retained_n, "inside background\n"
    )
}

deg_audit_table <- bind_rows(deg_audit)

write.table(
    deg_audit_table,
    file.path(TAB, "Q1_DEG_input_audit.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

# ------------------------------------------------------------
# 6. GO BP ENRICHMENT AND DIRECTIONAL ANALYSIS
# ------------------------------------------------------------

cat("\n[4/8] Running GO BP enrichment and direction analysis...\n")

enrichment_results <- list()
direction_results <- list()
all_enrichment <- list()

for (stress in STRESSES) {

    dat <- deg_data[[stress]]
    input_genes <- unique(dat$Gene_ID)

    cat("\nAnalysing:", stress, "\n")

    ego <- clusterProfiler::enricher(
        gene = input_genes,
        universe = background,
        TERM2GENE = term2gene_bg,
        TERM2NAME = term2name,
        pAdjustMethod = "BH",
        pvalueCutoff = 1,
        qvalueCutoff = 1,
        minGSSize = MIN_GS_SIZE,
        maxGSSize = MAX_GS_SIZE
    )

    if (is.null(ego)) {
        enr <- data.frame()
    } else {
        enr <- as.data.frame(ego)
    }

    if (nrow(enr) > 0) {

        enr <- enr %>%
            filter(
                !is.na(p.adjust),
                p.adjust <= ALPHA
            ) %>%
            arrange(p.adjust, pvalue, desc(Count))
    }

    if (nrow(enr) > 0) {

        enr$Stress <- stress

        enrichment_results[[stress]] <- enr
        all_enrichment[[stress]] <- enr

        direction_rows <- vector("list", nrow(enr))

        for (i in seq_len(nrow(enr))) {

            term_genes <- strsplit(
                as.character(enr$geneID[i]),
                "/",
                fixed = TRUE
            )[[1]]

            term_dat <- dat %>%
                filter(Gene_ID %in% term_genes) %>%
                filter(is.finite(log2FoldChange))

            n_genes <- nrow(term_dat)

            up_n <- sum(term_dat$log2FoldChange > 0)
            down_n <- sum(term_dat$log2FoldChange < 0)

            up_prop <- if (n_genes > 0) up_n / n_genes else NA_real_
            down_prop <- if (n_genes > 0) down_n / n_genes else NA_real_

            if (!is.na(up_prop) && up_prop >= DIRECTION_THRESHOLD) {
                direction <- "Predominantly_upregulated"
            } else if (
                !is.na(down_prop) &&
                down_prop >= DIRECTION_THRESHOLD
            ) {
                direction <- "Predominantly_downregulated"
            } else {
                direction <- "Mixed"
            }

            direction_rows[[i]] <- data.frame(
                GO_ID = enr$ID[i],
                Description = enr$Description[i],
                Stress = stress,
                DEG_Count = n_genes,
                Up_Count = up_n,
                Down_Count = down_n,
                Up_Proportion = up_prop,
                Down_Proportion = down_prop,
                Median_log2FC = if (n_genes > 0) {
                    median(term_dat$log2FoldChange, na.rm = TRUE)
                } else {
                    NA_real_
                },
                Mean_log2FC = if (n_genes > 0) {
                    mean(term_dat$log2FoldChange, na.rm = TRUE)
                } else {
                    NA_real_
                },
                Direction = direction,
                stringsAsFactors = FALSE
            )
        }

        direction_results[[stress]] <- bind_rows(direction_rows)

        cat(
            "Significantly enriched GO BP terms:",
            nrow(enr), "\n"
        )

    } else {

        enrichment_results[[stress]] <- data.frame()
        direction_results[[stress]] <- data.frame(
            GO_ID = character(),
            Description = character(),
            Stress = character(),
            DEG_Count = integer(),
            Up_Count = integer(),
            Down_Count = integer(),
            Up_Proportion = numeric(),
            Down_Proportion = numeric(),
            Median_log2FC = numeric(),
            Mean_log2FC = numeric(),
            Direction = character()
        )

        cat("No GO BP terms passed adjusted p-value <=", ALPHA, "\n")
    }
}

# Combine results, preserving empty-result handling.
enrichment_table <- bind_rows(all_enrichment)
direction_table <- bind_rows(direction_results)

if (nrow(enrichment_table) == 0) {
    enrichment_table <- data.frame(
        ID = character(),
        Description = character(),
        GeneRatio = character(),
        BgRatio = character(),
        RichFactor = numeric(),
        FoldEnrichment = numeric(),
        zScore = numeric(),
        pvalue = numeric(),
        p.adjust = numeric(),
        qvalue = numeric(),
        geneID = character(),
        Count = integer(),
        Stress = character()
    )
}

if (nrow(direction_table) == 0) {
    cat(
        "WARNING: No significantly enriched GO BP terms were found. ",
        "The script will continue to generate empty Q1 summaries ",
        "and complete sample-level QC.\\n"
    )
}

write.table(
    enrichment_table,
    file.path(TAB, "Q1_metabolic_process_enrichment.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

write.table(
    direction_table,
    file.path(TAB, "Q1_metabolic_process_direction.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

# Per-stress enrichment summary.
enrichment_summary <- data.frame(
    Stress = STRESSES,
    Enriched_GO_BP_Terms = vapply(
        STRESSES,
        function(s) sum(enrichment_table$Stress == s),
        integer(1)
    ),
    DEG_Count = vapply(
        STRESSES,
        function(s) length(unique(deg_data[[s]]$Gene_ID)),
        integer(1)
    )
)

write.table(
    enrichment_summary,
    file.path(TAB, "Q1_enrichment_summary.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

# ------------------------------------------------------------
# 7. CROSS-STRESS PROCESS COMPARISON
# ------------------------------------------------------------

cat("\n[5/8] Building cross-stress process comparisons...\n")

process_overlap <- direction_table %>%
    group_by(GO_ID, Description) %>%
    summarise(
        Stress_Count = n_distinct(Stress),
        Stresses = paste(sort(unique(Stress)), collapse = ";"),
        Directions = paste(
            paste(Stress, Direction, sep = ":"),
            collapse = ";"
        ),
        Has_Up = any(Direction == "Predominantly_upregulated"),
        Has_Down = any(Direction == "Predominantly_downregulated"),
        Has_Opposing_Directions =
            any(Direction == "Predominantly_upregulated") &&
            any(Direction == "Predominantly_downregulated"),
        .groups = "drop"
    ) %>%
    mutate(
        Response_Pattern = case_when(
            Has_Opposing_Directions ~ "Opposing_across_stresses",
            Stress_Count == 1 ~ "Stress_specific",
            Stress_Count >= 2 ~ "Shared_across_stresses",
            TRUE ~ "Unclassified"
        )
    ) %>%
    arrange(desc(Stress_Count), Description)

write.table(
    process_overlap,
    file.path(TAB, "Q1_shared_stress_specific_processes.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

# Process-by-stress matrix with numerical direction coding:
# +1 = predominantly upregulated
# -1 = predominantly downregulated
#  0 = mixed
# NA = process not significantly enriched in that stress
direction_codes <- c(
    "Predominantly_upregulated" = 1,
    "Predominantly_downregulated" = -1,
    "Mixed" = 0
)

direction_matrix_long <- direction_table %>%
    mutate(Direction_Code = unname(direction_codes[Direction])) %>%
    select(GO_ID, Description, Stress, Direction, Direction_Code)

direction_matrix <- direction_matrix_long %>%
    select(GO_ID, Description, Stress, Direction_Code) %>%
    pivot_wider(
        names_from = Stress,
        values_from = Direction_Code
    )

for (s in STRESSES) {
    if (!s %in% names(direction_matrix)) {
        direction_matrix[[s]] <- NA_real_
    }
}

direction_matrix <- direction_matrix %>%
    select(GO_ID, Description, all_of(STRESSES)) %>%
    arrange(Description)

write.table(
    direction_matrix,
    file.path(TAB, "Q1_cross_stress_direction_matrix.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

# Save a human-readable direction matrix too.
direction_labels <- direction_matrix_long %>%
    select(GO_ID, Description, Stress, Direction) %>%
    pivot_wider(
        names_from = Stress,
        values_from = Direction
    )

for (s in STRESSES) {
    if (!s %in% names(direction_labels)) {
        direction_labels[[s]] <- NA_character_
    }
}

direction_labels <- direction_labels %>%
    select(GO_ID, Description, all_of(STRESSES))

write.table(
    direction_labels,
    file.path(TAB, "Q1_cross_stress_direction_labels.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

# ------------------------------------------------------------
# 8. FIGURES 1-4: GO BP ENRICHMENT AND DIRECTION
# ------------------------------------------------------------

cat("\n[6/8] Generating Q1 figures...\n")

save_plot <- function(plot, filename, width = 10, height = 7) {
    ggsave(
        file.path(FIG, paste0(filename, ".png")),
        plot,
        width = width,
        height = height,
        dpi = 300,
        bg = "white"
    )

    ggsave(
        file.path(FIG, paste0(filename, ".pdf")),
        plot,
        width = width,
        height = height,
        device = cairo_pdf,
        bg = "white"
    )
}

# Figure 1: Number of enriched GO BP processes per stress.
fig1 <- ggplot(
    enrichment_summary,
    aes(x = Stress, y = Enriched_GO_BP_Terms)
) +
    geom_col(fill = "#2878A5", width = 0.68) +
    geom_text(
        aes(label = Enriched_GO_BP_Terms),
        vjust = -0.4,
        size = 4
    ) +
    labs(
        title = "Enriched metabolic biological processes across stresses",
        x = "Stress condition",
        y = "Number of significantly enriched GO BP terms"
    ) +
    theme_classic(base_size = 12) +
    expand_limits(y = max(enrichment_summary$Enriched_GO_BP_Terms, 0) + 1)

save_plot(
    fig1,
    "Figure_1_enriched_metabolic_processes",
    9,
    6
)

# Figure 2: Top 15 GO BP terms per stress.
if (nrow(enrichment_table) > 0) {

    top_terms <- enrichment_table %>%
        group_by(Stress) %>%
        arrange(p.adjust, pvalue, .by_group = TRUE) %>%
        slice_head(n = 15) %>%
        ungroup() %>%
        mutate(
            Description = factor(
                Description,
                levels = rev(unique(Description))
            )
        )

    fig2 <- ggplot(
        top_terms,
        aes(
            x = -log10(pmax(p.adjust, .Machine$double.xmin)),
            y = Description,
            size = Count,
            colour = p.adjust
        )
    ) +
        geom_point(alpha = 0.85) +
        facet_wrap(~Stress, scales = "free_y") +
        scale_colour_viridis_c(
            direction = -1,
            name = "Adjusted p-value"
        ) +
        labs(
            title = "Top enriched metabolic biological processes",
            x = expression(-log[10]("adjusted p-value")),
            y = NULL,
            size = "DEG count"
        ) +
        theme_bw(base_size = 10) +
        theme(
            strip.background = element_rect(fill = "grey92"),
            axis.text.y = element_text(size = 7)
        )

} else {

    fig2 <- ggplot() +
        annotate(
            "text",
            x = 0,
            y = 0,
            label = "No significantly enriched GO BP terms",
            size = 5
        ) +
        theme_void() +
        labs(title = "Top enriched metabolic biological processes")
}

save_plot(
    fig2,
    "Figure_2_top_metabolic_processes",
    13,
    9
)

# Figure 3: Cross-stress process direction heatmap.
shared_terms <- process_overlap %>%
    filter(Stress_Count >= 2) %>%
    pull(GO_ID)

heatmap_data <- direction_matrix %>%
    filter(GO_ID %in% shared_terms)

heatmap_file_png <- file.path(
    FIG, "Figure_3_cross_stress_metabolic_direction_heatmap.png"
)

heatmap_file_pdf <- file.path(
    FIG, "Figure_3_cross_stress_metabolic_direction_heatmap.pdf"
)

if (nrow(heatmap_data) > 0) {

    heatmap_matrix <- as.matrix(
        heatmap_data[, STRESSES, drop = FALSE]
    )

    storage.mode(heatmap_matrix) <- "numeric"

    rownames(heatmap_matrix) <- make.unique(
        paste0(
            heatmap_data$Description,
            " [",
            heatmap_data$GO_ID,
            "]"
        )
    )

    heatmap_height <- max(6, min(18, 0.28 * nrow(heatmap_matrix) + 3))

    heatmap_args <- list(
        mat = heatmap_matrix,
        color = c("#2166AC", "#F7F7F7", "#B2182B"),
        breaks = c(-1.5, -0.5, 0.5, 1.5),
        cluster_rows = FALSE,
        cluster_cols = FALSE,
        na_col = "grey85",
        border_color = "white",
        main = "Shared GO BP process direction across stresses",
        legend_breaks = c(-1, 0, 1),
        legend_labels = c("Downregulated", "Mixed", "Upregulated"),
        fontsize_row = 7,
        fontsize_col = 10,
        angle_col = 0
    )

    png(
        heatmap_file_png,
        width = 3000,
        height = round(3000 * heatmap_height / 10),
        res = 300
    )
    do.call(pheatmap::pheatmap, heatmap_args)
    dev.off()

    pdf(
        heatmap_file_pdf,
        width = 10,
        height = heatmap_height,
        useDingbats = FALSE
    )
    do.call(pheatmap::pheatmap, heatmap_args)
    dev.off()

} else {

    for (f in c(heatmap_file_png, heatmap_file_pdf)) {
        if (grepl("\\.png$", f)) {
            png(f, width = 1800, height = 1000, res = 180)
        } else {
            pdf(f, width = 10, height = 6)
        }

        plot.new()
        text(
            0.5, 0.5,
            "No GO BP processes were significantly enriched in two or more stresses",
            cex = 1
        )
        title("Cross-stress metabolic process direction")
        dev.off()
    }
}

# Figure 4: Directional classification of enriched processes.
direction_counts <- direction_table %>%
    count(Stress, Direction, name = "Processes")

direction_levels <- c(
    "Predominantly_upregulated",
    "Predominantly_downregulated",
    "Mixed"
)

direction_plot_data <- expand.grid(
    Stress = STRESSES,
    Direction = direction_levels,
    stringsAsFactors = FALSE
) %>%
    left_join(
        direction_counts,
        by = c("Stress", "Direction")
    ) %>%
    mutate(
        Processes = replace_na(Processes, 0L),
        Stress = factor(Stress, levels = STRESSES),
        Direction = factor(Direction, levels = direction_levels)
    )

fig4 <- ggplot(
    direction_plot_data,
    aes(x = Stress, y = Processes, fill = Direction)
) +
    geom_col(width = 0.68) +
    scale_fill_manual(
        values = c(
            "Predominantly_upregulated" = "#D95F02",
            "Predominantly_downregulated" = "#1B9E77",
            "Mixed" = "#7570B3"
        ),
        labels = c(
            "Predominantly upregulated",
            "Predominantly downregulated",
            "Mixed"
        )
    ) +
    labs(
        title = "Directional patterns of enriched GO BP processes",
        x = "Stress condition",
        y = "Number of enriched processes",
        fill = "Response direction"
    ) +
    theme_classic(base_size = 12)

save_plot(
    fig4,
    "Figure_4_metabolic_response_direction",
    10,
    6
)

# ------------------------------------------------------------
# 9. SAMPLE-LEVEL QUALITY CONTROL
# ------------------------------------------------------------

cat("\n[7/8] Performing sample-level quality control...\n")

# Library sizes from the original count matrix.
count_matrix <- counts(dds)

library_sizes <- colSums(count_matrix)

sample_metadata <- as.data.frame(colData(dds))
sample_metadata$Sample <- rownames(sample_metadata)

condition_col <- if ("condition" %in% names(sample_metadata)) {
    "condition"
} else {
    candidate_cols <- names(sample_metadata)[
        vapply(
            sample_metadata,
            function(x) is.factor(x) || is.character(x),
            logical(1)
        )
    ]

    if (length(candidate_cols) > 0) candidate_cols[1] else NA_character_
}

if (!is.na(condition_col)) {
    sample_metadata$Condition <- as.character(
        sample_metadata[[condition_col]]
    )
} else {
    sample_metadata$Condition <- "Unspecified"
}

library_table <- data.frame(
    Sample = names(library_sizes),
    Library_Size = as.numeric(library_sizes)
) %>%
    left_join(
        sample_metadata %>% select(Sample, Condition),
        by = "Sample"
    )

write.table(
    library_table,
    file.path(QC_TAB, "Q1_sample_library_sizes.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

fig5 <- ggplot(
    library_table,
    aes(x = reorder(Sample, Library_Size), y = Library_Size, fill = Condition)
) +
    geom_col(width = 0.7) +
    coord_flip() +
    labs(
        title = "RNA-seq library sizes",
        x = "Sample",
        y = "Total raw read counts",
        fill = "Condition"
    ) +
    theme_classic(base_size = 11)

ggsave(
    file.path(QC_FIG, "Figure_5_sample_library_sizes.png"),
    fig5,
    width = 9,
    height = 6,
    dpi = 300,
    bg = "white"
)

ggsave(
    file.path(QC_FIG, "Figure_5_sample_library_sizes.pdf"),
    fig5,
    width = 9,
    height = 6,
    device = cairo_pdf,
    bg = "white"
)

# Variance-stabilizing transformation.
vsd <- DESeq2::vst(dds, blind = TRUE)
vst_matrix <- assay(vsd)

# Select the 500 most variable genes.
gene_variances <- apply(vst_matrix, 1, var, na.rm = TRUE)
gene_variances <- gene_variances[is.finite(gene_variances)]

top_n <- min(500, length(gene_variances))

top_variable_genes <- names(
    sort(gene_variances, decreasing = TRUE)
)[seq_len(top_n)]

pca_input <- t(
    vst_matrix[top_variable_genes, , drop = FALSE]
)

pca <- prcomp(pca_input, center = TRUE, scale. = FALSE)

pca_variance <- (pca$sdev^2 / sum(pca$sdev^2)) * 100

pca_scores <- as.data.frame(pca$x[, 1:2, drop = FALSE])
pca_scores$Sample <- rownames(pca_scores)

pca_scores <- pca_scores %>%
    left_join(
        sample_metadata %>% select(Sample, Condition),
        by = "Sample"
    )

write.table(
    data.frame(
        Sample = pca_scores$Sample,
        PC1 = pca_scores$PC1,
        PC2 = pca_scores$PC2,
        Condition = pca_scores$Condition
    ),
    file.path(QC_TAB, "Q1_PCA_scores_top500_variable_genes.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

write.table(
    data.frame(
        Gene_ID = top_variable_genes,
        Variance = gene_variances[top_variable_genes]
    ),
    file.path(QC_TAB, "Q1_top500_variable_genes.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

fig6 <- ggplot(
    pca_scores,
    aes(x = PC1, y = PC2, colour = Condition, label = Sample)
) +
    geom_point(size = 3.5) +
    geom_text(
        vjust = -0.8,
        size = 3,
        show.legend = FALSE
    ) +
    labs(
        title = "PCA of RNA-seq samples",
        subtitle = "Variance-stabilized expression; 500 most variable genes",
        x = paste0("PC1 (", round(pca_variance[1], 1), "%)"),
        y = paste0("PC2 (", round(pca_variance[2], 1), "%)"),
        colour = "Condition"
    ) +
    theme_classic(base_size = 12)

ggsave(
    file.path(QC_FIG, "Figure_6_sample_PCA_top500.png"),
    fig6,
    width = 9,
    height = 7,
    dpi = 300,
    bg = "white"
)

ggsave(
    file.path(QC_FIG, "Figure_6_sample_PCA_top500.pdf"),
    fig6,
    width = 9,
    height = 7,
    device = cairo_pdf,
    bg = "white"
)

# Pearson sample correlation.
sample_cor <- cor(vst_matrix, method = "pearson", use = "pairwise.complete.obs")

write.table(
    as.data.frame(sample_cor) %>%
        tibble::rownames_to_column("Sample"),
    file.path(QC_TAB, "Q1_sample_Pearson_correlations.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

cor_png <- file.path(QC_FIG, "Figure_7_sample_Pearson_correlation.png")
cor_pdf <- file.path(QC_FIG, "Figure_7_sample_Pearson_correlation.pdf")

png(cor_png, width = 2400, height = 2200, res = 250)
pheatmap(
    sample_cor,
    main = "Pearson correlation between RNA-seq samples",
    display_numbers = TRUE,
    number_format = "%.2f",
    cluster_rows = TRUE,
    cluster_cols = TRUE,
    border_color = NA
)
dev.off()

pdf(cor_pdf, width = 8, height = 7, useDingbats = FALSE)
pheatmap(
    sample_cor,
    main = "Pearson correlation between RNA-seq samples",
    display_numbers = TRUE,
    number_format = "%.2f",
    cluster_rows = TRUE,
    cluster_cols = TRUE,
    border_color = NA
)
dev.off()

# Euclidean sample distances.
sample_dist <- dist(t(vst_matrix), method = "euclidean")
sample_dist_matrix <- as.matrix(sample_dist)

write.table(
    as.data.frame(sample_dist_matrix) %>%
        tibble::rownames_to_column("Sample"),
    file.path(QC_TAB, "Q1_sample_Euclidean_distances.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

dist_png <- file.path(QC_FIG, "Figure_8_sample_Euclidean_distance.png")
dist_pdf <- file.path(QC_FIG, "Figure_8_sample_Euclidean_distance.pdf")

png(dist_png, width = 2400, height = 2200, res = 250)
pheatmap(
    sample_dist_matrix,
    main = "Euclidean distances between RNA-seq samples",
    cluster_rows = TRUE,
    cluster_cols = TRUE,
    border_color = NA
)
dev.off()

pdf(dist_pdf, width = 8, height = 7, useDingbats = FALSE)
pheatmap(
    sample_dist_matrix,
    main = "Euclidean distances between RNA-seq samples",
    cluster_rows = TRUE,
    cluster_cols = TRUE,
    border_color = NA
)
dev.off()

# ------------------------------------------------------------
# 10. FINAL RUN SUMMARY AND OUTPUT CHECK
# ------------------------------------------------------------

cat("\n[8/8] Writing final analysis summary...\n")

run_summary <- data.frame(
    Item = c(
        "DESeq2-tested genes",
        "Metabolic enzyme genes",
        "GO BP-annotated genes",
        "Final enrichment background",
        "GO BP gene-term associations in background",
        "Cold metabolic enzyme DEGs",
        "Drought metabolic enzyme DEGs",
        "Heat metabolic enzyme DEGs",
        "Salinity metabolic enzyme DEGs",
        "Significant enriched GO BP terms: Cold",
        "Significant enriched GO BP terms: Drought",
        "Significant enriched GO BP terms: Heat",
        "Significant enriched GO BP terms: Salinity",
        "Processes enriched in multiple stresses",
        "Processes with opposing directions"
    ),
    Value = c(
        length(tested_genes),
        length(metabolic_genes),
        length(go_annotated_genes),
        length(background),
        nrow(term2gene_bg),
        nrow(deg_data$Cold),
        nrow(deg_data$Drought),
        nrow(deg_data$Heat),
        nrow(deg_data$Salinity),
        sum(enrichment_table$Stress == "Cold"),
        sum(enrichment_table$Stress == "Drought"),
        sum(enrichment_table$Stress == "Heat"),
        sum(enrichment_table$Stress == "Salinity"),
        sum(process_overlap$Stress_Count >= 2),
        sum(process_overlap$Has_Opposing_Directions)
    )
)

write.table(
    run_summary,
    file.path(TAB, "Q1_final_run_summary.tsv"),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

cat("\n====================================================\n")
cat("QUESTION 1 ANALYSIS COMPLETED\n")
cat("====================================================\n")
print(run_summary, row.names = FALSE)

cat("\nQ1 tables:", TAB, "\n")
cat("Q1 figures:", FIG, "\n")
cat("QC tables:", QC_TAB, "\n")
cat("QC figures:", QC_FIG, "\n")

