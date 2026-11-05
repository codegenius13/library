library(DESeq2)

base_dir <- "/mnt/c/Users/Boluwatife Ikuerowo/Desktop/work/programming/library/content/src/assets/exerciseOne"
de_dir <- file.path(base_dir, "05_DE_analysis")
count_file <- file.path(
  base_dir,
  "04_alignment/counts/maize_gene_counts_fragments.txt"
)

# ------------------------------------------------------------
# 1. Read corrected featureCounts fragment-count matrix
# ------------------------------------------------------------

x <- read.delim(
  count_file,
  comment.char = "#",
  check.names = FALSE
)

if (!"Geneid" %in% colnames(x)) {
  stop("Geneid column is missing.")
}

counts <- x[, 7:ncol(x), drop = FALSE]
rownames(counts) <- x$Geneid

if (anyDuplicated(rownames(counts))) {
  stop("Duplicate gene IDs found in count matrix.")
}

counts <- as.matrix(counts)
storage.mode(counts) <- "integer"

# Convert BAM file paths into accession IDs
colnames(counts) <- basename(colnames(counts))
colnames(counts) <- sub("\\.sorted\\.bam$", "", colnames(counts))

# ------------------------------------------------------------
# 2. Assign conditions by accession ID
# ------------------------------------------------------------

condition_map <- c(
  SRR3984708 = "Control",
  SRR3984749 = "Control",
  SRR3984762 = "Salinity",
  SRR3984771 = "Salinity",
  SRR3984782 = "Drought",
  SRR3984791 = "Drought",
  SRR3984794 = "Heat",
  SRR3984795 = "Heat",
  SRR3984802 = "Cold",
  SRR3984815 = "Cold"
)

if (!setequal(names(condition_map), colnames(counts))) {
  stop("Count-table sample IDs do not match the expected ten accessions.")
}

condition <- factor(
  unname(condition_map[colnames(counts)]),
  levels = c("Control", "Cold", "Drought", "Heat", "Salinity")
)

metadata <- data.frame(
  condition = condition,
  row.names = colnames(counts)
)

# Save correctly matched metadata
write.table(
  data.frame(
    sample = rownames(metadata),
    condition = metadata$condition
  ),
  file.path(de_dir, "sample_metadata.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

cat("\nSample assignments:\n")
print(metadata)

# ------------------------------------------------------------
# 3. Validate and filter count matrix
# ------------------------------------------------------------

if (anyNA(counts) || any(counts < 0)) {
  stop("Count matrix contains missing or negative values.")
}

cat("\nGenes before filtering:", nrow(counts), "\n")

# Remove genes with fewer than 10 total assigned fragments
counts <- counts[rowSums(counts) >= 10, , drop = FALSE]

cat("Genes retained for DESeq2:", nrow(counts), "\n")

# ------------------------------------------------------------
# 4. Construct DESeq2 dataset and run analysis
# ------------------------------------------------------------

dds <- DESeqDataSetFromMatrix(
  countData = counts,
  colData = metadata,
  design = ~ condition
)

dds <- DESeq(dds)

cat("\nDESeq2 result coefficients:\n")
print(resultsNames(dds))

# Save the fitted dataset
saveRDS(
  dds,
  file.path(de_dir, "maize_DESeq2.rds")
)

# Save normalized counts for downstream analysis
normalized_counts <- counts(dds, normalized = TRUE)

write.table(
  data.frame(
    Geneid = rownames(normalized_counts),
    normalized_counts,
    check.names = FALSE
  ),
  file.path(de_dir, "normalized_counts.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# ------------------------------------------------------------
# 5. Stress-versus-control comparisons
# ------------------------------------------------------------

comparisons <- c("Cold", "Drought", "Heat", "Salinity")
summary_table <- data.frame()

deg_gene_lists <- list()

for (stress in comparisons) {

  cat("\n========================================\n")
  cat(stress, "vs Control\n")
  cat("========================================\n")

  res <- results(
    dds,
    contrast = c("condition", stress, "Control"),
    alpha = 0.05
  )

  res_df <- as.data.frame(res)
  res_df$Geneid <- rownames(res_df)

  res_df <- res_df[, c(
    "Geneid",
    setdiff(colnames(res_df), "Geneid")
  )]

  res_df <- res_df[order(res_df$padj, na.last = TRUE), ]

  # Save all tested gene results
  write.table(
    res_df,
    file.path(de_dir, paste0(stress, "_vs_Control_all_results.tsv")),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
  )

  # Significance criteria: adjusted p-value <= 0.05
  # and absolute log2 fold change >= 1
  deg <- res_df[
    !is.na(res_df$padj) &
    res_df$padj <= 0.05 &
    abs(res_df$log2FoldChange) >= 1,
  ]

  up <- deg[deg$log2FoldChange >= 1, , drop = FALSE]
  down <- deg[deg$log2FoldChange <= -1, , drop = FALSE]

  deg_gene_lists[[stress]] <- unique(deg$Geneid)

  write.table(
    deg,
    file.path(de_dir, paste0(stress, "_vs_Control_DEGs.tsv")),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
  )

  write.table(
    up,
    file.path(de_dir, paste0(stress, "_vs_Control_upregulated.tsv")),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
  )

  write.table(
    down,
    file.path(de_dir, paste0(stress, "_vs_Control_downregulated.tsv")),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
  )

  summary_table <- rbind(
    summary_table,
    data.frame(
      Comparison = paste0(stress, "_vs_Control"),
      Total_tested_genes = nrow(res_df),
      DEGs = nrow(deg),
      Upregulated = nrow(up),
      Downregulated = nrow(down)
    )
  )

  cat("Genes tested:", nrow(res_df), "\n")
  cat("Significant DEGs:", nrow(deg), "\n")
  cat("Upregulated:", nrow(up), "\n")
  cat("Downregulated:", nrow(down), "\n")
}

write.table(
  summary_table,
  file.path(de_dir, "DEG_summary.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# ------------------------------------------------------------
# 6. Shared and stress-specific DEG analysis
# ------------------------------------------------------------

shared_all <- Reduce(intersect, deg_gene_lists)

write.table(
  data.frame(Geneid = shared_all),
  file.path(de_dir, "DEGs_shared_all_four_stresses.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

for (stress in comparisons) {

  other_stresses <- setdiff(comparisons, stress)

  specific <- deg_gene_lists[[stress]][
    !deg_gene_lists[[stress]] %in%
      unlist(deg_gene_lists[other_stresses])
  ]

  write.table(
    data.frame(Geneid = specific),
    file.path(de_dir, paste0(stress, "_specific_DEGs.tsv")),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
  )
}

pairwise <- combn(comparisons, 2, simplify = FALSE)

pairwise_table <- do.call(rbind, lapply(pairwise, function(pair) {
  data.frame(
    Comparison = paste(pair, collapse = "_"),
    Shared_DEGs = length(intersect(
      deg_gene_lists[[pair[1]]],
      deg_gene_lists[[pair[2]]]
    ))
  )
}))

write.table(
  pairwise_table,
  file.path(de_dir, "pairwise_DEG_overlap.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

cat("\n========================================\n")
cat("CORRECTED DESeq2 ANALYSIS COMPLETED\n")
cat("========================================\n")

print(summary_table)

cat("\nDEGs shared by all four stresses:",
    length(shared_all), "\n")
