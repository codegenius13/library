import React from 'react'
import sequenceQuality from '../../assets/exerciseOne/img/fastqc_per_base_sequence_quality_plot.png'
import adapterContent from '../../assets/exerciseOne/img/fastqc_adapter_content_plot.png'
import duplication from '../../assets/exerciseOne/img/fastqc_sequence_duplication_levels_plot.png'
import sequenceCount from '../../assets/exerciseOne/img/fastqc_sequence_counts_plot.png'

const ExercisesOne = () => {
  return (
    <div className="exercise">

      <h2>Exercise 1</h2>

      <div className="exercise-title">
        <h3>Maize RNA-seq Quality Assessment and Metabolic Response Framework</h3>

        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
        >
          [Download Exercise]
        </a>
      </div>

      <div className="exercise-content">

        {/* =========================
            MAIN PAPER
        ========================== */}

        <p>
          <strong>Main paper:</strong> Li P, Cao W, Fang H, Xu S, Yin S, Zhang Y,
          Lin D, Wang J, Chen Y, Xu C and Yang Z (2017).
          "Transcriptomic Profiling of the Maize (Zea mays L.) Leaf Response to
          Abiotic Stresses at the Seedling Stage". Frontiers in Plant Science,
          8:290. DOI: 10.3389/fpls.2017.00290
        </p>

        <a
          href="https://doi.org/10.3389/fpls.2017.00290"
          target="_blank"
          rel="noopener noreferrer"
        >
          [Read the paper]
        </a>


        {/* =========================
            RESEARCH QUESTION
        ========================== */}

        <h4>Research Question</h4>

        <p>
          How can publicly available maize RNA-seq data be quality-assessed and
          organized into a reproducible workflow for downstream gene-expression
          and metabolic pathway analysis?
        </p>


        {/* =========================
            EXERCISE SUMMARY
        ========================== */}

        <h4>Exercise Summary</h4>

        <p>
          This exercise uses publicly available B73 maize leaf RNA-seq data from
          NCBI to establish a reproducible workflow for investigating how
          environmental stress could influence gene expression and metabolic
          pathways.
        </p>

        <p>
          The completed stage of the analysis focused on the two biological
          control replicates. Four paired-end FASTQ files were assessed using
          FastQC and summarized with MultiQC to evaluate sequencing quality,
          GC distribution, sequence duplication, read-length distribution and
          adapter content.
        </p>

        <p>
          These quality-control results provide the baseline for the proposed
          downstream analysis of stress-versus-control gene expression and
          pathway-level responses.
        </p>


        {/* =========================
            DATASET
        ========================== */}

        <h4>Dataset</h4>

        <table className="results-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Organism</td>
              <td>Zea mays (maize), B73</td>
            </tr>

            <tr>
              <td>Experiment type</td>
              <td>Paired-end RNA-seq</td>
            </tr>

            <tr>
              <td>NCBI project</td>
              <td>PRJNA335771 / SRP080208</td>
            </tr>

            <tr>
              <td>Completed samples</td>
              <td>2 control biological replicates</td>
            </tr>

            <tr>
              <td>FASTQ files analysed</td>
              <td>4 paired-end files</td>
            </tr>

            <tr>
              <td>Quality-control tools</td>
              <td>FastQC and MultiQC</td>
            </tr>
          </tbody>
        </table>


        {/* =========================
            METHODOLOGY
        ========================== */}

        <h4>Completed Methodology</h4>

        <ol>

          <li>
            Publicly available B73 maize RNA-seq reads were obtained from the
            NCBI Sequence Read Archive.
          </li>

          <li>
            Two control biological replicates were selected for the completed
            quality-control analysis.
          </li>

          <li>
            FastQC was used to evaluate the quality characteristics of each
            paired-end FASTQ file independently.
          </li>

          <li>
            MultiQC was then used to combine the four FastQC reports into a
            single summary report for comparison across the control libraries.
          </li>

          <li>
            The resulting quality-control metrics were examined for sequence
            quality, GC distribution, adapter content, duplication and read
            length distribution.
          </li>

        </ol>


        {/* =========================
            RESULTS
        ========================== */}

        <h4>Results</h4>

        <h5>RNA-seq Quality Assessment</h5>

        <p>
          Four paired-end control libraries were successfully analysed with
          FastQC and summarized using MultiQC. Rather than reproducing every
          individual FastQC output, selected quality-control metrics were used
          to provide a concise assessment of the sequencing data.
        </p>


        {/* =========================
            QC SUMMARY TABLE
        ========================== */}

        <h5>Quality-Control Summary</h5>

        <table className="results-table">
          <thead>
            <tr>
              <th>QC metric</th>
              <th>Purpose</th>
              <th>Result used in this analysis</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>Sequence quality</td>
              <td>
                Assesses the quality of the nucleotide calls across the reads.
              </td>
              <td>
                Evaluated using the FastQC sequence-quality plots and MultiQC
                summary.
              </td>
            </tr>

            <tr>
              <td>GC content</td>
              <td>
                Examines the distribution of GC percentages across the reads
                and helps identify unusual sequence composition.
              </td>
              <td>
                Evaluated using the MultiQC GC-content summary.
              </td>
            </tr>

            <tr>
              <td>Adapter content</td>
              <td>
                Detects sequences associated with library adapters that may
                require trimming before downstream analysis.
              </td>
              <td>
                Evaluated using the MultiQC adapter-content plot.
              </td>
            </tr>

            <tr>
              <td>Sequence duplication</td>
              <td>
                Examines the proportion of duplicated sequences within the
                libraries.
              </td>
              <td>
                Evaluated using the MultiQC duplication summary.
              </td>
            </tr>

            <tr>
              <td>Sequence count</td>
              <td>
                Confirms the distribution and consistency of read counts.
              </td>
              <td>
                Evaluated using the sequence-count distribution.
              </td>
            </tr>

          </tbody>
        </table>


        {/* =========================
            SELECTED FIGURES
        ========================== */}

        <h5>Selected Quality-Control Outputs</h5>

        <p>
          Only the most informative QC outputs are shown below. The complete
          FastQC and MultiQC reports are retained as supporting analysis files.
        </p>


        {/* 
          IMPORTANT:
          Replace the image paths below with the actual filenames of your
          downloaded PNG/JPG images.
        */}

        <div className="qc-figures">

          <figure>
            <img
              src={sequenceQuality}
              alt="Sequence quality summary"
            />
            <figcaption>
              Figure 1. Sequence-quality distribution across the control RNA-seq
              libraries.
            </figcaption>
          </figure>


          <figure>
            <img
              src={adapterContent}
              alt="Adapter content summary"
            />
            <figcaption>
              Figure 2. Adapter-content assessment of the control RNA-seq
              libraries.
            </figcaption>
          </figure>


          <figure>
            <img
              src={duplication}
              alt="Sequence duplication summary"
            />
            <figcaption>
              Figure 3. Sequence-duplication assessment across the control
              libraries.
            </figcaption>
          </figure>


          <figure>
            <img
              src={sequenceCount}
              alt="Sequence count summary"
            />
            <figcaption>
              Figure 4. Sequence-count distribution of the analysed reads.
            </figcaption>
          </figure>

        </div>


        {/* =========================
            INTERPRETATION
        ========================== */}

        <h5>QC Interpretation</h5>

        <p>
          FastQC and MultiQC provided a quality assessment of the four control
          libraries before downstream RNA-seq analysis. The sequence-quality
          plots were used to evaluate whether read quality was maintained across
          the sequencing cycles, while GC-content and read-length distributions
          were examined for unusual patterns.
        </p>

        <p>
          Adapter-content results were inspected to determine whether technical
          adapter sequences may require removal. Sequence duplication was also
          evaluated because unusually high duplication can affect downstream
          expression analyses and may indicate highly abundant transcripts or
          technical duplication.
        </p>

        <p>
          Overall, this quality-control stage establishes whether the control
          libraries are sufficiently characterized for progression to read
          preprocessing, alignment or transcript quantification.
        </p>


        {/* =========================
            DOWNSTREAM WORKFLOW
        ========================== */}

        <h4>Proposed Downstream Analysis</h4>

        <p>
          The following stages were defined as the next step of the project but
          were not completed in the current control-only analysis.
        </p>

        <ol>

          <li>
            Trim adapters and low-quality bases if required by the QC results.
          </li>

          <li>
            Align the cleaned reads to the maize B73 reference genome or perform
            transcript-level quantification.
          </li>

          <li>
            Generate a gene-expression matrix for all control and stress
            conditions.
          </li>

          <li>
            Compare stress conditions against control using differential
            expression analysis.
          </li>

          <li>
            Identify differentially expressed genes associated with metabolic
            enzymes.
          </li>

          <li>
            Map metabolic genes to pathways using maize metabolic resources or
            KEGG/PlantCyc-based annotations.
          </li>

          <li>
            Calculate pathway-level response patterns based on the direction and
            magnitude of gene-expression changes.
          </li>

          <li>
            Compare pathway responses between stresses to identify shared and
            stress-specific metabolic signatures.
          </li>

        </ol>


        {/* =========================
            WORKFLOW
        ========================== */}

        <h5>Analysis Workflow</h5>

        <div className="workflow">

          <p>
            <strong>
              FASTQ.gz → FastQC → MultiQC → QC assessment →
              preprocessing → alignment/quantification →
              differential expression → metabolic genes →
              pathway mapping → pathway response analysis
            </strong>
          </p>

        </div>


        {/* =========================
            LIMITATIONS
        ========================== */}

        <h4>Limitations</h4>

        <p>
          The completed analysis contains control samples only. Therefore,
          stress-versus-control differential expression, stress-specific
          metabolic responses and pathway changes cannot be calculated from the
          completed dataset alone.
        </p>

        <p>
          The downstream stress and metabolic analyses presented above represent
          the proposed continuation of the workflow rather than completed
          experimental results. Any biological interpretation would also require
          additional evidence because transcript-level changes do not directly
          establish physiological or biochemical changes in the plant.
        </p>


        {/* =========================
            CONCLUSION
        ========================== */}

        <h4>Conclusion</h4>

        <p>
          The completed stage established a reproducible RNA-seq quality-control
          workflow for two biological control replicates of B73 maize leaf
          samples. FastQC and MultiQC were used to characterize the sequencing
          data and establish a baseline for downstream transcriptomic analysis.
        </p>

        <p>
          The resulting workflow can subsequently be expanded with the remaining
          stress libraries to perform differential-expression and metabolic
          pathway analysis.
        </p>


        {/* =========================
            REFERENCES
        ========================== */}

        <h4 id="references">References</h4>

        <ul>

          <li>
            Li P, Cao W, Fang H, Xu S, Yin S, Zhang Y, Lin D, Wang J, Chen Y,
            Xu C and Yang Z. (2017). "Transcriptomic Profiling of the Maize
            (Zea mays L.) Leaf Response to Abiotic Stresses at the Seedling
            Stage". Frontiers in Plant Science, 8:290.
            DOI: 10.3389/fpls.2017.00290
          </li>

          <li>
            Yang HH, Hu Y, Buetow KH and Lee MP. (2004). "A computational
            approach to measuring coherence of gene expression in pathways".
            Genomics, 84(1), 211–217.
          </li>

          <li>
            Levine DM, Haynor DR, Castle JC, et al. (2006).
            "Pathway and gene-set activation measurement from mRNA expression
            data". Genome Biology, 7, R93.
          </li>

          <li>
            Schläpfer P, Zhang P, Wang C, et al. (2017).
            "Genome-Wide Prediction of Metabolic Enzymes, Pathways, and Gene
            Clusters in Plants". Plant Physiology, 173(4), 2041–2059.
          </li>

        </ul>


        {/* =========================
            RESOURCES
        ========================== */}

        {/*<h4>Resources</h4>

        <div className="exercise-resources">

          <a
            href="https://www.ncbi.nlm.nih.gov/sra/SRP080208?"
            target="_blank"
            rel="noopener noreferrer"
          >
            [Download NCBI Dataset]
          </a>

          <a
            href="/exerciseOne/exercise_one_pseudocode.txt"
            download="exercise_one_pseudocode.txt"
          >
            [Download Pseudocode]
          </a>

          <a
            href="/exerciseOne/multiQC/multiqc_report.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            [View MultiQC Report]
          </a>


        </div>*/}

      </div>
    </div>
  )
}

export default ExercisesOne




{/*import React from 'react'

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

        <h4>Results</h4>
        <h5>RNA-seq Quality Assessment</h5>
        <p>Four paired-end control libraries were evaluated using FastQC and summarized with MultiQC. Overall sequencing quality, GC distribution, adapter contamination, and sequence duplication were assessed to determine whether the control reads were suitable for downstream RNA-seq analysis.</p>
        

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

export default ExercisesOne*/}