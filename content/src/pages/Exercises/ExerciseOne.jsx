
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Styles.css";
import img01 from "../../assets/exerciseOne/img01.png";
import img02 from "../../assets/exerciseOne/img02.png";
import img03 from "../../assets/exerciseOne/img03.png";
import img04 from "../../assets/exerciseOne/img04.png";
import img05 from "../../assets/exerciseOne/img05.png";
import img06 from "../../assets/exerciseOne/img06.png";
import img07 from "../../assets/exerciseOne/img07.png";


/* =========================================
   PRACTICAL EXERCISE CONFIGURATION
   Reuse this structure for ExerciseTwo.jsx.
========================================= */

// Add the paths to your actual downloadable files here.
// Leave a value empty until the file is available.
const DOWNLOAD_FILES = {
    pdf: "",
    supplementary: "",
    processedData: "",
    analysisCode: "",
};

// Page navigation
const articleSections = [
    { id: "analysis-approach", label: "Analysis Approach" },
    { id: "methodology", label: "Practice Methodology" },
    { id: "discussion", label: "Discussion" },
    { id: "references", label: "References" },
];

// Figure placeholders
const figureAssets = [
    {
        id: "figure-1",
        number: "01",
        title: "Figure 1 — Figure title comes here",
        caption: "Figure 1 caption comes here.",
    },
    {
        id: "figure-2",
        number: "02",
        title: "Figure 2 — Figure title comes here",
        caption: "Figure 2 caption comes here.",
    },
    {
        id: "figure-3",
        number: "03",
        title: "Figure 3 — Figure title comes here",
        caption: "Figure 3 caption comes here.",
    },
    {
        id: "figure-4",
        number: "04",
        title: "Figure 4 — Figure title comes here",
        caption: "Figure 4 caption comes here.",
    },
];

// Table placeholders
const tableAssets = [
    {
        id: "table-1",
        number: "01",
        title: "Table 1 — Table title comes here",
        caption: "Table 1 caption comes here.",
    },
    {
        id: "table-2",
        number: "02",
        title: "Table 2 — Table title comes here",
        caption: "Table 2 caption comes here.",
    },
    {
        id: "table-3",
        number: "03",
        title: "Table 3 — Table title comes here",
        caption: "Table 3 caption comes here.",
    },
    {
        id: "table-4",
        number: "04",
        title: "Table 4 — Table title comes here",
        caption: "Table 4 caption comes here.",
    },
];


/* =========================================
   REUSABLE ASSET CARD
========================================= */

const ResearchAssetCard = ({ asset, onView }) => {
    return (
        <article className="rl-asset-card">

            <div className="rl-asset-card-heading">
            </div>

            <div className="rl-asset-card-details">

                <h4>{asset.title}</h4>

                <p>{asset.caption}</p>

                <button
                    type="button"
                    className="rl-asset-view-button"
                    onClick={() => onView(asset)}
                >
                    View {asset.type.toLowerCase()}
                    <span>↗</span>
                </button>

            </div>

        </article>
    );
};


/* =========================================
   MAIN EXERCISE PAGE
========================================= */


const rankedCandidateData = [
    {
        stress: "Cold",
        candidates: [
            { gene: "Zm00001d042107", log2FC: "+4.7664", go: "GO:0032440" },
            { gene: "Zm00001d039524", log2FC: "+8.1181", go: "GO:0004672" },
            { gene: "Zm00001d022451", log2FC: "+8.3880", go: "GO:0004674" },
            { gene: "Zm00001d028806", log2FC: "+5.3963", go: "GO:0010301" },
            { gene: "Zm00001d016719", log2FC: "+7.0867", go: "GO:0004842; GO:0016881" },
        ],
    },
    {
        stress: "Drought",
        candidates: [
            { gene: "Zm00001d000316", log2FC: "−3.7322", go: "GO:0004471; GO:0004473; GO:0016652" },
            { gene: "Zm00001d046234", log2FC: "−8.5858", go: "GO:0050113" },
            { gene: "Zm00001d025707", log2FC: "−10.1321", go: "GO:0004402; GO:0031625" },
            { gene: "Zm00001d037232", log2FC: "+9.2015", go: "GO:0004176; GO:0004222" },
            { gene: "Zm00001d031300", log2FC: "−8.3965", go: "GO:0047268; GO:0047274" },
        ],
    },
    {
        stress: "Heat",
        candidates: [
            { gene: "Zm00001d028408", log2FC: "+13.4771", go: "GO:0004109" },
            { gene: "Zm00001d047799", log2FC: "+12.0739", go: "GO:0032440" },
            { gene: "Zm00001d014486", log2FC: "+5.5846", go: "GO:0004252; GO:0043817" },
            { gene: "Zm00001d047302", log2FC: "+4.8784", go: "GO:0017111" },
            { gene: "Zm00001d037232", log2FC: "+10.5641", go: "GO:0004176; GO:0004222" },
        ],
    },
    {
        stress: "Salinity",
        candidates: [
            { gene: "Zm00001d038003", log2FC: "−6.1446", go: "GO:0016787" },
            { gene: "Zm00001d016719", log2FC: "+6.0878", go: "GO:0004842; GO:0016881" },
            { gene: "Zm00001d042107", log2FC: "+3.0661", go: "GO:0032440" },
            { gene: "Zm00001d019002", log2FC: "+2.8357", go: "GO:0008234" },
            { gene: "Zm00001d025528", log2FC: "−4.6177", go: "GO:0047036; GO:0047939; GO:0050388" },
        ],
    },
];

const q1Q2ConnectionData = [
    {
        stress: "Cold",
        totalCandidates: 598,
        totalUp: 315,
        totalDown: 283,
        processes: [
            {
                process: "Ethylene biosynthetic process",
                go: "GO:0009693",
                associatedGenes: 20,
                up: 18,
                down: 2,
                direction: "Predominantly upregulated",
            },
        ],
    },
    {
        stress: "Drought",
        totalCandidates: 919,
        totalUp: 467,
        totalDown: 452,
        processes: [
            {
                process: "Photosynthetic electron transport in photosystem I",
                go: "GO:0009773",
                associatedGenes: 10,
                up: 0,
                down: 10,
                direction: "Predominantly downregulated",
            },
            {
                process: "Raffinose catabolic process",
                go: "GO:0034484",
                associatedGenes: 5,
                up: 2,
                down: 3,
                direction: "Mixed",
            },
            {
                process: "Ethylene biosynthetic process",
                go: "GO:0009693",
                associatedGenes: 20,
                up: 12,
                down: 8,
                direction: "Mixed",
            },
            {
                process: "Trehalose biosynthetic process",
                go: "GO:0005992",
                associatedGenes: 9,
                up: 0,
                down: 9,
                direction: "Predominantly downregulated",
            },
            {
                process: "Amine catabolic process",
                go: "GO:0009310",
                associatedGenes: 5,
                up: 1,
                down: 4,
                direction: "Predominantly downregulated",
            },
        ],
    },
    {
        stress: "Heat",
        totalCandidates: 1599,
        totalUp: 908,
        totalDown: 691,
        processes: [
            {
                process: "Protein folding",
                go: "GO:0006457",
                associatedGenes: 46,
                up: 41,
                down: 5,
                direction: "Predominantly upregulated",
            },
        ],
    },
    {
        stress: "Salinity",
        totalCandidates: 840,
        totalUp: 569,
        totalDown: 271,
        processes: [
            {
                process: "Lignin biosynthetic process",
                go: "GO:0009809",
                associatedGenes: 16,
                up: 15,
                down: 1,
                direction: "Predominantly upregulated",
            },
            {
                process: "Jasmonic acid biosynthetic process",
                go: "GO:0009695",
                associatedGenes: 25,
                up: 20,
                down: 5,
                direction: "Predominantly upregulated",
            },
            {
                process: "Trehalose biosynthetic process",
                go: "GO:0005992",
                associatedGenes: 9,
                up: 1,
                down: 8,
                direction: "Predominantly downregulated",
            },
            {
                process: "Ethylene biosynthetic process",
                go: "GO:0009693",
                associatedGenes: 19,
                up: 18,
                down: 1,
                direction: "Predominantly upregulated",
            },
        ],
    },
];


const ExerciseOne = () => {

    const [activeAsset, setActiveAsset] = useState(null);

    const availableDownloads = [
        {
            label: "Download research PDF",
            path: DOWNLOAD_FILES.pdf,
            filename: "Exercise-One.pdf",
        },
        {
            label: "Download supplementary materials",
            path: DOWNLOAD_FILES.supplementary,
            filename: "Exercise-One-Supplementary.zip",
        },
        {
            label: "Download processed data",
            path: DOWNLOAD_FILES.processedData,
            filename: "Exercise-One-Data.zip",
        },
        {
            label: "Download analysis scripts",
            path: DOWNLOAD_FILES.analysisCode,
            filename: "Exercise-One-Code.zip",
        },
    ].filter((file) => file.path);


    // Figure and table preview content.
    // Add the actual image/table content inside the relevant placeholders.
    const renderAssetContent = (asset) => {

        if (asset.type === "Figure") {
            return (
                <div className="rl-figure-placeholder">

                    {/* figure content comes here */}
                    <img src={img01} alt={`Figure ${asset.number}`} />

                    <div className="rl-placeholder-symbol">
                        <span>FIGURE</span>
                        <strong>{asset.number}</strong>
                    </div>

                    <p>Figure content comes here</p>

                </div>
            );
        }

        return (
            <div className="rl-table-placeholder">

                {/* table content comes here */}

                <div className="rl-placeholder-symbol">
                    <span>TABLE</span>
                    <strong>{asset.number}</strong>
                </div>

                <p>Table content comes here</p>

            </div>
        );
    };


    const allAssets = [
        ...figureAssets.map((asset) => ({
            ...asset,
            type: "Figure",
        })),
        ...tableAssets.map((asset) => ({
            ...asset,
            type: "Table",
        })),
    ];


    return (

        <main className="research-library">

            {/* =====================================
                ARTICLE HEADER
            ====================================== */}

            <header className="rl-article-header">

                <div className="rl-article-container">

                    <div className="rl-breadcrumb">

                        <Link to="/">Practical Library</Link>

                        <span>/</span>

                        <span>Exercise 01</span>

                    </div>


                    <div className="rl-article-status">

                        <span className="rl-status-dot"></span>

                        INDEPENDENT PRACTICAL EXERCISE

                        <span className="rl-status-divider">|</span>

                        NOT PEER REVIEWED

                    </div>


                    <h1 className="rl-article-title">
                        Comparative Transcriptomic Analysis of Metabolic Gene
                        Expression and Potential Regulatory Responses in
                        Seedling-Stage Maize (<i>Zea mays</i>) under Drought,
                        Salinity, Heat, and Cold Stress
                    </h1>


                    {/* Author information can be added here when ready */}
                    <div className="rl-article-authors">
                        {/* author information comes here */}
                    </div>


                    <div className="rl-article-meta-grid">

                        <div className="rl-article-meta-item">

                            <span>PRACTICAL AREA</span>

                            <strong>Plant Transcriptomics</strong>

                        </div>


                        <div className="rl-article-meta-item">

                            <span>ORGANISM</span>

                            <strong>Seedling-Stage Maize</strong>

                        </div>


                        <div className="rl-article-meta-item">

                            <span>DATASET</span>

                            <strong>NCBI SRA · SRP080208</strong>

                        </div>


                        <div className="rl-article-meta-item">

                            <span>ANALYTICAL APPROACH</span>

                            <strong>Reanalysis, RNA-seq and Bioinformatics</strong>

                        </div>

                    </div>


                    {/* Article actions */}

                    <div className="rl-article-actions">


                        <a
                            href="https://www.ncbi.nlm.nih.gov/sra/?term=SRP080208"
                            target="_blank"
                            rel="noreferrer"
                            className="rl-action-secondary"
                        >
                            <span>↗</span>
                            Access Source Dataset
                        </a>


                        <a
                            href="https://doi.org/10.3389/fpls.2017.00290"
                            target="_blank"
                            rel="noreferrer"
                            className="rl-action-secondary"
                        >
                            <span>↗</span>
                            Original Study
                        </a>


                        {availableDownloads.map((file) => (

                            <a
                                key={file.label}
                                href={file.path}
                                download={file.filename}
                                className="rl-action-download"
                            >
                                <span>↓</span>
                                {file.label}
                            </a>

                        ))}

                    </div>

                </div>

            </header>


            {/* =====================================
                ARTICLE BODY LAYOUT
            ====================================== */}

            <div className="rl-article-container rl-article-layout">


                {/* =================================
                    LEFT ARTICLE NAVIGATION
                ================================== */}

                <aside className="rl-article-toc">

                    <div className="rl-toc-heading">

                        <span>PROJECT CONTENTS</span>

                    </div>


                    <nav className="rl-toc-navigation">

                        {articleSections.map((section) => (

                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="rl-toc-link"
                            >
                                {section.label}
                            </a>

                        ))}

                    </nav>


                    <div className="rl-toc-note">

                        <span className="rl-toc-note-icon">i</span>

                        <p>
                            Explore the analysis approach, discussion,
                            and visual outputs from this exercise.
                        </p>

                    </div>

                </aside>



                {/* =================================
                    MAIN PROJECT CONTENT
                ================================== */}

                <article className="rl-manuscript">


                    {/* ANALYSIS APPROACH */}

                    <section
                        id="analysis-approach"
                        className="rl-paper-section"
                    >

                        <div className="rl-section-title-area">

                            <h2>Analysis Approach</h2>

                        </div>


                        <div className="rl-content-placeholder">

                            <p>
                                This exercise presents a computational practical reanalysis of publicly available B73 maize RNA-seq data from NCBI (SRP080208), originally generated by Li et al. (2017). The dataset includes control samples and samples exposed to drought, salinity, heat, and cold stress. The analysis focused on examining metabolic gene expression patterns and exploring their associations with responses to the different stress conditions.
                                The analysis was approached through two main practices written below. The computational workflow involved sequence quality assessment, read processing, reference genome alignment, gene quantification, differential expression analysis, functional enrichment, and the examination of metabolic and transcription-factor-associated genes. Tools used included FastQC, fastp, MultiQC, HISAT2, featureCounts, DESeq2, and custom Python and R scripts.
                                Comparative and quantitative analyses were used to examine gene expression patterns, biological responses, and similarities or differences across the stress conditions. Candidate genes were also examined based on their expression patterns and functional annotations to identify potentially relevant metabolic and regulatory associations.
                                The findings are interpreted within the limits of the available transcriptomic data. Identified genes and potential regulatory relationships are considered computational candidates rather than experimentally confirmed regulators or demonstrated causes of physiological stress responses.
                                The dataset and underlying experimental work originate from the published study by Li et al. (2017), while this exercise documents an independent computational examination of the available data using the analytical approaches described below. <a href="#references">[See References]</a>
                            </p>

                        </div>


                        <div className="rl-subsection">

                            <h3>Practice 1</h3>

                            <div className="rl-content-placeholder">

                                <p>
                                    How do drought, salinity, heat, and cold stress alter the expression of metabolic enzyme genes in maize, and which biological processes show shared or stress-specific transcriptional responses across these conditions?
                                </p>

                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>Practice 2</h3>

                            <div className="rl-content-placeholder">

                                <p>
                                    Which metabolic enzyme-associated candidate genes are differentially expressed within the identified pathway responses across drought, salinity, heat, and cold stress, and which differentially expressed transcription factors represent potential regulatory candidates associated with shared or stress-specific expression patterns?
                                </p>

                            </div>

                        </div>

                    </section>


                    {/* METHODOLOGY */}

                    <section
                        id="methodology"
                        className="rl-paper-section"
                    >

                        <div className="rl-section-title-area">

                            <h2>Practice Methodology</h2>

                        </div>


                        <div className="rl-content-placeholder">

                            <ul>
                                <li>Downloaded the B73 leaf RNA‑seq FASTQ files from NCBI (SRA accession SRP080208) using SRA Toolkit for control and four stress conditions (salinity, drought, heat, cold; two replicates each).</li>
                                <li>Ran FastQC and MultiQC on raw reads to inspect quality, adapter content, GC distribution. Trimmed adapters and low-quality bases using
                                    fastp. Ensured that post-QC metrics are acceptable, similar to Li et al.
                                    (who reported very high‐quality clean data).</li>

                                <li>Obtained the maize B73 reference genome (AGPv4) and GTF annotation. Aligned cleaned reads with a splice-aware aligner using HISAT2 and then counted reads per gene with featureCounts. Inspected mapping rates and sample correlations. Performed a PCA or heatmap on samples to confirm replicates cluster and stresses separately.</li>

                                <li>Used DESeq2 in R to compare each stress vs. control. Applied the same cutoffs as Li
                                    et al.
                                    for consistency (adjusted
                                    p
                                    ≤0.05, |log₂FC|≥1). This yielded four DEG sets (Salinity, Cold, Drought, Heat). Confirmed DE counts are of similar magnitude (thousands of DEGs per stress).</li>


                                <li>Used maize B73 RefGen4 gene annotations and GO molecular-function to define DE metabolic enzymes genes. This approach was used for our practice ideas but Li et al. used direct KEGG pathway mapping </li>


                                <li>For each enriched GO biological process, gene-level log₂ fold changes from DESeq2 were used to calculate the numbers and proportions of upregulated and downregulated genes, together with the median log₂ fold change.
                                    Using a 70% directional threshold to define “coordinated” responses (≥70% of DEGs upregulated or downregulated were coordinated, responses were classified as mixed when neither direction reached the 70% threshold).
                                </li>

                                <li>The directional summaries were integrated into a process-by-stress matrix to compare shared, stress-specific, and opposing transcriptional patterns across drought, salinity, heat, and cold. Heatmaps and summary plots were generated using R and Python, while process-overlap tables were used to identify GO terms enriched across multiple stresses or restricted to individual stress conditions. GO enrichment statistics supported the interpretation of biological-process overrepresentation, while cross-stress direction summaries provided complementary evidence about expression patterns.</li>
                                <li>Examined the DESeq2 count object using library-size summaries, PCA, Pearson sample-correlation analysis, and Euclidean sample-distance analysis. Performed PCA using the 500 most variable genes to visualize sample-level expression variation. Used correlation and distance heatmaps to assess sample similarity and replicate consistency.</li>
                                <li>Differential expression results generated using DESeq2 were integrated with the RefGen4 metabolic enzyme gene annotations and the GO biological-process enrichment results. Using R and Python filtered genes based on the established significance criteria (adjusted p ≤ 0.05 and |log₂ fold change| ≥ 1), then ranked using statistical significance, magnitude and direction of expression change, and their membership in enriched metabolic processes. Cross-stress comparison and pathway-level direction summaries were used to identify genes associated with shared, stress-specific, predominantly upregulated, or predominantly downregulated.</li>
                                <li>Transcription-factor genes were also identified using PlantTFDB annotations and integrated with the DESeq2 results to determine TF genes showing significant expression changes under each stress condition.</li>
                            </ul>

                        </div>

                    </section>



                    {/* DISCUSSION */}

                    <section
                        id="discussion"
                        className="rl-paper-section"
                    >

                        <div className="rl-section-title-area">

                            <h2>Discussion</h2>

                        </div>


                        <div className="rl-content-placeholder">
                            <h4>Practice 1</h4>

                            <p> The analysis used 18,585 metabolic-enzyme genes, 25,968 genes
                                tested in the DESeq2 analysis, and 34,679 genes represented in
                                the GO biological-process annotation. Their intersection
                                produced a final enrichment background of 12,051 genes,
                                containing 31,281 GO biological-process gene-term associations.
                                This background represents metabolic-enzyme genes that were
                                tested in the differential expression analysis and had GO BP
                                annotation
                            </p>

                            <section className="rl-enrichment-table-section">

                                <div className="rl-enrichment-table-heading">
                                    <span>TABLE 1</span>
                                    <h3>
                                        Enrichment Background Composition and DEG Input Retention Audit
                                    </h3>
                                </div>

                                <div className="rl-enrichment-table-scroll">
                                    <table className="rl-enrichment-table">

                                        <thead>
                                            <tr>
                                                <th>Category</th>
                                                <th>Measure / Stress</th>
                                                <th>Number of Genes or Associations</th>
                                                <th>Retained</th>
                                                <th>Excluded</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            <tr>
                                                <td>Background composition</td>
                                                <td>Metabolic-enzyme genes</td>
                                                <td>18,585</td>
                                                <td>—</td>
                                                <td>—</td>
                                            </tr>

                                            <tr>
                                                <td>Background composition</td>
                                                <td>DESeq2-tested genes</td>
                                                <td>25,968</td>
                                                <td>—</td>
                                                <td>—</td>
                                            </tr>

                                            <tr>
                                                <td>Background composition</td>
                                                <td>GO BP-annotated genes</td>
                                                <td>34,679</td>
                                                <td>—</td>
                                                <td>—</td>
                                            </tr>

                                            <tr>
                                                <td>Background composition</td>
                                                <td>Final enrichment background</td>
                                                <td>12,051</td>
                                                <td>—</td>
                                                <td>—</td>
                                            </tr>

                                            <tr>
                                                <td>Background composition</td>
                                                <td>GO BP gene-term associations</td>
                                                <td>31,281</td>
                                                <td>—</td>
                                                <td>—</td>
                                            </tr>

                                            <tr>
                                                <td>DEG input retention</td>
                                                <td>Cold</td>
                                                <td>598</td>
                                                <td>598</td>
                                                <td>0</td>
                                            </tr>

                                            <tr>
                                                <td>DEG input retention</td>
                                                <td>Drought</td>
                                                <td>919</td>
                                                <td>919</td>
                                                <td>0</td>
                                            </tr>

                                            <tr>
                                                <td>DEG input retention</td>
                                                <td>Heat</td>
                                                <td>1,599</td>
                                                <td>1,599</td>
                                                <td>0</td>
                                            </tr>

                                            <tr>
                                                <td>DEG input retention</td>
                                                <td>Salinity</td>
                                                <td>840</td>
                                                <td>840</td>
                                                <td>0</td>
                                            </tr>

                                        </tbody>

                                    </table>
                                </div>

                                <p className="rl-enrichment-table-footnote">
                                    GO BP, Gene Ontology Biological Process; DEG, differentially expressed
                                    gene. The final enrichment background represents the intersection of
                                    metabolic-enzyme genes, DESeq2-tested genes, and GO BP-annotated genes.
                                </p>

                            </section>

                            <p>
                                All genes in the four stress-specific metabolic-enzyme DEG
                                sets were retained in the final background: 598/598 for cold,
                                919/919 for drought, 1,599/1,599 for heat, and 840/840 for
                                salinity. No input genes were excluded during background
                                matching. This provides a consistency check for the
                                enrichment input sets. Across the four stress conditions, 11 significant GO
                                biological-process term–stress associations were identified,
                                representing eight distinct GO terms. These comprised one
                                association under cold stress, five under drought stress,
                                one under heat stress, and four under salinity stress.
                                Ethylene biosynthetic process was enriched under cold,
                                drought, and salinity stress, while trehalose biosynthetic
                                process was enriched under drought and salinity stress. Under cold stress, ethylene biosynthetic process (GO:0009693) was
                                significantly enriched among the metabolic-enzyme genes, with a
                                GeneRatio of 20/598. In the enrichment background, 112 genes were
                                associated with this term. The reported RichFactor was 0.1786,
                                FoldEnrichment was 3.5986, and zScore was 6.3132. The nominal
                                p-value was 5.3480 × 10⁻⁷, with an adjusted p-value of 1.8344 ×
                                10⁻⁴ and q-value of 1.7339 × 10⁻⁴. Expression-direction analysis
                                showed that 18 of the 20 contributing genes were upregulated
                                (90.0%), whereas two genes (10.0%) were downregulated. The median
                                log2 fold change was 3.3816 and the mean log2 fold change was
                                3.4664. Thus, the contributing genes displayed a predominantly
                                upregulated transcriptional pattern under cold stress. This
                                indicates that ethylene-biosynthesis-associated genes were
                                overrepresented among the cold-responsive metabolic-enzyme genes,
                                with most showing increased transcript abundance relative to the
                                control.
                            </p>

                            <p>
                                Under drought stress, five significantly enriched biological
                                processes displayed different gene-level expression patterns.
                                Photosynthetic electron transport in photosystem I (GO:0009773)
                                had a GeneRatio of 10/919, with 28 background genes annotated to
                                the process. Its RichFactor was 0.3571, FoldEnrichment was
                                4.6833, and zScore was 5.6062. The nominal p-value was
                                2.3349 × 10⁻⁵, while the adjusted p-value was 0.00876 and the
                                q-value was 0.00816. All 10 contributing genes were downregulated,
                                with a median log2 fold change of −1.7165 and a mean of −1.9385.
                                This provides a consistent negative expression pattern among
                                the genes annotated to photosystem I electron transport. The
                                result should, however, be described as downregulation of
                                photosystem I electron-transport-associated genes rather than
                                direct evidence that photosynthetic electron transport or
                                photosynthetic efficiency was reduced, since neither was directly
                                measured in this analysis. Raffinose catabolic process
                                (GO:0034484) had a GeneRatio of 5/919, with eight background
                                genes annotated to the term. The RichFactor was 0.6250,
                                FoldEnrichment was 8.1957, and zScore was 5.8495. Its nominal
                                p-value was 1.1758 × 10⁻⁴, adjusted p-value was 0.02205, and
                                q-value was 0.02055. Two of the five contributing genes were
                                upregulated (40.0%) and three were downregulated (60.0%). The
                                median log2 fold change was −2.7211 and the mean was −2.2742.
                                Under the 70% directional classification rule, this was
                                classified as a mixed response rather than predominantly
                                upregulated or downregulated. Although raffinose-catabolism-
                                associated genes were overrepresented, their mixed directions
                                do not support describing the process as uniformly activated
                                or repressed at the transcript level. The negative mean and
                                median indicate a negative central tendency but do not override
                                the mixed gene-level pattern. Ethylene biosynthetic process
                                (GO:0009693) was also enriched under drought stress, with a
                                GeneRatio of 20/919 and 112 background genes annotated to the
                                term. Its RichFactor was 0.1786, FoldEnrichment was 2.3416,
                                and zScore was 4.0985. The nominal p-value was 2.7955 × 10⁻⁴,
                                adjusted p-value was 0.03417, and q-value was 0.03184. Twelve
                                of the 20 contributing genes were upregulated (60.0%), while
                                eight were downregulated (40.0%). The median log2 fold change
                                was 2.2443 and the mean was 1.7586. Neither direction reached
                                the 70% classification threshold, so the term was classified
                                as mixed. The positive mean and median indicate a positive
                                central tendency, but the gene counts support a more cautious
                                interpretation of the overall response. Trehalose biosynthetic
                                process (GO:0005992) had a GeneRatio of 9/919, with 31
                                background genes annotated to the term. Its RichFactor was
                                0.2903, FoldEnrichment was 3.8070, and zScore was 4.4962.
                                The nominal p-value was 3.6446 × 10⁻⁴, adjusted p-value was
                                0.03417, and q-value was 0.03184. All nine contributing genes
                                were downregulated, with a median log2 fold change of −3.4269
                                and a mean of −3.2875. This represents a uniformly negative
                                expression direction among the genes contributing to the
                                enriched term. The result identifies trehalose-biosynthesis-
                                associated genes as an enriched group among drought-responsive
                                metabolic-enzyme genes, but does not establish a decrease in
                                trehalose abundance or metabolic flux. Amine catabolic
                                process (GO:0009310) had a GeneRatio of 5/919, with 10
                                background genes annotated to the term. Its RichFactor was
                                0.5000, FoldEnrichment was 6.5566, and zScore was 5.0506.
                                The nominal p-value was 4.6474 × 10⁻⁴, adjusted p-value was
                                0.03486, and q-value was 0.03248. One contributing gene was
                                upregulated (20.0%) and four were downregulated (80.0%).
                                The median log2 fold change was −1.5461 and the mean was
                                −0.8467. This process was therefore classified as predominantly
                                downregulated under the 70% rule. Drought stress
                                was associated with enriched processes showing different
                                transcriptional patterns. Photosystem I electron-transport-
                                associated genes and trehalose-biosynthesis-associated genes
                                were uniformly downregulated, while amine catabolism was
                                predominantly downregulated. Raffinose catabolism and ethylene
                                biosynthesis displayed mixed gene-level directions.
                            </p>

                            <p>
                                Under heat stress, protein folding (GO:0006457) was the only
                                significantly enriched biological process among the
                                heat-responsive metabolic-enzyme genes. The term had a
                                GeneRatio of 46/1,599, while 188 background genes were annotated
                                to protein folding. The RichFactor was 0.2447,
                                FoldEnrichment was 1.8441, and zScore was 4.5622. The nominal
                                p-value was 2.0968 × 10⁻⁵, with an adjusted p-value of 0.01002
                                and q-value of 0.00945. Forty-one of the 46 contributing genes
                                were upregulated (89.1%), while five were downregulated (10.9%).
                                The median log2 fold change was 3.1988 and the mean was 3.4639.
                                The term was therefore classified as predominantly upregulated.
                                This indicates that protein-folding-associated genes were
                                overrepresented among the heat-responsive metabolic-enzyme
                                genes, with most showing increased transcript abundance.
                                The pattern is compatible with a heat-associated transcriptional
                                response involving protein folding and proteostasis-related
                                functions. However, protein folding is reported here as a
                                Gene Ontology biological process rather than a canonical
                                metabolic pathway.
                            </p>

                            <p>
                                Under salinity stress, four biological processes were
                                significantly enriched, with most contributing genes showing
                                predominantly positive or negative expression directions.
                                Lignin biosynthetic process (GO:0009809) had a GeneRatio of
                                16/840, with 63 background genes annotated to the process.
                                Its RichFactor was 0.2540, FoldEnrichment was 3.6435, and
                                zScore was 5.7583. The nominal p-value was 4.4102 × 10⁻⁶,
                                with an adjusted p-value of 0.001596 and q-value of 0.001504.
                                Fifteen of the 16 contributing genes were upregulated (93.75%),
                                while one was downregulated (6.25%). The median log2 fold
                                change was 2.9084 and the mean was 2.7139. This represents
                                a predominantly upregulated expression pattern among the
                                genes contributing to the enriched lignin-biosynthesis term.
                                The finding indicates overrepresentation and predominantly
                                increased expression of lignin-biosynthesis-associated genes
                                under salinity stress. It is consistent with a transcriptional
                                response involving cell-wall-related biosynthetic functions,
                                but does not establish increased lignin content or cell-wall
                                deposition. Jasmonic acid biosynthetic process (GO:0009695)
                                had a GeneRatio of 25/840, compared with 140 background genes
                                annotated to the term. The RichFactor was 0.1786,
                                FoldEnrichment was 2.5619, and zScore was 5.0880. The nominal
                                p-value was 1.1273 × 10⁻⁵, adjusted p-value was 0.002041,
                                and q-value was 0.001923. Twenty of the 25 contributing genes
                                were upregulated (80.0%), while five were downregulated
                                (20.0%). The median log2 fold change was 2.7149 and the mean
                                was 2.2883. The term was classified as predominantly
                                upregulated. This enrichment indicates that jasmonic-acid-
                                biosynthesis-associated genes were overrepresented among
                                salinity-responsive metabolic-enzyme genes, with most showing
                                increased transcript abundance. It is consistent with a
                                transcriptional response involving jasmonate-associated
                                biosynthetic processes, but does not demonstrate increased
                                jasmonic acid concentration or establish that jasmonate
                                signalling caused the observed stress response. Trehalose
                                biosynthetic process (GO:0005992) had a GeneRatio of 9/840,
                                with 31 background genes annotated to the term. Its RichFactor
                                was 0.2903, FoldEnrichment was 4.1651, and zScore was 4.8298.
                                The nominal p-value was 1.8537 × 10⁻⁴, with an adjusted
                                p-value of 0.02237 and q-value of 0.02107. One of the nine
                                contributing genes was upregulated (11.1%), while eight were
                                downregulated (88.9%). The median log2 fold change was
                                −2.3138 and the mean was −1.8596. The term was therefore
                                predominantly downregulated. This finding is notable because
                                trehalose biosynthetic process was also significantly enriched
                                under drought stress, where all nine contributing genes were
                                downregulated. The repeated enrichment and predominantly
                                negative expression direction across these two conditions
                                suggest a shared transcriptional pattern among trehalose-
                                biosynthesis-associated genes under drought and salinity.
                                This should not be interpreted as direct evidence of reduced
                                trehalose content or metabolic flux. Ethylene biosynthetic
                                process (GO:0009693) had a GeneRatio of 19/840, with 112
                                background genes annotated to the term. The RichFactor was
                                0.1696, FoldEnrichment was 2.4338, and zScore was 4.1727.
                                The nominal p-value was 2.4929 × 10⁻⁴, adjusted p-value was
                                0.02256, and q-value was 0.02125. Eighteen of the 19
                                contributing genes were upregulated (94.7%), while one was
                                downregulated (5.3%). The median log2 fold change was 2.9599
                                and the mean was 3.4608. The term was classified as
                                predominantly upregulated. Together with the cold-stress
                                result, this supports repeated enrichment of ethylene-
                                biosynthesis-associated genes with predominantly positive
                                expression directions under cold and salinity conditions.
                                Under drought, the same GO term was enriched but showed a
                                mixed gene-level direction. Therefore, the shared GO
                                annotation does not imply an identical transcriptional
                                response across all stress conditions.
                            </p>

                            {/* METABOLIC GO ENRICHMENT FIGURE */}

                            <figure className="rl-enrichment-figure">


                                <div className="rl-enrichment-figure-image">
                                    <img
                                        src={img01}
                                        alt="Bubble plot showing enriched metabolic biological processes under cold, drought, heat, and salinity stress in maize. Bubble position represents the negative logarithm of the adjusted p-value, bubble size represents DEG count, and bubble colour represents adjusted p-value."
                                        loading="lazy"
                                    />
                                </div>

                                <figcaption className="rl-enrichment-figure-caption">
                                    <strong>Figure 1.</strong> Significant metabolic Gene Ontology
                                    biological-process enrichment across cold, drought, heat, and
                                    salinity stress conditions. The horizontal axis represents
                                    −log₁₀(adjusted p-value), bubble size represents the number of
                                    differentially expressed genes associated with each enriched
                                    process, and bubble colour indicates the adjusted p-value.
                                    Only processes meeting the adjusted p-value threshold of 0.05
                                    are displayed.
                                </figcaption>

                            </figure>

                            <figure className="rl-enrichment-figure">



                                <div className="rl-enrichment-figure-image">
                                    <img
                                        src={img02}
                                        alt="Bubble plot showing enriched metabolic biological processes under cold, drought, heat, and salinity stress in maize. Bubble position represents the negative logarithm of the adjusted p-value, bubble size represents DEG count, and bubble colour represents adjusted p-value."
                                        loading="lazy"
                                    />
                                </div>

                                <figcaption className="rl-enrichment-figure-caption">
                                    <strong>Figure 2.</strong> The heatmap compares the directional classification of genes associated with ethylene biosynthetic process (GO:0009693) and trehalose biosynthetic process (GO:0005992) under cold, drought, heat, and salinity stress. Upregulated and downregulated genes were
                                    classified using the sign of their log2 fold change. Direction labels
                                    were assigned descriptively using a 70% majority threshold. These
                                    categories represent transcript-level patterns and do not directly
                                    measure pathway activity or metabolite abundance.
                                </figcaption>

                            </figure>

                            <figure className="rl-enrichment-figure">



                                <div className="rl-enrichment-figure-image">
                                    <img
                                        src={img03}
                                        alt="Bubble plot showing enriched metabolic biological processes under cold, drought, heat, and salinity stress in maize. Bubble position represents the negative logarithm of the adjusted p-value, bubble size represents DEG count, and bubble colour represents adjusted p-value."
                                        loading="lazy"
                                    />
                                </div>

                                <figcaption className="rl-enrichment-figure-caption">
                                    <strong>Figure 3.</strong> The matrix indicates the stress
                                    conditions in which each GO BP term reached the adjusted p-value
                                    threshold.
                                </figcaption>

                            </figure>

                            <h4>Practice 2</h4>

                            <p>
                                The rebuild audit reported 25,968 genes tested in each DESeq2
                                contrast, using an adjusted p-value (padj) threshold of ≤ 0.05
                                and an absolute log2 fold change of ≥ 1. The metabolic-enzyme
                                annotation comprised 18,585 genes. Applying these criteria
                                identified 598 metabolic-enzyme candidate genes under cold
                                stress, 919 under drought, 1,599 under heat, and 840 under
                                salinity. Of these candidates, 315 were upregulated and 283
                                downregulated under cold stress; 467 were upregulated and 452
                                downregulated under drought; 908 were upregulated and 691
                                downregulated under heat; and 569 were upregulated and 271
                                downregulated under salinity.
                            </p>


                            <figure className="rl-enrichment-figure">



                                <div className="rl-enrichment-figure-image">
                                    <img
                                        src={img04}
                                        alt="Bubble plot showing enriched metabolic biological processes under cold, drought, heat, and salinity stress in maize. Bubble position represents the negative logarithm of the adjusted p-value, bubble size represents DEG count, and bubble colour represents adjusted p-value."
                                        loading="lazy"
                                    />
                                </div>

                                <figcaption className="rl-enrichment-figure-caption">
                                    <strong>Figure 4.</strong> Numbers and expression directions
                                    of differentially expressed metabolic-enzyme candidate genes
                                    identified under cold, drought, heat, and salinity stress.
                                    Candidate genes met the adjusted p-value threshold of 0.05
                                    and absolute log2 fold-change threshold of 1. Upregulated and
                                    downregulated counts are based on the sign of the estimated
                                    log2 fold change. The figure summarises candidate counts and
                                    does not represent measured enzyme activity or metabolic flux.
                                </figcaption>

                            </figure>



                            <section className="rl-enrichment-table-section">

                                <div className="rl-enrichment-table-heading">
                                    <span>TABLE 2</span>
                                    <h3>
                                        Relationship Between Metabolic-Enzyme Candidates and Enriched Biological Processes
                                    </h3>
                                </div>

                                <div className="rl-enrichment-table-scroll">

                                    <table className="rl-enrichment-table">

                                        <thead>
                                            <tr>
                                                <th>Stress Condition</th>
                                                <th>All Metabolic-Enzyme Candidates</th>
                                                <th>Overall Upregulated</th>
                                                <th>Overall Downregulated</th>
                                                <th>Enriched Biological Process</th>
                                                <th>GO Biological Process ID</th>
                                                <th>Candidate–GO Associations</th>
                                                <th>Upregulated Within Process</th>
                                                <th>Downregulated Within Process</th>
                                                <th>Expression Pattern</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {q1Q2ConnectionData.map((group) => (

                                                group.processes.map((process, index) => (

                                                    <tr key={`${group.stress}-${process.go}`}>

                                                        {index === 0 && (
                                                            <>
                                                                <td rowSpan={group.processes.length}>
                                                                    {group.stress}
                                                                </td>

                                                                <td rowSpan={group.processes.length}>
                                                                    {group.totalCandidates.toLocaleString()}
                                                                </td>

                                                                <td rowSpan={group.processes.length}>
                                                                    {group.totalUp.toLocaleString()}
                                                                </td>

                                                                <td rowSpan={group.processes.length}>
                                                                    {group.totalDown.toLocaleString()}
                                                                </td>
                                                            </>
                                                        )}

                                                        <td>{process.process}</td>

                                                        <td>
                                                            <strong>{process.go}</strong>
                                                        </td>

                                                        <td>
                                                            {process.associatedGenes}
                                                        </td>

                                                        <td>
                                                            {process.up}
                                                        </td>

                                                        <td>
                                                            {process.down}
                                                        </td>

                                                        <td>
                                                            {process.direction}
                                                        </td>

                                                    </tr>

                                                ))

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                                <p className="rl-enrichment-table-footnote">

                                    The overall metabolic-enzyme candidate counts represent all
                                    differentially expressed enzyme-associated genes identified
                                    under each stress condition using padj ≤ 0.05 and |log₂FC| ≥ 1.
                                    Candidate–GO associations represent the subset of these genes
                                    associated with the significantly enriched GO biological
                                    processes identified. The upregulated and
                                    downregulated counts in the process columns refer only to genes
                                    associated with the corresponding enriched process, not to the
                                    entire metabolic-enzyme candidate set. A gene may contribute to
                                    more than one GO association. Expression patterns were classified
                                    using the 70% directional threshold. These results describe
                                    transcript-level associations and do not establish pathway
                                    activity, enzyme activity, or metabolic flux.

                                </p>

                            </section>

                            <p>
                                To connect the candidate-level results with the enrichment analysis,
                                the metabolic-enzyme candidates were cross-referenced against the significantly
                                enriched GO biological processes identified previously. This produced 184
                                non-empty candidate–GO association records across the four stress conditions:
                                20 under cold, 49 under drought, 46 under heat, and 69 under salinity.
                                These values represent candidate–GO associations rather than unique genes,
                                since an individual gene may be associated with more than one biological
                                process or occur in multiple stress comparisons.
                                Further comparison was performed to examine whether the biological
                                processes enriched across multiple stress conditions were supported by
                                shared differentially expressed genes. For ethylene biosynthesis (GO:0009693),
                                35 unique genes were identified across cold, drought and salinity stress, of
                                which 18 were differentially expressed in at least two conditions. These shared genes were Zm00001d002535, Zm00001d002576, Zm00001d002592, Zm00001d003504, Zm00001d003533, Zm00001d005936, Zm00001d009568, Zm00001d017457, Zm00001d017645, Zm00001d018122, Zm00001d021978, Zm00001d024843, Zm00001d024853, Zm00001d025524, Zm00001d026060, Zm00001d034418, Zm00001d036348 and Zm00001d052189. 
                                Among these shared genes, 17 exhibited consistent expression directions
                                across the conditions in which they were identified, while Zm00001d024843 showed
                                a contrasting response, being downregulated under drought but upregulated
                                under salinity. Trehalose biosynthesis (GO:0005992), which was enriched
                                under drought and salinity stress, contained 10 unique associated genes,
                                8 of which were shared between the two conditions. These were Zm00001d005658, Zm00001d005687, Zm00001d012748, Zm00001d018342, Zm00001d020272, Zm00001d020396, Zm00001d032311 and Zm00001d052060. All eight shared genes
                                were consistently downregulated under both stresses.

                            </p>

                           

                            <p>
                                Across the four stress comparisons, the analysis produced 3,956
                                candidate–stress records representing 2,799 unique
                                metabolic-enzyme candidate genes. 50 genes were detected as
                                candidates in all four stress conditions; 185 were detected in
                                three conditions, 637 in two conditions, and 1,927 in one condition.
                                The candidate genes were ranked using adjusted p-values and absolute
                                log2 fold changes to prioritise those showing stronger statistical
                                evidence and larger expression changes. <strong>Table 3</strong> presents the five
                                highest-ranked candidates for each stress condition, together with
                                their gene identifiers, expression estimates, and associated GO
                                molecular-function annotations. The selected candidates included
                                both upregulated and downregulated genes, with some showing relatively
                                large expression changes. Zm00001d042107 was among the
                                highest-ranked candidates under both cold and salinity stress, with
                                log2 fold changes of +4.7664 and +3.0661, respectively.
                                Zm00001d016719 appeared among the highly ranked candidates under
                                both conditions, with corresponding log2 fold changes of +7.0867
                                and +6.0878. Zm00001d037232 also appeared among the highly ranked
                                drought and heat candidates, with log2 fold changes of +9.2015 and
                                +10.5641, respectively. These recurring candidates may therefore
                                warrant closer examination in subsequent analyses.
                            </p>




                            <section className="rl-enrichment-table-section">

                                <div className="rl-enrichment-table-heading">
                                    <span>TABLE 3</span>
                                    <h3>
                                        Top-Ranked Metabolic-Enzyme Candidate Genes Across Stress Conditions
                                    </h3>
                                </div>

                                <div className="rl-enrichment-table-scroll">

                                    <table className="rl-enrichment-table">

                                        <thead>
                                            <tr>
                                                <th>Stress Condition</th>
                                                <th>Rank</th>
                                                <th>Gene Identifier</th>
                                                <th>log₂ Fold Change</th>
                                                <th>Expression Direction</th>
                                                <th>Associated GO Molecular-Function IDs</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {rankedCandidateData.map((group) => (

                                                group.candidates.map((candidate, index) => {

                                                    const isUpregulated = candidate.log2FC.startsWith("+");

                                                    return (
                                                        <tr key={`${group.stress}-${candidate.gene}`}>

                                                            {index === 0 && (
                                                                <td rowSpan={group.candidates.length}>
                                                                    <strong>{group.stress}</strong>
                                                                </td>
                                                            )}

                                                            <td>{index + 1}</td>

                                                            <td>
                                                                <strong className="rl-candidate-gene">
                                                                    {candidate.gene}
                                                                </strong>
                                                            </td>

                                                            <td className="rl-candidate-fold-change">
                                                                {candidate.log2FC}
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className={`rl-expression-direction ${isUpregulated
                                                                        ? "rl-direction-up"
                                                                        : "rl-direction-down"
                                                                        }`}
                                                                >
                                                                    {isUpregulated
                                                                        ? "Upregulated"
                                                                        : "Downregulated"}
                                                                </span>
                                                            </td>

                                                            <td className="rl-candidate-go">
                                                                {candidate.go.split("; ").map((goId) => (
                                                                    <span key={goId} className="rl-go-id">
                                                                        {goId}
                                                                    </span>
                                                                ))}
                                                            </td>

                                                        </tr>
                                                    );
                                                })

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                                <p className="rl-enrichment-table-footnote">
                                    Candidates are presented in their supplied ranking order for each
                                    stress condition. Ranking was based on adjusted p-value and absolute
                                    log₂ fold change. GO identifiers represent enzyme-associated
                                    molecular-function annotations and are not the enriched GO
                                    biological-process terms discussed previously. Positive log₂ fold
                                    changes indicate upregulation, while negative values indicate
                                    downregulation relative to the control.
                                </p>

                            </section>

                            <p>
                                Comparison of the 20 highly ranked metabolic-enzyme candidates in <strong>Table 3</strong> with the enriched biological processes showed
                                that five candidates were associated with at least one of the identified
                                processes. These comprised one candidate under drought stress, associated
                                with raffinose catabolism, and four candidates under heat stress, all
                                associated with protein folding. No overlap was observed among the
                                top-five candidates under cold or salinity stress. The predominance
                                of heat-associated candidates within the overlap reflects their
                                association with the protein-folding process, which was significantly
                                enriched under heat stress. However, the absence of an association
                                for the remaining 15 candidates does not diminish their significance
                                as differentially expressed metabolic-enzyme-associated genes.
                            </p>

 <section className="rl-enrichment-table-section">

                                <div className="rl-enrichment-table-heading">
                                    <span>TABLE 4</span>
                                    <h3>
                                        Overlap between the top-five metabolic-enzyme candidates and the biological processes enriched.
                                    </h3>
                                </div>

                                <div className="rl-enrichment-table-scroll">
                                    <table className="rl-enrichment-table">

                                        <thead>
                                            <tr>
                                                <th>Stress</th>
                                                <th>Number of Candidates associated</th>
                                                <th>Candidate gene</th>
                                                <th>Rank</th>
                                                <th>Associated biological process</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            <tr>
                                                <td>Cold</td>
                                                <td>0/5</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                            </tr>

                                            <tr>
                                                <td>Drought</td>
                                                <td>1/5</td>
                                                <td>Zm00001d031300</td>
                                                <td>5</td>
                                                <td>Raffinose catabolic process</td>
                                            </tr>

                                            <tr>
                                                <td>Heat</td>
                                                <td>4/5</td>
                                                <td>Zm00001d028408, Zm00001d014486, Zm00001d047302, Zm00001d037232</td>
                                                <td>1, 3, 4, 5 respectively</td>
                                                <td>Protein folding</td>
                                            </tr>

                                            <tr>
                                                <td>Salinity</td>
                                                <td>0/5</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                            </tr>

                                        </tbody>

                                    </table>
                                </div>

                                <p className="rl-enrichment-table-footnote">
                                    The comparison examined the five highest-ranked candidates
                                    under each stress condition. A dash indicates that none of
                                    the five candidates was associated with a significantly
                                    enriched biological process. Candidate ranks are specific
                                    to their respective stress conditions.
                                </p>

                            </section>


                            <p>
                                The TF analysis identified 1,672 mapped TF genes per stress
                                comparison. Of these, 143 were significantly differentially
                                expressed under cold (106 upregulated and 37 downregulated),
                                182 under drought (95 upregulated and 87 downregulated), 224
                                under heat (135 upregulated and 89 downregulated), and 164
                                under salinity (100 upregulated and 64 downregulated),
                                giving 713 significant TF–stress records.
                            </p>

                            <figure className="rl-enrichment-figure">


                                <div className="rl-enrichment-figure-image">
                                    <img
                                        src={img05}
                                        alt="Bubble plot showing enriched metabolic biological processes under cold, drought, heat, and salinity stress in maize. Bubble position represents the negative logarithm of the adjusted p-value, bubble size represents DEG count, and bubble colour represents adjusted p-value."
                                        loading="lazy"
                                    />
                                </div>

                                <figcaption className="rl-enrichment-figure-caption">
                                    <strong>Figure 5.</strong> Direction of differential
                                    expression among significant transcription-factor genes under
                                    cold, drought, heat, and salinity stress. TF genes were
                                    classified as significant using adjusted p-value ≤ 0.05
                                    and absolute log2 fold change ≥ 1. Direction was determined
                                    by the sign of log2 fold change. The displayed counts refer
                                    to significant TF genes in each stress-versus-control
                                    comparison.
                                </figcaption>

                            </figure>

                            <p>
                                The aggregated summary identified 48 transcription factor (TF)
                                families, with ERF having the highest reported count of 54 unique
                                TF genes, followed by MYB (35), MYB_related and WRKY (31 each),
                                bHLH (29), bZIP (26), NAC (24), HD-ZIP (22), GRAS (19), C2H2 (18),
                                ARF (16), and HSF (14). The remaining families included G2-like,
                                C3H, Dof, GATA, CO-like, AP2, DBB, TCP, TALE, SBP, LBD, B3, NF-YA,
                                ARR-B, FAR1, RAV, Trihelix, GRF, LSD, ZF-HD, M-type_MADS, NF-X1,
                                MIKC_MADS, GeBP, E2F/DP, NF-YB, EIL, CAMTA, CPP, STAT, S1Fa-like,
                                NF-YC, and VOZ. When the significant TFs were examined separately
                                by stress condition, ERF was consistently among the most
                                represented families, with 28 records under cold, 25 under
                                drought, 24 under heat, and 23 under salinity. Other repeatedly
                                represented families included MYB, bHLH, and bZIP, although
                                their counts varied across the stress comparisons. Some families
                                showed greater representation under particular conditions; such
                                as HSF which had 13 significant TF records under heat, while
                                WRKY had 16 under cold and 14 under salinity. These patterns
                                highlight TF families that may warrant further investigation
                                in relation to the observed stress responses.
                            </p>

                            <figure className="rl-enrichment-figure">


                                <div className="rl-enrichment-figure-image">
                                    <img
                                        src={img06}
                                        alt="Bubble plot showing enriched metabolic biological processes under cold, drought, heat, and salinity stress in maize. Bubble position represents the negative logarithm of the adjusted p-value, bubble size represents DEG count, and bubble colour represents adjusted p-value."
                                        loading="lazy"
                                    />
                                </div>

                                <figcaption className="rl-enrichment-figure-caption">
                                    <strong>Figure 6.</strong> Distribution of transcription-factor
                                    families across the four abiotic stress conditions. The heatmap
                                    summarises TF-family representation in the analysed stress
                                    comparisons. Family assignment is based on the PlantTFDB-derived
                                    mapping used in the analysis. Family representation indicates
                                    annotation and differential-expression patterns, not confirmed
                                    regulatory activity.
                                </figcaption>

                            </figure>

                            <p>
                                The TF cross-stress expression matrix was used to compare the
                                direction and magnitude of log₂ fold-change estimates for mapped
                                TF genes across cold, drought, heat, and salinity conditions.
                                However, these estimates alone do not establish statistical
                                significance; a TF was considered significantly responsive in
                                a particular stress condition only when its adjusted p-value
                                and fold-change met the applied significance criteria.
                                Zm00001d000112 showed positive log₂ fold changes under
                                both heat (+1.9459) and salinity (+2.1434), and was confirmed
                                as significantly differentially expressed in both conditions in
                                the TF significance table. In contrast, Zm00001d000045 had a
                                negative log₂ fold change under cold stress (−1.1118), but its
                                adjusted p-value was not significant, so it cannot be classified
                                as a significantly responsive TF under that condition.
                                Zm00001d000303 showed a large positive log₂ fold
                                change under salinity (+6.8254), but its statistical
                                significance must be confirmed from the corresponding TF
                                significance results before it can be described as significantly
                                differentially expressed.
                            </p>

                            <figure className="rl-enrichment-figure">


                                <div className="rl-enrichment-figure-image">
                                    <img
                                        src={img07}
                                        alt="Bubble plot showing enriched metabolic biological processes under cold, drought, heat, and salinity stress in maize. Bubble position represents the negative logarithm of the adjusted p-value, bubble size represents DEG count, and bubble colour represents adjusted p-value."
                                        loading="lazy"
                                    />
                                </div>

                                <figcaption className="rl-enrichment-figure-caption">
                                    <strong>Figure 7.</strong>  Cross-stress expression
                                    estimates of mapped transcription-factor genes under cold,
                                    drought, heat, and salinity conditions. The heatmap displays
                                    log2 fold-change estimates for TF genes across the four
                                    stress-versus-control comparisons. Expression direction and
                                    magnitude can be compared across conditions, but statistical
                                    significance must be interpreted using the corresponding
                                    adjusted p-values and the predefined fold-change threshold.
                                    Similar expression patterns indicate co-response and do not
                                    establish direct regulatory relationships.
                                </figcaption>

                            </figure>

                        </div>

                    </section>



                    {/* REFERENCE */}

                    <section
                        id="references"
                        className="rl-paper-section"
                    >

                        <div className="rl-section-title-area">

                            <h2>References</h2>

                        </div>


                        <div className="rl-content-placeholder">

                            <li>Li P, Cao W, Fang H, Xu S, Yin S, Zhang Y, Lin D, Wang J, Chen Y, Xu C and Yang Z (2017) "Transcriptomic Profiling of the Maize (Zea mays L.) Leaf Response to Abiotic Stresses at the Seedling Stage". Frontiers Plant Science. Volume 8, Issue 290. doi: 10.3389/fpls.2017.00290</li>

                        </div>

                    </section>


                </article>



                {/* =================================
                    RIGHT INFORMATION SIDEBAR
                ================================== */}

                <aside className="rl-article-aside">


                    {/* PROJECT INFORMATION */}

                    <div className="rl-aside-card">

                        <div className="rl-aside-card-heading">

                            <h3>Project Information</h3>

                        </div>


                        <div className="rl-aside-info">

                            <span>Project Format</span>

                            <strong>
                                Independent Practical Exercise
                            </strong>

                        </div>


                        <div className="rl-aside-info">

                            <span>Study Organism</span>

                            <strong>
                                <i>Zea mays</i>
                            </strong>

                        </div>


                        <div className="rl-aside-info">

                            <span>Data Type</span>

                            <strong>
                                RNA Sequencing
                            </strong>

                        </div>


                        <div className="rl-aside-info">

                            <span>Stress Conditions</span>

                            <strong>
                                Drought, Salinity, Heat and Cold
                            </strong>

                        </div>


                        <div className="rl-aside-info">

                            <span>Original Study</span>

                            <strong>
                                Li et al. (2017)
                            </strong>

                        </div>

                    </div>




                    {/* SOURCE INFORMATION */}

                    <div className="rl-aside-card">

                        <div className="rl-aside-card-heading">

                            <h3>Source Resources</h3>

                        </div>


                        <a
                            href="https://www.ncbi.nlm.nih.gov/sra/?term=SRP080208"
                            target="_blank"
                            rel="noreferrer"
                            className="rl-source-resource"
                        >

                            <span>NCBI SRA Dataset</span>

                            <strong>SRP080208 ↗</strong>

                        </a>


                        <a
                            href="https://doi.org/10.3389/fpls.2017.00290"
                            target="_blank"
                            rel="noreferrer"
                            className="rl-source-resource"
                        >

                            <span>Original Research</span>

                            <strong>Li et al. (2017) ↗</strong>

                        </a>

                    </div>



                    {/* DOWNLOAD AREA */}

                    <div className="rl-aside-card">

                        <div className="rl-aside-card-heading">

                            <h3>Project Downloads</h3>

                        </div>


                        {availableDownloads.length > 0 ? (

                            availableDownloads.map((file) => (

                                <a
                                    key={file.label}
                                    href={file.path}
                                    download={file.filename}
                                    className="rl-aside-download"
                                >

                                    <span>↓</span>

                                    {file.label}

                                </a>

                            ))

                        ) : (

                            <p className="rl-aside-empty">
                                Downloadable project files will be
                                made available here when added.
                            </p>

                        )}

                    </div>


                </aside>

            </div>


            {/* =====================================
                PROJECT FOOTER / DISCLAIMER
            ====================================== */}

            <footer className="rl-article-footer">

                <div className="rl-article-container">

                    <div className="rl-article-footer-heading">

                        <span className="rl-disclaimer-icon">i</span>

                        <h4>Project Disclaimer</h4>

                    </div>


                    <p>
                        This page presents an independently conducted
                        computational practical exercise based on
                        publicly available RNA-seq data. It documents
                        the analytical workflow, bioinformatics tools,
                        results, and interpretations developed for
                        learning and practical application. The analysis
                        is a secondary computational examination of
                        an existing dataset and is not an independent
                        experimental study or a peer-reviewed
                        publication. Interpretations and computational
                        predictions should not be regarded as
                        experimentally validated conclusions.
                    </p>


                    <div className="rl-article-footer-bottom">

                        <Link to="/">
                            ← Back to Practical Library
                        </Link>

                        <span>
                            INDEPENDENT PRACTICAL COLLECTION
                        </span>

                    </div>

                </div>

            </footer>

        </main>
    );
};

export default ExerciseOne;
