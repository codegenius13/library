library(DESeq2)

base_dir <- getwd()
de_dir <- file.path(base_dir, "05_DE_analysis")

sink(file.path(de_dir, "DE_validation_report.txt"))

cat("DESEQ2 VALIDATION REPORT\n")
cat("=======================\n\n")

dds <- readRDS(file.path(de_dir, "maize_DESeq2.rds"))

cat("1. MODEL AND SAMPLE INFORMATION\n")
cat("--------------------------------\n")
cat("Design:", as.character(design(dds)), "\n")
cat("Genes:", nrow(dds), "\n")
cat("Samples:", ncol(dds), "\n")
cat("Coefficients:\n")
print(resultsNames(dds))
cat("\nSample metadata:\n")
print(as.data.frame(colData(dds)))
cat("\nSize factors:\n")
print(sizeFactors(dds))

stresses <- c("Cold", "Drought", "Heat", "Salinity")
gene_lists <- list()
result_tables <- list()

cat("\n\n2. EXTREME FOLD-CHANGE INSPECTION\n")
cat("----------------------------------\n")

nc <- counts(dds, normalized = TRUE)

for (stress in stresses) {

  res <- results(
    dds,
    contrast = c("condition", stress, "Control"),
    alpha = 0.05
  )

  tab <- as.data.frame(res)
  tab$Geneid <- rownames(tab)

  sig <- tab[
    !is.na(tab$padj) &
    tab$padj <= 0.05 &
    abs(tab$log2FoldChange) >= 1,
  ]

  gene_lists[[stress]] <- unique(sig$Geneid)
  result_tables[[stress]] <- tab

  cat("\n", stress, "vs Control\n")
  cat("Significant DEGs:", nrow(sig), "\n")
  cat("NA adjusted p-values:", sum(is.na(tab$padj)), "\n")
  cat("Maximum log2FC:", max(sig$log2FoldChange, na.rm = TRUE), "\n")
  cat("Minimum log2FC:", min(sig$log2FoldChange, na.rm = TRUE), "\n")

  extreme <- sig[order(-abs(sig$log2FoldChange)), ]
  extreme <- head(extreme, 5)

  cat("\nFive largest absolute fold changes:\n")
  print(extreme[, c(
    "Geneid", "baseMean", "log2FoldChange", "lfcSE", "padj"
  )], row.names = FALSE)

  cat("\nNormalized counts for these genes:\n")
  if (nrow(extreme) > 0) {
    print(round(nc[extreme$Geneid, , drop = FALSE], 1))
  }
}

cat("\n\n3. COMMON FOUR-STRESS GENES\n")
cat("----------------------------\n")

common_file <- file.path(de_dir, "DEGs_shared_all_four_stresses.tsv")
common <- read.delim(common_file, check.names = FALSE)$Geneid

cat("Genes in existing common file:", length(common), "\n")
cat("Genes independently found in all four comparisons:",
    length(Reduce(intersect, gene_lists)), "\n")

common <- intersect(common, Reduce(intersect, gene_lists))

direction <- sapply(stresses, function(s) {
  x <- result_tables[[s]]
  x$log2FoldChange[match(common, x$Geneid)]
})

rownames(direction) <- common

cat("Common genes with all four directions positive:",
    sum(rowSums(direction > 0, na.rm = TRUE) == 4), "\n")
cat("Common genes with all four directions negative:",
    sum(rowSums(direction < 0, na.rm = TRUE) == 4), "\n")
cat("Common genes with mixed directions:",
    sum(!(rowSums(direction > 0, na.rm = TRUE) == 4 |
          rowSums(direction < 0, na.rm = TRUE) == 4)), "\n")

cat("\nFirst 15 common genes with fold changes:\n")
print(head(data.frame(Geneid = common, direction), 15), row.names = FALSE)

cat("\n\n4. STRESS-SPECIFIC GENES: INDEPENDENT CHECK\n")
cat("--------------------------------------------\n")

for (stress in stresses) {

  others <- setdiff(stresses, stress)

  expected <- setdiff(
    gene_lists[[stress]],
    unlist(gene_lists[others])
  )

  existing_file <- file.path(
    de_dir, paste0(stress, "_specific_DEGs.tsv")
  )

  existing <- read.delim(existing_file)$Geneid

  cat("\n", stress, "\n")
  cat("Existing specific genes:", length(existing), "\n")
  cat("Recalculated specific genes:", length(expected), "\n")
  cat("Existing genes absent from recalculated set:",
      length(setdiff(existing, expected)), "\n")
  cat("Recalculated genes missing from existing set:",
      length(setdiff(expected, existing)), "\n")
}

cat("\n\n5. PAIRWISE OVERLAP RECHECK\n")
cat("----------------------------\n")

for (i in seq_len(length(stresses) - 1)) {
  for (j in (i + 1):length(stresses)) {
    a <- stresses[i]
    b <- stresses[j]

    cat(a, "-", b, ":",
        length(intersect(gene_lists[[a]], gene_lists[[b]])),
        "shared DEGs\n")
  }
}

sink()

cat("Validation report saved to:\n")
cat(file.path(de_dir, "DE_validation_report.txt"), "\n")
