import React from 'react'

const ExercisesOne = () => {
  return (
    <div className='exercise'>
      <h2>Exercise 1</h2>
      <div className='exercise-title'>
        <h3>Maize Environmental Stress–to–Metabolic Response Analysis</h3>
        <a href="" target='_blank' rel='noopener noreferrer'>[Download Exercise]</a>
      </div>
      <div className='exercise-content'>
        <p>
          <strong>Main paper:</strong> Li P, Cao W, Fang H, Xu S, Yin S, Zhang Y, Lin D, Wang J, Chen Y, Xu C and Yang Z (2017) "Transcriptomic Profiling of the Maize (Zea mays L.) Leaf Response to Abiotic Stresses at the Seedling Stage". Frontiers Plant Science. 8:290. sdoi: 10.3389/fpls.2017.00290
        </p>
        <a href="https://doi.org/10.3389/fpls.2017.00290" target='_blank' rel='noopener noreferrer'>[Read the paper]</a>
        <h4>Research Question</h4>
        <p>How can stress-responsive gene expression in maize be computationally organized into enzyme-level and pathway-level changes to determine whether metabolic pathways show coordinated, conflicting, or stress-specific responses, and what biochemical processes might these patterns suggest for downstream plant development?</p>
        <h4>Exercise Summary</h4>
        <p>We will re-analyze the publicly available B73 maize RNA‑seq datasets from NCBI (Li et al., 2017) under control, cold, drought and heat stress with a focus on metabolic pathways.
          The goal is to examine how genes encoding metabolic enzymes respond. Specifically, we will compute quantitative “pathway response” metrics that capture the proportion and direction of enzyme‐gene changes within each pathway.
          This pipeline will use standard tools FastQC, STAR/HISAT2 or Salmon, DESeq2, clusterProfiler or g:Profiler together with custom Python/R scripts for pathway scoring and overlap analysis.
          This will reveal which pathways are coordinately up- or down-regulated
          (vs. those with mixed responses) in each stress condition. By comparing these patterns across stresses, we will identify stress-specific vs. shared metabolic signatures, and propose hypotheses for how such biochemical changes might influence later growth or quality, without claiming direct physiological measurements.
          All data and methods are drawn from established sources <a href="#references">[see References]</a> but assembled here in a new workflow.
        </p>
        <h4>Methodology</h4>
        <ul>
          <li>Download the B73 leaf RNA‑seq FASTQ files from NCBI (SRA accession SRP080208) for control and four stress conditions (salinity, drought, heat, cold; two replicates each). Li
            et al.
            (2017) originally identified 5,330 DEGs in these data (q≤0.05, |log₂FC|≥1), with 167 genes common to all stresses. We will use the raw reads as input.</li>
          <li>Run FastQC/MultiQC on raw reads to inspect quality, adapter content, GC distribution. Trim adapters and low-quality bases using
            fastp
            (or Trimmomatic) if needed. Ensure post-QC metrics are acceptable, similar to Li
            et al.
            (who reported very high‐quality clean data).</li>

          <li>Obtain the maize B73 reference genome (AGPv4) and GTF annotation. Align cleaned reads with a splice-aware aligner (STAR/ HISAT2) and then count reads per gene with featureCounts (or use a quasi-mapper like Salmon). Inspect mapping rates and sample correlations. Perform a PCA or heatmap on samples to confirm replicates cluster and stresses separate.</li>

          <li>Use DESeq2 (or edgeR) in R to compare each stress vs. control. Apply the same cutoffs as Li
            et al.
            for consistency (adjusted
            p
            ≤0.05, |log₂FC|≥1). This yields three DEG sets (Cold, Drought, Heat) for downstream analysis. (Optionally, retain salinity as well or ignore it if simplifying.) Confirm DE counts are of similar magnitude (thousands of DEGs per stress).</li>

          <li>From the DE gene lists, identify those encoding
            metabolic enzymes
            . For example, use the Plant Metabolic Network (PMN/PlantCyc) or KEGG annotations to map gene IDs to enzymatic functions and metabolic pathways. Schläpfer
            et al.
            (2017) describe a pipeline (E2P2 + Pathway Tools + SAVI) to annotate plant enzymes and pathways at genome scale. In practice, we will query resources like MaizeCyc or use KEGG orthology mapping to assign each DEG to one or more metabolic pathways.</li>

          <li>For each metabolic pathway (defined by PMN/KEGG, excluding very small sets), gather all enzyme-encoding genes present among the DEGs. Compute statistics describing the pathway’s transcriptional response in each stress. <span style={{ fontStyle: 'italic' }}> The
            proportion
            of pathway enzymes that are significantly up- or down-regulated, the
            mean
            and
            median
            fold-change, and a
            coherence score
            that measures directional consistency. </span>
            We can adapt the idea of Yang
            et al.
            (2004), who defined a
            coherence indicator
            as the fraction of gene pairs with significantpositive coexpression in a pathway.
            here, instead we may define coherence as the fraction of enzymes changing in the same direction (e.g. mostly up vs. mostly down). We will also compare to random gene-sets of the same size (per Yang
            et al.
            ) to assess significance of the coherence. By these metrics, a pathway can be classified as
            coherently up-
            regulated, coherently down-regulated, mixed
            (conflicting directions), or
            unresponsive
            under each stress.
          </li>

          <li>Aggregate the pathway scores into a matrix (pathways × stresses). Identify pathways with strong coordinated responses unique to one stress, and pathways with similar responses in multiple stresses. We might use UpSet plots or heatmaps toshow overlaps of “high-response” pathways across stresses. We will also perform a secondary GO/KEGG enrichment (using tools like clusterProfiler or g:Profiler) on the sets of stress-specific vs. shared DEGs to see if those confirm the pathway trends (as a sanity check).</li>
          <li>Relate these patterns to plant biochemical responses.
            <br /><br /><span style={{ fontStyle: 'italic' }}><strong>NOTE:</strong> This is just an analysis and we can't say for sure if this is the actual physiological response of the plant. We can only hypothesize based on the gene expression data and known metabolic pathways. For instance, if a pathway involved in osmoprotectant synthesis is up-regulated under drought, we might hypothesize that the plant is preparing for water stress. If a photosynthesis-related pathway is down-regulated under heat stress, we might suggest that the plant is reducing energy expenditure to cope with heat.</span></li>
        </ul>

        <h4>Workflow Analysis</h4>

        <h4 id='references'>References</h4>
        <ul>
          <li>Li P, Cao W, Fang H, Xu S, Yin S, Zhang Y, Lin D, Wang J, Chen Y, Xu C and Yang Z (2017) "Transcriptomic Profiling of the Maize (Zea mays L.) Leaf Response to Abiotic Stresses at the Seedling Stage". Frontiers Plant Science. Volume 8, Issue 290. doi: 10.3389/fpls.2017.00290</li>
          <li>Howard H Yang, Ying Hu, Kenneth H Buetow, Maxwell P Lee,
            "A computational approach to measuring coherence of gene expression in pathways",
            Genomics,
            Volume 84, Issue 1,
            2004,
            Pages 211-217,
            ISSN 0888-7543,
            https://doi.org/10.1016/j.ygeno.2004.01.007.</li>
          <li>Levine DM, Haynor DR, Castle JC, et al. (2006). "Pathway and gene-set activation measurement from mRNA expression data: the tissue distribution of human pathways". Genome Biology, 7, R93.</li>
          <li>Schläpfer P, Zhang P, Wang C, et al. (2017). "Genome-Wide Prediction of Metabolic Enzymes, Pathways, and Gene Clusters in Plants". Plant Physiology, 173(4), 2041–2059.</li>
        </ul>

        <h4>Resources</h4>
        <div className='exercise-resources'>
          <a href="" target='_blank' rel='noopener noreferrer'>[Download Datasets from NCBI]</a>
          <a href="" target='_blank' rel='noopener noreferrer'>[Download Pseudocode]</a>
          <a href="" target='_blank' rel='noopener noreferrer'>[Download Python Scripts]</a>
        </div>
      </div>
    </div>
  )
}

export default ExercisesOne