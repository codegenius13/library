library(DESeq2)

base_dir <- file.path(Sys.getenv("HOME"), "exerciseOne")
count_file <- file.path(base_dir, "04_alignment/counts/maize_gene_counts.txt")
de_dir <- file.path(base_dir, "05_DE_analysis")

dir.create(de_dir, recursive = TRUE, showWarnings = FALSE)

# Read featureCounts matrix
x <- read.delim(
  count_file,
  comment.char = "#",
  check.names = FALSE
)

# Sample columns start at column 7
counts <- x[, 7:ncol(x)]
rownames(counts) <- x$Geneid
counts <- as.matrix(counts)
storage.mode(counts) <- "integer"

# Clean sample names
colnames(counts) <- sub("^.*/", "", colnames(counts))
colnames(counts) <- sub("\\.sorted\\.bam$", "", colnames(counts))

# Sample conditions
condition <- factor(
  c(
    "Cold", "Cold",
    "Heat", "Heat",
    "Drought", "Drought",
    "Salinity", "Salinity",
    "Control", "Control"
  ),
  levels = c("Control", "Cold", "Drought", "Heat", "Salinity")
)

metadata <- data.frame(
  sample = colnames(counts),
  condition = condition,
  row.names = colnames(counts)
)

write.table(
  metadata,
  file.path(de_dir, "sample_metadata.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = TRUE
)

# Remove genes with zero counts in every sample
counts <- counts[rowSums(counts) > 0, ]

# Create DESeq2 dataset
dds <- DESeqDataSetFromMatrix(
  countData = counts,
  colData = metadata,
  design = ~ condition
)

# Run DESeq2
dds <- DESeq(dds)

# Save DESeq2 object
saveRDS(
  dds,
  file.path(de_dir, "maize_DESeq2.rds")
)

# Stress comparisons
comparisons <- c("Cold", "Drought", "Heat", "Salinity")

summary_table <- data.frame()

for (stress in comparisons) {

  cat("\n============================================================\n")
  cat(stress, "vs Control\n")
  cat("============================================================\n")

  res <- results(
    dds,
    contrast = c("condition", stress, "Control"),
    alpha = 0.05
  )

  res <- res[order(res$padj), ]
  res_df <- as.data.frame(res)
  res_df$Geneid <- rownames(res_df)

  res_df <- res_df[, c(
    "Geneid",
    setdiff(colnames(res_df), "Geneid")
  )]

  # All DESeq2 results
  write.table(
    res_df,
    file.path(
      de_dir,
      paste0(stress, "_vs_Control_all_results.tsv")
    ),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
  )

  # Li et al. cutoffs
  deg <- res_df[
    !is.na(res_df$padj) &
    res_df$padj <= 0.05 &
    abs(res_df$log2FoldChange) >= 1,
  ]

  # Upregulated
  up <- deg[deg$log2FoldChange >= 1, ]

  # Downregulated
  down <- deg[deg$log2FoldChange <= -1, ]

  # Save DEG tables
  write.table(
    deg,
    file.path(
      de_dir,
      paste0(stress, "_vs_Control_DEGs.tsv")
    ),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
  )

  write.table(
    up,
    file.path(
      de_dir,
      paste0(stress, "_vs_Control_upregulated.tsv")
    ),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
  )

  write.table(
    down,
    file.path(
      de_dir,
      paste0(stress, "_vs_Control_downregulated.tsv")
    ),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
  )

  # Summary
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

  cat("Total tested genes:", nrow(res_df), "\n")
  cat("DEGs:", nrow(deg), "\n")
  cat("Upregulated:", nrow(up), "\n")
  cat("Downregulated:", nrow(down), "\n")
}

# Save summary
write.table(
  summary_table,
  file.path(de_dir, "DEG_summary.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

cat("\n============================================================\n")
cat("DESeq2 ANALYSIS COMPLETED\n")
cat("============================================================\n\n")

print(summary_table)
