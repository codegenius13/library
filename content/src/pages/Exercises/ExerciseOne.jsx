
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Styles.css";

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
    { id: "figures-tables", label: "Figures and Tables" },
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
                            href="#figures-tables"
                            className="rl-action-primary"
                        >
                            <span>▤</span>
                            Figures & Tables
                        </a>


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
                                Comparative and quantitative analyses were used to examine gene expression patterns, pathway responses, and similarities or differences across the stress conditions. Candidate genes were also examined based on their expression patterns and functional annotations to identify potentially relevant metabolic and regulatory associations.
                                The findings are interpreted within the limits of the available transcriptomic data. Identified genes and potential regulatory relationships are considered computational candidates rather than experimentally confirmed regulators or demonstrated causes of physiological stress responses.
                                The dataset and underlying experimental work originate from the published study by Li et al. (2017), while this exercise documents an independent computational examination of the available data using the analytical approaches described above. <a href="#references">[See References]</a>
                            </p>

                        </div>


                        <div className="rl-subsection">

                            <h3>Practice 1</h3>

                            <div className="rl-content-placeholder">

                                <p>
                                    How do drought, salinity, heat, and cold stress alter the expression of metabolic enzyme genes in maize, and which biological processes show shared, stress-specific, or contrasting transcriptional responses across these conditions?
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
                                <li>Differential expression results generated using DESeq2 were integrated with the RefGen4 metabolic enzyme gene annotations and the GO biological-process enrichment results. Using R and Python filtered genes based on the established significance criteria (adjusted p ≤ 0.05 and |log₂ fold change| ≥ 1), then ranked using statistical significance, magnitude and direction of expression change, and their membership in enriched metabolic processes. Cross-stress comparison and pathway-level direction summaries were used to identify genes associated with shared, stress-specific, predominantly upregulated, predominantly downregulated, or opposing responses.</li>
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

                            {/* Discussion content comes here */}

                        </div>

                    </section>



                    {/* FIGURES AND TABLES */}

                    <section
                        id="figures-tables"
                        className="rl-paper-section rl-assets-section"
                    >

                        <div className="rl-section-title-area">

                            <h2>Figures and Tables</h2>

                        </div>


                        <p className="rl-section-description">
                            Visual summaries and supporting tables
                            presenting the computational workflow,
                            analysis outputs, and key observations
                            from this exercise.
                        </p>



                        {/* FIGURES */}

                        <div className="rl-asset-group">

                            <div className="rl-asset-group-heading">

                                <h3>Figures</h3>

                                <span>
                                    {figureAssets.length} FIGURES
                                </span>

                            </div>


                            <div className="rl-assets-grid">

                                {figureAssets.map((asset) => {

                                    const preparedAsset = {
                                        ...asset,
                                        type: "Figure",
                                    };

                                    return (
                                        <ResearchAssetCard
                                            key={asset.id}
                                            asset={preparedAsset}
                                            onView={setActiveAsset}
                                        />
                                    );

                                })}

                            </div>

                        </div>



                        {/* TABLES */}

                        <div className="rl-asset-group">

                            <div className="rl-asset-group-heading">

                                <h3>Tables</h3>

                                <span>
                                    {tableAssets.length} TABLES
                                </span>

                            </div>


                            <div className="rl-assets-grid">

                                {tableAssets.map((asset) => {

                                    const preparedAsset = {
                                        ...asset,
                                        type: "Table",
                                    };

                                    return (
                                        <ResearchAssetCard
                                            key={asset.id}
                                            asset={preparedAsset}
                                            onView={setActiveAsset}
                                        />
                                    );

                                })}

                            </div>

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
                FIGURE / TABLE VIEW MODAL
            ====================================== */}

            {activeAsset && (

                <div
                    className="rl-asset-modal-overlay"
                    onClick={() => setActiveAsset(null)}
                >

                    <div
                        className="rl-asset-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${activeAsset.type} preview`}
                        onClick={(event) => event.stopPropagation()}
                    >

                        <div className="rl-asset-modal-header">

                            <div>

                                <span>
                                    {activeAsset.type.toUpperCase()} PREVIEW
                                </span>

                                <h3>{activeAsset.title}</h3>

                            </div>


                            <button
                                type="button"
                                className="rl-modal-close"
                                onClick={() => setActiveAsset(null)}
                                aria-label="Close preview"
                            >
                                ×
                            </button>

                        </div>


                        <div className="rl-asset-modal-body">

                            {renderAssetContent(activeAsset)}

                        </div>


                        <div className="rl-asset-modal-caption">

                            <span>CAPTION</span>

                            <p>{activeAsset.caption}</p>

                        </div>

                    </div>

                </div>

            )}



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
