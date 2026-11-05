# ============================================================
# Maize RNA-seq DEG Overlap Analysis
# ============================================================

de_dir <- file.path(
  Sys.getenv("HOME"),
  "exerciseOne/05_DE_analysis"
)

# ------------------------------------------------------------
# 1. Read DEG files
# ------------------------------------------------------------

cold <- read.delim(
  file.path(de_dir, "Cold_vs_Control_DEGs.tsv"),
  check.names = FALSE
)

drought <- read.delim(
  file.path(de_dir, "Drought_vs_Control_DEGs.tsv"),
  check.names = FALSE
)

heat <- read.delim(
  file.path(de_dir, "Heat_vs_Control_DEGs.tsv"),
  check.names = FALSE
)

salinity <- read.delim(
  file.path(de_dir, "Salinity_vs_Control_DEGs.tsv"),
  check.names = FALSE
)

# ------------------------------------------------------------
# 2. Extract gene IDs
# ------------------------------------------------------------

cold_genes <- unique(cold$Geneid)
drought_genes <- unique(drought$Geneid)
heat_genes <- unique(heat$Geneid)
salinity_genes <- unique(salinity$Geneid)

# ------------------------------------------------------------
# 3. Shared by all four stresses
# ------------------------------------------------------------

shared_all <- Reduce(
  intersect,
  list(
    cold_genes,
    drought_genes,
    heat_genes,
    salinity_genes
  )
)

write.table(
  data.frame(Geneid = shared_all),
  file.path(de_dir, "DEGs_shared_all_four_stresses.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# ------------------------------------------------------------
# 4. Stress-specific DEGs
# ------------------------------------------------------------

cold_specific <- cold_genes[
  !(cold_genes %in% drought_genes) &
  !(cold_genes %in% heat_genes) &
  !(cold_genes %in% salinity_genes)
]

drought_specific <- drought_genes[
  !(drought_genes %in% cold_genes) &
  !(drought_genes %in% heat_genes) &
  !(drought_genes %in% salinity_genes)
]

heat_specific <- heat_genes[
  !(heat_genes %in% cold_genes) &
  !(heat_genes %in% drought_genes) &
  !(heat_genes %in% salinity_genes)
]

salinity_specific <- salinity_genes[
  !(salinity_genes %in% cold_genes) &
  !(salinity_genes %in% drought_genes) &
  !(salinity_genes %in% heat_genes)
]

# ------------------------------------------------------------
# 5. Save stress-specific DEG lists
# ------------------------------------------------------------

write.table(
  data.frame(Geneid = cold_specific),
  file.path(de_dir, "Cold_specific_DEGs.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

write.table(
  data.frame(Geneid = drought_specific),
  file.path(de_dir, "Drought_specific_DEGs.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

write.table(
  data.frame(Geneid = heat_specific),
  file.path(de_dir, "Heat_specific_DEGs.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

write.table(
  data.frame(Geneid = salinity_specific),
  file.path(de_dir, "Salinity_specific_DEGs.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# ------------------------------------------------------------
# 6. Pairwise overlaps
# ------------------------------------------------------------

pairwise <- data.frame(
  Comparison = c(
    "Cold_Drought",
    "Cold_Heat",
    "Cold_Salinity",
    "Drought_Heat",
    "Drought_Salinity",
    "Heat_Salinity"
  ),
  Shared_DEGs = c(
    length(intersect(cold_genes, drought_genes)),
    length(intersect(cold_genes, heat_genes)),
    length(intersect(cold_genes, salinity_genes)),
    length(intersect(drought_genes, heat_genes)),
    length(intersect(drought_genes, salinity_genes)),
    length(intersect(heat_genes, salinity_genes))
  )
)

write.table(
  pairwise,
  file.path(de_dir, "pairwise_DEG_overlap.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# ------------------------------------------------------------
# 7. Summary
# ------------------------------------------------------------

summary_table <- data.frame(
  Stress = c(
    "Cold",
    "Drought",
    "Heat",
    "Salinity"
  ),
  Total_DEGs = c(
    length(cold_genes),
    length(drought_genes),
    length(heat_genes),
    length(salinity_genes)
  ),
  Stress_specific = c(
    length(cold_specific),
    length(drought_specific),
    length(heat_specific),
    length(salinity_specific)
  )
)

write.table(
  summary_table,
  file.path(de_dir, "DEG_overlap_summary.tsv"),
  sep = "\t",
  quote = FALSE,
  row.names = FALSE
)

# ------------------------------------------------------------
# 8. Console output
# ------------------------------------------------------------

cat("\n============================================================\n")
cat("DEG OVERLAP ANALYSIS COMPLETED\n")
cat("============================================================\n\n")

cat(
  "DEGs shared by all four stresses:",
  length(shared_all),
  "\n\n"
)

cat("Stress-specific DEGs:\n")
print(summary_table)

cat("\nPairwise overlaps:\n")
print(pairwise)

cat("\n============================================================\n")
