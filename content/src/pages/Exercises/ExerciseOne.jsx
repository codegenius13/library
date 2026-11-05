import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Styles.css";

/* =========================================
   RESEARCH PAGE CONFIGURATION
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

// Article navigation
const articleSections = [
    { id: "abstract", label: "Abstract" },
    { id: "keywords", label: "Keywords" },
    { id: "introduction", label: "1. Introduction" },
    { id: "materials-methods", label: "2. Materials and Methods" },
    { id: "results", label: "3. Results" },
    { id: "figures-tables", label: "Figures and Tables" },
    { id: "discussion", label: "4. Discussion" },
    { id: "conclusion", label: "5. Conclusions" },
    { id: "data-availability", label: "Data Availability" },
    { id: "code-availability", label: "Code Availability" },
    { id: "supplementary-materials", label: "Supplementary Materials" },
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

const ResearchAssetCard = ({ asset, onView, renderContent }) => {
    return (
        <article className="rl-asset-card">

            <div className="rl-asset-card-heading">
                <span className="rl-asset-number">
                    {asset.type} {asset.number}
                </span>

                <span className="rl-asset-type">
                    {asset.type}
                </span>
            </div>

            <div className="rl-asset-card-preview">
                {renderContent(asset)}
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
                        <Link to="/">Research Library</Link>

                        <span>/</span>

                        <span>Exercise 01</span>
                    </div>


                    <div className="rl-article-status">
                        <span className="rl-status-dot"></span>

                        INDEPENDENT RESEARCH EXERCISE

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
                            <span>RESEARCH AREA</span>
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
                            <strong>RNA-seq and Bioinformatics</strong>
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
                        <span>ARTICLE CONTENTS</span>
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
                            Navigate through the research sections using
                            the contents menu.
                        </p>

                    </div>

                </aside>



                {/* =================================
                    MAIN MANUSCRIPT CONTENT
                ================================== */}

                <article className="rl-manuscript">


                    {/* ABSTRACT */}

                    <section
                        id="abstract"
                        className="rl-paper-section rl-abstract-section"
                    >

                        <div className="rl-section-title-area">

                            <span className="rl-section-number">
                                OVERVIEW
                            </span>

                            <h2>Abstract</h2>

                        </div>


                        <div className="rl-content-placeholder">
                            {/* content comes here */}
                        </div>

                    </section>



                    {/* KEYWORDS */}

                    <section
                        id="keywords"
                        className="rl-paper-section rl-keywords-section"
                    >

                        <h3>Keywords</h3>

                        <div className="rl-content-placeholder">
                            {/* content comes here */}
                        </div>

                    </section>



                    {/* INTRODUCTION */}

                    <section
                        id="introduction"
                        className="rl-paper-section"
                    >

                        <div className="rl-section-title-area">


                            <h2>Introduction</h2>

                        </div>


                        <div className="rl-content-placeholder">
                            {/* content comes here */}
                        </div>

                    </section>



                    {/* MATERIALS AND METHODS */}

                    <section
                        id="materials-methods"
                        className="rl-paper-section"
                    >

                        <div className="rl-section-title-area">


                            <h2>Materials and Methods</h2>

                        </div>


                        <div className="rl-subsection">

                            <h3>2.1. Study Dataset and Experimental Design</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>2.2. Read Quality Assessment and Processing</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>2.3. Reference Genome and Gene Quantification</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>2.4. Differential Expression Analysis</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>2.5. GO Biological-Process Enrichment Analysis</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>2.6. Directional Response and Cross-Stress Analysis</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>2.7. Metabolic Enzyme-Associated Candidate Identification</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>2.8. Transcription-Factor Identification and Analysis</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>2.9. Candidate Prioritisation and Functional Interpretation</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>2.10. Statistical Criteria and Reproducibility</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>

                    </section>



                    {/* RESULTS */}

                    <section
                        id="results"
                        className="rl-paper-section"
                    >

                        <div className="rl-section-title-area">


                            <h2>Results</h2>

                        </div>


                        <div className="rl-subsection">

                            <h3>3.1. Read Quality and Sample-Level Assessment</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>3.2. Differential Expression Across Stress Conditions</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>3.3. Enriched Metabolic Biological Processes</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>3.4. Shared, Stress-Specific, and Contrasting Responses</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>3.5. Metabolic Enzyme-Associated Candidate Genes</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>3.6. Cross-Stress Distribution of Candidate Genes</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>3.7. Transcription-Factor Responses</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>


                        <div className="rl-subsection">

                            <h3>3.8. Integrated Metabolic Candidate and TF Summary</h3>

                            <div className="rl-content-placeholder">
                                {/* content comes here */}
                            </div>

                        </div>

                    </section>



                    {/* FIGURES AND TABLES */}

                    <section
                        id="figures-tables"
                        className="rl-paper-section rl-assets-section"
                    >

                        <div className="rl-section-title-area">

                            <span className="rl-section-number">
                                DATA PRESENTATION
                            </span>

                            <h2>Figures and Tables</h2>

                        </div>


                        <p className="rl-section-description">
                            Visual summaries and supporting tables associated
                            with the research results.
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
                                            renderContent={renderAssetContent}
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
                                            renderContent={renderAssetContent}
                                        />
                                    );

                                })}

                            </div>

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
                            {/* content comes here */}
                        </div>

                    </section>



                    {/* CONCLUSION */}

                    <section
                        id="conclusion"
                        className="rl-paper-section"
                    >

                        <div className="rl-section-title-area">

                            <h2>Conclusions</h2>

                        </div>


                        <div className="rl-content-placeholder">
                            {/* content comes here */}
                        </div>

                    </section>



                    {/* DATA AVAILABILITY */}

                    <section
                        id="data-availability"
                        className="rl-paper-section"
                    >

                        <div className="rl-section-title-area">

                            <h2>Data Availability</h2>

                        </div>


                        <div className="rl-content-placeholder">
                            {/* content comes here */}
                        </div>


                        <div className="rl-reference-link">

                            <span>Source dataset</span>

                            <a
                                href="https://www.ncbi.nlm.nih.gov/sra/?term=SRP080208"
                                target="_blank"
                                rel="noreferrer"
                            >
                                NCBI SRA — SRP080208 ↗
                            </a>

                        </div>

                    </section>



                    {/* CODE AVAILABILITY */}

                    <section
                        id="code-availability"
                        className="rl-paper-section"
                    >

                        <div className="rl-section-title-area">

                            <h2>Code Availability</h2>

                        </div>


                        <div className="rl-content-placeholder">
                            {/* content comes here */}
                        </div>

                    </section>



                    {/* SUPPLEMENTARY MATERIALS */}

                    <section
                        id="supplementary-materials"
                        className="rl-paper-section"
                    >

                        <div className="rl-section-title-area">

                            <h2>Supplementary Materials</h2>

                        </div>


                        <div className="rl-content-placeholder">
                            {/* content comes here */}
                        </div>


                        {availableDownloads.length > 0 && (

                            <div className="rl-supplementary-downloads">

                                {availableDownloads.map((file) => (

                                    <a
                                        key={file.label}
                                        href={file.path}
                                        download={file.filename}
                                        className="rl-supplementary-link"
                                    >

                                        <span className="rl-file-icon">
                                            ↓
                                        </span>

                                        <span>{file.label}</span>

                                        <span className="rl-file-arrow">
                                            ↗
                                        </span>

                                    </a>

                                ))}

                            </div>

                        )}

                    </section>



                    {/* REFERENCES */}

                    <section
                        id="references"
                        className="rl-paper-section rl-references-section"
                    >

                        <div className="rl-section-title-area">

                            <h2>References</h2>

                        </div>


                        <div className="rl-content-placeholder">
                            {/* references content comes here */}
                        </div>

                    </section>


                </article>



                {/* =================================
                    RIGHT INFORMATION SIDEBAR
                ================================== */}

                <aside className="rl-article-aside">


                    {/* ARTICLE INFORMATION */}

                    <div className="rl-aside-card">

                        <div className="rl-aside-card-heading">
                            <h3>Research Information</h3>
                        </div>


                        <div className="rl-aside-info">

                            <span>Research Format</span>

                            <strong>
                                Independent Research Exercise
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



                    {/* ARTICLE TOOLS */}

                    <div className="rl-aside-card">

                        <div className="rl-aside-card-heading">
                            <h3>Article Tools</h3>
                        </div>


                        <a
                            href="#abstract"
                            className="rl-aside-link"
                        >
                            <span>⌕</span>
                            Read Abstract
                        </a>


                        <a
                            href="#figures-tables"
                            className="rl-aside-link"
                        >
                            <span>▤</span>
                            View Figures and Tables
                        </a>


                        <a
                            href="#references"
                            className="rl-aside-link"
                        >
                            <span>≡</span>
                            View References
                        </a>


                        <a
                            href="#supplementary-materials"
                            className="rl-aside-link"
                        >
                            <span>↓</span>
                            Supplementary Materials
                        </a>

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
                            <h3>Research Downloads</h3>
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
                                Downloadable research files will be
                                made available here when added.
                            </p>

                        )}

                    </div>



                    {/* STATUS */}



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
                RESEARCH FOOTER / DISCLAIMER
            ====================================== */}

            <footer className="rl-article-footer">

                <div className="rl-article-container">

                    <div className="rl-article-footer-heading">

                        <span className="rl-disclaimer-icon">i</span>

                        <h4>Research Disclaimer</h4>

                    </div>


                    <p>
                        This page presents an independently conducted
                        computational research exercise based on published
                        literature and publicly available datasets. It is
                        intended for educational purposes, research practice,
                        and scientific exploration. It is not an established
                        institutional publication, has not been published in
                        an academic journal, and has not undergone formal
                        peer review. Interpretations and computational
                        predictions should not be regarded as experimentally
                        validated conclusions.
                    </p>


                    <div className="rl-article-footer-bottom">

                        <Link to="/">
                            ← Back to Research Library
                        </Link>

                        <span>
                            INDEPENDENT RESEARCH COLLECTION
                        </span>

                    </div>

                </div>

            </footer>

        </main>
    );
};

export default ExerciseOne;