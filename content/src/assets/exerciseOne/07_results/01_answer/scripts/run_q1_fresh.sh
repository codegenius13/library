#!/usr/bin/env bash
set -euo pipefail

cd "$HOME/exerciseOne"

echo "Starting fresh Question 1 analysis..."
Rscript 07_results/01_answer/scripts/q1_fresh_analysis.R

echo
echo "Checking generated Q1 figures..."

for name in \
    Figure_1_enriched_metabolic_processes \
    Figure_2_top_metabolic_processes \
    Figure_3_cross_stress_metabolic_direction_heatmap \
    Figure_4_metabolic_response_direction
do
    for ext in png pdf; do
        file="07_results/01_answer/figures/${name}.${ext}"
        if [[ ! -s "$file" ]]; then
            echo "ERROR: Missing or empty file: $file"
            exit 1
        fi
        echo "OK: $file"
    done
done

echo
echo "Checking sample QC figures..."

for name in \
    Figure_5_sample_library_sizes \
    Figure_6_sample_PCA_top500 \
    Figure_7_sample_Pearson_correlation \
    Figure_8_sample_Euclidean_distance
do
    for ext in png pdf; do
        file="07_results/01_answer/qc_sample_level/figures/${name}.${ext}"
        if [[ ! -s "$file" ]]; then
            echo "ERROR: Missing or empty file: $file"
            exit 1
        fi
        echo "OK: $file"
    done
done

echo
echo "Question 1 analysis and output checks completed."
