suppressPackageStartupMessages({
  library(DESeq2)
  library(ggplot2)
  library(pheatmap)
})

project <- path.expand("~/exerciseOne")
rds_file <- file.path(project, "05_DE_analysis/maize_DESeq2.rds")
out <- file.path(project, "07_results/01_answer/qc_sample_level")
fig <- file.path(out, "figures")
tab <- file.path(out, "tables")
log <- file.path(out, "logs")

dir.create(fig, recursive = TRUE, showWarnings = FALSE)
dir.create(tab, recursive = TRUE, showWarnings = FALSE)
dir.create(log, recursive = TRUE, showWarnings = FALSE)

stopifnot(file.exists(rds_file))

dds <- readRDS(rds_file)

if (!inherits(dds, "DESeqDataSet")) {
  stop(
    "The RDS is not a DESeqDataSet. Its class is: ",
    paste(class(dds), collapse = ", "),
    ". Inspect the RDS structure before continuing."
  )
}

# 1. Inspect sample metadata and identify the condition column.
meta <- as.data.frame(colData(dds))
meta$sample_id <- rownames(meta)

possible_conditions <- c("condition", "Condition", "stress",
                         "Stress", "group", "Group",
                         "treatment", "Treatment")
condition_col <- possible_conditions[
  possible_conditions %in% colnames(meta)
][1]

if (is.na(condition_col)) {
  write.table(meta,
              file.path(tab, "sample_metadata_inspection.tsv"),
              sep = "\t", quote = FALSE, row.names = FALSE)
  stop(
    "Could not identify the condition column. ",
    "See tables/sample_metadata_inspection.tsv and set condition_col manually."
  )
}

meta$condition <- factor(meta[[condition_col]])
rownames(meta) <- meta$sample_id

if (ncol(dds) != 10) {
  warning("Expected 10 samples; found ", ncol(dds), ".")
}

write.table(
  meta, file.path(tab, "sample_metadata.tsv"),
  sep = "\t", quote = FALSE, row.names = FALSE
)

condition_counts <- as.data.frame(table(meta$condition))
colnames(condition_counts) <- c("condition", "sample_count")
write.table(
  condition_counts, file.path(tab, "sample_counts_by_condition.tsv"),
  sep = "\t", quote = FALSE, row.names = FALSE
)

# 2. Raw library sizes and count summaries.
raw_counts <- counts(dds)
library_summary <- data.frame(
  sample_id = colnames(raw_counts),
  condition = meta[colnames(raw_counts), "condition"],
  total_assigned_counts = colSums(raw_counts),
  genes_with_nonzero_counts = colSums(raw_counts > 0),
  genes_with_at_least_10_counts = colSums(raw_counts >= 10)
)

write.table(
  library_summary, file.path(tab, "library_size_summary.tsv"),
  sep = "\t", quote = FALSE, row.names = FALSE
)

p_lib <- ggplot(library_summary,
                aes(x = reorder(sample_id, total_assigned_counts),
                    y = total_assigned_counts,
                    fill = condition)) +
  geom_col() +
  coord_flip() +
  labs(title = "Raw gene-count library sizes",
       x = "Sample", y = "Total assigned counts", fill = "Condition") +
  theme_bw()

ggsave(file.path(fig, "QC_1_library_sizes.png"),
       p_lib, width = 9, height = 6, dpi = 300)
ggsave(file.path(fig, "QC_1_library_sizes.pdf"),
       p_lib, width = 9, height = 6)

# 3. Variance-stabilizing transformation for sample-level comparisons.
vsd <- vst(dds, blind = TRUE)
v <- assay(vsd)

# Sample correlation matrix.
cor_mat <- cor(v, method = "pearson", use = "pairwise.complete.obs")
write.table(
  cor_mat, file.path(tab, "sample_pearson_correlation.tsv"),
  sep = "\t", quote = FALSE, col.names = NA
)

png(file.path(fig, "QC_2_sample_correlation_heatmap.png"),
    width = 2400, height = 2200, res = 300)
pheatmap(
  cor_mat,
  main = "Sample-to-sample Pearson correlation (VST counts)",
  border_color = NA,
  display_numbers = TRUE,
  number_format = "%.2f"
)
dev.off()

pdf(file.path(fig, "QC_2_sample_correlation_heatmap.pdf"),
    width = 9, height = 8)
pheatmap(
  cor_mat,
  main = "Sample-to-sample Pearson correlation (VST counts)",
  border_color = NA,
  display_numbers = TRUE,
  number_format = "%.2f"
)
dev.off()

# 4. Euclidean sample-distance matrix and heatmap.
sample_dist <- dist(t(v), method = "euclidean")
dist_mat <- as.matrix(sample_dist)
rownames(dist_mat) <- colnames(v)
colnames(dist_mat) <- colnames(v)

write.table(
  dist_mat, file.path(tab, "sample_euclidean_distances.tsv"),
  sep = "\t", quote = FALSE, col.names = NA
)

png(file.path(fig, "QC_3_sample_distance_heatmap.png"),
    width = 2400, height = 2200, res = 300)
pheatmap(
  dist_mat,
  main = "Euclidean distances between samples (VST counts)",
  border_color = NA
)
dev.off()

pdf(file.path(fig, "QC_3_sample_distance_heatmap.pdf"),
    width = 9, height = 8)
pheatmap(
  dist_mat,
  main = "Euclidean distances between samples (VST counts)",
  border_color = NA
)
dev.off()

# 5. PCA using the most variable genes in the VST matrix.
rv <- matrixStats::rowVars(v)
top_n <- min(500, length(rv))
top_idx <- order(rv, decreasing = TRUE)[seq_len(top_n)]
pca <- prcomp(t(v[top_idx, , drop = FALSE]), center = TRUE, scale. = FALSE)

percent_var <- (pca$sdev^2) / sum(pca$sdev^2) * 100
pca_df <- data.frame(
  sample_id = rownames(pca$x),
  PC1 = pca$x[, 1],
  PC2 = pca$x[, 2],
  condition = meta[rownames(pca$x), "condition"]
)

write.table(
  data.frame(
    sample_id = pca_df$sample_id,
    condition = pca_df$condition,
    PC1 = pca_df$PC1,
    PC2 = pca_df$PC2
  ),
  file.path(tab, "PCA_coordinates.tsv"),
  sep = "\t", quote = FALSE, row.names = FALSE
)

p_pca <- ggplot(pca_df, aes(PC1, PC2, color = condition, label = sample_id)) +
  geom_point(size = 4) +
  geom_text(vjust = -0.8, size = 3, check_overlap = TRUE) +
  labs(
    title = "PCA of maize RNA-seq samples",
    subtitle = paste("Top", top_n, "most variable genes after VST"),
    x = sprintf("PC1 (%.1f%% variance)", percent_var[1]),
    y = sprintf("PC2 (%.1f%% variance)", percent_var[2]),
    color = "Condition"
  ) +
  theme_bw()

ggsave(file.path(fig, "QC_4_PCA.png"),
       p_pca, width = 9, height = 7, dpi = 300)
ggsave(file.path(fig, "QC_4_PCA.pdf"),
       p_pca, width = 9, height = 7)

# 6. Record software, design and sample summaries.
sink(file.path(log, "sample_qc_report.txt"))
cat("MAIZE RNA-SEQ SAMPLE QC REPORT\n")
cat("==============================\n\n")
cat("DESeq2 object:", rds_file, "\n")
cat("Object class:", paste(class(dds), collapse = ", "), "\n")
cat("Design formula:", paste(deparse(design(dds)), collapse = ""), "\n")
cat("Number of genes:", nrow(dds), "\n")
cat("Number of samples:", ncol(dds), "\n\n")
cat("Sample counts by condition:\n")
print(condition_counts)
cat("\nLibrary-size summary:\n")
print(library_summary)
cat("\nPCA variance explained:\n")
print(round(percent_var[1:min(5, length(percent_var))], 2))
cat("\nSample correlation matrix:\n")
print(round(cor_mat, 3))
cat("\nSample Euclidean distance matrix:\n")
print(round(dist_mat, 2))
cat("\nNote: PCA, correlations and distances are exploratory QC diagnostics.\n")
cat("They do not by themselves prove replicate reliability or identify causes of outliers.\n")
sink()

cat("Sample-level QC completed.\n")
cat("Outputs:", out, "\n")
