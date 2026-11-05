#!/usr/bin/env bash
set -euo pipefail

BASE="$HOME/exerciseOne/07_results/01_answer"
SCRIPT="$BASE/scripts/final_question1_analysis.R"

EXPECTED=(
  "figures/Figure_1_enriched_metabolic_processes.png"
  "figures/Figure_1_enriched_metabolic_processes.pdf"
  "figures/Figure_2_top_metabolic_processes.png"
  "figures/Figure_2_top_metabolic_processes.pdf"
  "figures/Figure_3_cross_stress_metabolic_direction_heatmap.png"
  "figures/Figure_4_metabolic_response_direction.png"
  "figures/Figure_4_metabolic_response_direction.pdf"
  "tables/Q1_metabolic_process_enrichment.tsv"
  "tables/Q1_metabolic_process_direction.tsv"
  "tables/Q1_enrichment_summary.tsv"
  "tables/Q1_shared_stress_specific_processes.tsv"
  "tables/Q1_cross_stress_direction_matrix.tsv"
)

echo "Checking existing RQ1 results..."
missing=0

for file in "${EXPECTED[@]}"; do
  if [[ -s "$BASE/$file" ]]; then
    printf "FOUND  %s\n" "$file"
  else
    printf "MISSING %s\n" "$file"
    missing=1
  fi
done

if [[ "$missing" -eq 1 ]]; then
  echo
  echo "Some outputs are missing. Running the existing RQ1 analysis..."
  [[ -f "$SCRIPT" ]] || {
    echo "ERROR: Analysis script not found: $SCRIPT"
    exit 1
  }

  Rscript "$SCRIPT"

  echo
  echo "Checking outputs again..."
  failed=0
  for file in "${EXPECTED[@]}"; do
    if [[ -s "$BASE/$file" ]]; then
      printf "PASS   %s\n" "$file"
    else
      printf "MISSING %s\n" "$file"
      failed=1
    fi
  done

  if [[ "$failed" -eq 1 ]]; then
    echo "Some outputs are still missing. Review the Rscript output above."
    exit 1
  fi
else
  echo
  echo "All expected RQ1 outputs already exist. No rerun needed."
fi

echo
echo "RQ1 output check complete."
