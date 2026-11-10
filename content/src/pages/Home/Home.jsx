import React from "react";
import { Link } from "react-router-dom";
import "../Styles.css";

const Home = () => {
    return (
        <main className="research-library">

            {/* Hero Section */}
            <section className="rl-hero">
                <div className="rl-container">

                    <div className="rl-eyebrow">
                        <span className="rl-eyebrow-line"></span>
                        BOLUWATIFE IKUEROWO 
                    </div>

                    <h1>
                        Practical <span>Library</span>
                    </h1>

                    <p className="rl-intro">
                        A collection of self-directed practical exercises in
                        molecular biology, genomics, transcriptomics, and
                        bioinformatics, developed through the analysis of
                        published literature and publicly available biological datasets.
                    </p>


                </div>
            </section>

            {/* Practical Exercises */}
            <section className="rl-content">
                <div className="rl-container">

                    <div className="rl-section-heading">
                        <div>
                            <span className="rl-section-label">PRACTICAL COLLECTION</span>
                            <h2>Practical Exercises</h2>
                            <p>
                                Explore the computational exercises, their
                                methodology, analytical results, and interpretations.
                            </p>
                        </div>

                        <span className="rl-collection-count">
                            EXERCISE COUNT (1)
                        </span>
                    </div>

                    <article className="rl-exercise-card">

                        <div className="rl-card-top">
                            <span className="rl-paper-type">
                                PRACTICAL EXERCISE 01
                            </span>

                            <span className="rl-paper-category">
                                PLANT TRANSCRIPTOMICS
                            </span>
                        </div>

                        <div className="rl-card-body">

                            <div className="rl-paper-meta">
                                <span>MOLECULAR BIOLOGY</span>
                                <span className="rl-meta-dot"></span>
                                <span>BIOINFORMATICS</span>
                                <span className="rl-meta-dot"></span>
                                <span>RNA-SEQ ANALYSIS</span>
                            </div>

                            <h3>
                                Comparative Transcriptomic Analysis of Metabolic
                                Gene Expression and Potential Regulatory Responses
                                in Seedling-Stage Maize (<i>Zea mays</i>) under
                                Drought, Salinity, Heat, and Cold Stress
                            </h3>

                            <p className="rl-card-description">
                                A comparative analysis of publicly available maize
                                RNA-sequencing data to investigate metabolic
                                biological-process responses across four
                                environmental stress conditions. The exercise
                                examines shared and stress-specific expression
                                patterns, prioritises metabolic enzyme-associated
                                candidate genes, and identifies transcription
                                factors as potential regulatory candidates.
                            </p>

                            <div className="rl-card-tags">
                                <span>Differential Expression</span>
                                <span>GO Enrichment</span>
                                <span>Metabolic Processes</span>
                                <span>Candidate Genes</span>
                                <span>Transcription Factors</span>
                            </div>

                        </div>

                        <div className="rl-card-footer">

                            <div className="rl-source-info">
                                <span className="rl-detail-label">DATA SOURCE</span>
                                <strong>NCBI SRA · SRP080208</strong>
                            </div>

                            <div className="rl-source-info">
                                <span className="rl-detail-label">REFERENCE STUDY</span>
                                <strong>Li et al. (2017)</strong>
                            </div>

                            <Link to="/exercise-one" className="rl-open-link">
                                Explore Exercise
                                <span>→</span>
                            </Link>

                        </div>

                    </article>

                </div>
            </section>

            {/* Disclaimer */}
            <footer className="rl-disclaimer">
                <div className="rl-container">

                    <div className="rl-disclaimer-heading">
                        <span className="rl-disclaimer-icon">i</span>
                        <h4>Practical Disclaimer</h4>
                    </div>

                    <p>
                        This practical library presents self-directed educational
                        and computational practical exercises. The work is
                        independently developed for learning, practical application,
                        and scientific exploration using published literature and
                        publicly available datasets. It is not an established
                        institutional practical publication, has not been published
                        in an academic journal, and has not undergone formal
                        peer review. Findings and interpretations should therefore
                        be regarded as exploratory and not as experimentally
                        validated conclusions.
                    </p>

                    <div className="rl-footer-bottom">
                        <span>INDEPENDENT PRACTICAL LIBRARY</span>
                        <span>MOLECULAR BIOLOGY · GENOMICS · BIOINFORMATICS</span>
                    </div>

                </div>
            </footer>

        </main>
    );
};

export default Home;