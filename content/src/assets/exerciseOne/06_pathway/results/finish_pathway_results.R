library(dplyr)
library(tidyr)
library(ggplot2)
library(pheatmap)

RES <- path.expand("~/exerciseOne/06_pathway/results")

stresses <- c("Cold", "Drought", "Heat", "Salinity")

# ------------------------------------------------------------
# 1. Read the four completed enrichment files
# ------------------------------------------------------------

files <- file.path(
    RES,
    paste0(stresses, "_metabolic_pathway_enrichment.tsv")
)

results <- lapply(seq_along(files), function(i) {

    x <- read.delim(
        files[i],
        stringsAsFactors = FALSE,
        check.names = FALSE
    )

    x$Stress <- stresses[i]

    x
})

combined <- bind_rows(results)

cat("Total enrichment records:", nrow(combined), "\n")

# ------------------------------------------------------------
# 2. Combined enrichment table
# ------------------------------------------------------------

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
# 3. Top 10 processes per stress
# ------------------------------------------------------------

top10 <- combined %>%
    group_by(Stress) %>%
    arrange(p.adjust, desc(Count), .by_group = TRUE) %>%
    slice_head(n = 10) %>%
    ungroup()

write.table(
    top10,
    file.path(
        RES,
        "top10_metabolic_processes_per_stress.tsv"
    ),
    sep = "\t",
    quote = FALSE,
    row.names = FALSE
)

# ------------------------------------------------------------
# 4. Shared metabolic processes
# ------------------------------------------------------------

shared <- combined %>%
    group_by(ID, Description) %>%
    summarise(
        Stress_Count = n_distinct(Stress),
        Stresses = paste(
            sort(unique(Stress)),
            collapse = ";"
        ),
        .groups = "drop"
    ) %>%
    arrange(
        desc(Stress_Count),
        Description
    )

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
# 5. Summary per stress
# ------------------------------------------------------------

summary <- combined %>%
    group_by(Stress) %>%
    summarise(
        Enriched_Metabolic_Processes = n(),
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
# 6. Plot: number of enriched processes
# ------------------------------------------------------------

p <- ggplot(
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
    p,
    width = 9,
    height = 6,
    dpi = 300
)

# ------------------------------------------------------------
# 7. Shared-process heatmap
# ------------------------------------------------------------

top_shared <- shared %>%
    slice_head(n = 20)

heat <- combined %>%
    filter(
        ID %in% top_shared$ID
    ) %>%
    select(
        ID,
        Description,
        Stress,
        Count
    ) %>%
    group_by(ID, Description, Stress) %>%
    summarise(
        Count = sum(Count),
        .groups = "drop"
    ) %>%
    pivot_wider(
        names_from = Stress,
        values_from = Count,
        values_fill = 0
    )

# Make sure all four stress columns exist
for (s in stresses) {
    if (!(s %in% colnames(heat))) {
        heat[[s]] <- 0
    }
}

heat <- heat[, c(
    "ID",
    "Description",
    stresses
)]

mat <- as.matrix(
    heat[, stresses, drop = FALSE]
)

rownames(mat) <- heat$Description

png(
    file.path(
        RES,
        "top_shared_metabolic_processes_heatmap.png"
    ),
    width = 2000,
    height = 1600,
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

# ------------------------------------------------------------
# 8. Final report
# ------------------------------------------------------------

cat("\n")
cat("==================================================\n")
cat("STEP 39 — PATHWAY ANALYSIS COMPLETE\n")
cat("==================================================\n\n")

cat("Enriched metabolic processes:\n")
print(summary)

cat("\nTop shared processes:\n")
print(
    shared %>%
        slice_head(n = 15)
)

cat("\nResults written to:\n")
cat(RES, "\n")
