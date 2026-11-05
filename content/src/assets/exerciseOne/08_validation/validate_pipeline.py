#!/usr/bin/env python3

from pathlib import Path
import csv
import re
import sys

HOME = Path.home()
PROJECT = HOME / "exerciseOne"
VALIDATION = PROJECT / "08_validation"
RAW = PROJECT / "01_raw_data"
TRIMMED = PROJECT / "03_trimmed_reads"
ALIGN = PROJECT / "04_alignment"
DE = PROJECT / "05_DE_analysis"
ANNOT = PROJECT / "06_pathway" / "annotation"
GENESETS = PROJECT / "06_pathway" / "gene_sets"
RESULTS = PROJECT / "07_results" / "01_answer"

SAMPLES = {
    "SRR3984815": "Cold",
    "SRR3984802": "Cold",
    "SRR3984795": "Heat",
    "SRR3984794": "Heat",
    "SRR3984791": "Drought",
    "SRR3984782": "Drought",
    "SRR3984771": "Salinity",
    "SRR3984762": "Salinity",
    "SRR3984749": "Control",
    "SRR3984708": "Control",
}

STRESSES = ["Cold", "Drought", "Heat", "Salinity"]

EXPECTED_METABOLIC_DEGS = {
    "Cold": 694,
    "Drought": 1009,
    "Heat": 1749,
    "Salinity": 889,
}

EXPECTED_ENRICHMENT = {
    "Cold": 2,
    "Drought": 16,
    "Heat": 24,
    "Salinity": 13,
}

checks = {"PASS": 0, "WARN": 0, "FAIL": 0}
report = []


def log(status, message):
    checks[status] += 1
    line = f"[{status}] {message}"
    report.append(line)
    print(line)


def find_files(directory):
    if not directory.exists():
        return []
    return [p for p in directory.rglob("*") if p.is_file()]


def find_named(directory, name):
    if not directory.exists():
        return None
    matches = list(directory.rglob(name))
    return matches[0] if matches else None


def read_tsv(path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f, delimiter="\t"))


def count_data_lines(path):
    with path.open("r", encoding="utf-8-sig", errors="replace") as f:
        return sum(
            1 for line in f
            if line.strip() and not line.startswith("#")
        )


def accession_files(directory, accession):
    if not directory.exists():
        return []
    return [
        p for p in directory.rglob("*")
        if p.is_file() and accession in p.name
    ]


def is_read1(path):
    n = path.name.lower()
    return bool(re.search(r"(_r?1|[._]1)([._]|\.fastq|\.fq)", n))


def is_read2(path):
    n = path.name.lower()
    return bool(re.search(r"(_r?2|[._]2)([._]|\.fastq|\.fq)", n))


def check_file(path, label):
    if path is None:
        log("FAIL", f"{label}: file not found")
        return False
    if path.stat().st_size == 0:
        log("FAIL", f"{label}: file is empty ({path})")
        return False
    log("PASS", f"{label}: exists, {path.stat().st_size:,} bytes")
    return True


def section(name):
    print(f"\n{'=' * 68}\n{name}\n{'=' * 68}")


# 1. Project structure and downloaded/raw reads
section("1. PROJECT AND RAW-DATA AUDIT")

for directory in [RAW, TRIMMED, ALIGN, DE, ANNOT, GENESETS, RESULTS]:
    if directory.is_dir():
        log("PASS", f"Directory exists: {directory}")
    else:
        log("FAIL", f"Expected directory missing: {directory}")

raw_file_cache = find_files(RAW)
trimmed_file_cache = find_files(TRIMMED)

for accession, condition in SAMPLES.items():
    raw_matches = accession_files(RAW, accession)
    trimmed_matches = accession_files(TRIMMED, accession)

    # Raw data can be stored as SRA files or paired raw FASTQs.
    raw_sra = [p for p in raw_matches if p.suffix.lower() == ".sra"]
    raw_fastq = [
        p for p in raw_matches
        if p.name.lower().endswith((".fastq", ".fastq.gz", ".fq", ".fq.gz"))
    ]

    if raw_sra or (any(is_read1(p) for p in raw_fastq)
                   and any(is_read2(p) for p in raw_fastq)):
        log("PASS", f"{accession} ({condition}): raw SRA/paired FASTQ found")
    elif raw_matches:
        log("WARN", f"{accession}: files found, but raw paired-read layout needs review")
    else:
        log("FAIL", f"{accession}: no file found under {RAW}")

    trim_r1 = [p for p in trimmed_matches if is_read1(p)]
    trim_r2 = [p for p in trimmed_matches if is_read2(p)]

    if trim_r1 and trim_r2:
        log("PASS", f"{accession}: trimmed read 1 and read 2 files found")
        for p in trim_r1 + trim_r2:
            if p.stat().st_size == 0:
                log("FAIL", f"Empty trimmed FASTQ: {p}")
    elif trimmed_matches:
        log("WARN", f"{accession}: trimmed files found, but paired naming/layout needs review")
    else:
        log("FAIL", f"{accession}: no trimmed reads found under {TRIMMED}")


# 2. Alignment files and optional HISAT2 logs
section("2. ALIGNMENT AUDIT")

bam_dir = ALIGN / "bam"
if not bam_dir.is_dir():
    bam_dir = ALIGN

for accession in SAMPLES:
    bam_candidates = [
        p for p in accession_files(bam_dir, accession)
        if p.name.endswith(".bam")
    ]
    bam = next((p for p in bam_candidates if "sorted" in p.name), None)
    if bam is None and bam_candidates:
        bam = bam_candidates[0]

    if bam is None:
        log("FAIL", f"{accession}: BAM not found under {bam_dir}")
        continue

    check_file(bam, f"{accession} BAM")

    bai_candidates = [
        Path(str(bam) + ".bai"),
        bam.with_suffix(".bai"),
    ]
    bai = next((p for p in bai_candidates if p.is_file()), None)
    check_file(bai, f"{accession} BAM index")

    logs = [
        p for p in accession_files(ALIGN, accession)
        if p.suffix.lower() in (".log", ".txt")
    ]
    rate_found = False
    for log_path in logs:
        try:
            content = log_path.read_text(errors="replace")
        except OSError:
            continue
        rates = re.findall(
            r"([\d.]+)%\s+overall alignment rate", content, re.IGNORECASE
        )
        if rates:
            rate = float(rates[-1])
            rate_found = True
            if 0 <= rate <= 100:
                log("PASS", f"{accession}: HISAT2 overall alignment rate {rate:.2f}%")
            else:
                log("FAIL", f"{accession}: impossible alignment rate {rate}")
            break
    if not rate_found:
        log("WARN", f"{accession}: no readable HISAT2 overall-rate log found")


# 3. featureCounts matrix and sample identity
section("3. FEATURECOUNTS AUDIT")

count_file = find_named(ALIGN, "maize_gene_counts.txt")
count_ok = check_file(count_file, "featureCounts matrix")

if count_ok:
    with count_file.open("r", encoding="utf-8-sig", errors="replace") as f:
        lines = [line.rstrip("\n") for line in f if line.strip()]

    header_line = next((line for line in lines if not line.startswith("#")), None)
    if header_line:
        header = header_line.split("\t")
        detected = [
            accession for accession in SAMPLES
            if any(accession in col for col in header)
        ]
        data_rows = sum(
            1 for line in lines
            if not line.startswith("#")
        ) - 1

        if len(detected) == 10:
            log("PASS", "Count matrix contains all 10 expected sample columns")
        else:
            log("FAIL", f"Count matrix has {len(detected)}/10 expected sample columns: {detected}")

        if data_rows > 0:
            log("PASS", f"Count matrix has {data_rows:,} data rows (including any annotation rows)")
        else:
            log("FAIL", "Count matrix has no gene data rows")
    else:
        log("FAIL", "Could not find featureCounts header")


# 4. DESeq2 outputs and DEG summary
section("4. DIFFERENTIAL-EXPRESSION AUDIT")

rds = find_named(DE, "maize_DESeq2.rds")
check_file(rds, "DESeq2 model RDS")

deg_summary = find_named(DE, "DEG_summary.tsv")
if check_file(deg_summary, "DEG summary"):
    rows = read_tsv(deg_summary)
    log("PASS", f"DEG summary has {len(rows)} comparison rows")

    for row in rows:
        print("  DEG SUMMARY:", row)

    if len(rows) != 4:
        log("WARN", "Expected four stress-versus-control comparisons in DEG summary")


# 5. Annotation files and ID consistency
section("5. GENE-ANNOTATION AUDIT")

annotation_files = [
    (ANNOT / "maize.B73.AGPv4.aggregate.gaf.gz", "Maize-GAMER RefGen4 GAF"),
    (ANNOT / "go-basic.obo", "GO ontology"),
    (ANNOT / "enzyme_function_GO_terms.tsv", "Enzyme-associated GO terms"),
    (ANNOT / "RefGen4_enzyme_gene_GO.tsv", "RefGen4 enzyme gene-GO mapping"),
    (ANNOT / "RefGen4_enzyme_genes.txt", "RefGen4 enzyme-associated genes"),
    (ANNOT / "RefGen4_metabolic_enzyme_genes.tsv", "RefGen4 metabolic enzyme mapping"),
    (ANNOT / "RefGen4_metabolic_enzyme_genes.txt", "RefGen4 metabolic enzyme gene list"),
]

for path, label in annotation_files:
    check_file(path, label)

metabolic_gene_list = ANNOT / "RefGen4_metabolic_enzyme_genes.txt"
if metabolic_gene_list.is_file():
    genes = {
        line.strip()
        for line in metabolic_gene_list.read_text(errors="replace").splitlines()
        if line.strip()
    }
    log("PASS" if len(genes) == 18585 else "WARN",
        f"Metabolic enzyme universe contains {len(genes):,} unique IDs; expected historical checkpoint 18,585")

    bad_ids = [g for g in genes if not g.startswith("Zm00001d")]
    if bad_ids:
        log("WARN", f"{len(bad_ids)} metabolic-universe IDs do not start with RefGen4 prefix Zm00001d")
    else:
        log("PASS", "Metabolic-universe gene IDs use the expected RefGen4 prefix")


# 6. Stress-specific metabolic enzyme DEG sets and direction counts
section("6. METABOLIC-ENZYME DEG SET AUDIT")

for stress in STRESSES:
    path = GENESETS / f"{stress}_metabolic_enzyme_DEGs.tsv"
    if not check_file(path, f"{stress} metabolic-enzyme DEG set"):
        continue

    rows = read_tsv(path)
    observed = len(rows)
    expected = EXPECTED_METABOLIC_DEGS[stress]

    if observed == expected:
        log("PASS", f"{stress}: {observed} rows match the expected metabolic-enzyme DEG count")
    else:
        log("WARN", f"{stress}: {observed} rows; historical checkpoint was {expected}")

    if not rows:
        continue

    columns = rows[0].keys()
    lfc_col = next(
        (c for c in columns if c.lower() in ("log2foldchange", "log2fc", "log2_fold_change")),
        None,
    )
    padj_col = next(
        (c for c in columns if c.lower() in ("padj", "adjusted_p", "adjusted_p_value")),
        None,
    )

    if lfc_col:
        up = down = zero = invalid = 0
        for row in rows:
            try:
                value = float(row[lfc_col])
                if value >= 1:
                    up += 1
                elif value <= -1:
                    down += 1
                else:
                    zero += 1
            except (ValueError, TypeError):
                invalid += 1

        log("PASS", f"{stress}: directly counted log2FC >= 1: {up}; <= -1: {down}; between thresholds: {zero}")
        if invalid:
            log("WARN", f"{stress}: {invalid} rows have missing/non-numeric log2FC")
        if up + down + zero + invalid != observed:
            log("FAIL", f"{stress}: log2FC categories do not add up to row count")
    else:
        log("WARN", f"{stress}: no log2FC column found; cannot recalculate up/down counts from this file")

    if padj_col:
        invalid_p = 0
        for row in rows:
            try:
                p = float(row[padj_col])
                if not 0 <= p <= 1:
                    invalid_p += 1
            except (ValueError, TypeError):
                invalid_p += 1
        if invalid_p:
            log("WARN", f"{stress}: {invalid_p} adjusted-P values are missing or outside [0,1]")
        else:
            log("PASS", f"{stress}: adjusted-P values are numeric and within [0,1]")


# 7. Final RQ1 tables
section("7. FINAL RQ1 TABLE AUDIT")

q1_enrichment = RESULTS / "tables" / "Q1_metabolic_process_enrichment.tsv"
q1_direction = RESULTS / "tables" / "Q1_metabolic_process_direction.tsv"
q1_summary = RESULTS / "tables" / "Q1_enrichment_summary.tsv"
q1_classes = RESULTS / "tables" / "Q1_shared_stress_specific_processes.tsv"
q1_matrix = RESULTS / "tables" / "Q1_cross_stress_direction_matrix.tsv"

for path in [q1_enrichment, q1_direction, q1_summary, q1_classes, q1_matrix]:
    check_file(path, f"RQ1 table {path.name}")

if q1_summary.is_file():
    rows = read_tsv(q1_summary)
    summary = {}
    for row in rows:
        try:
            summary[row["Stress"]] = int(row["Enriched_Metabolic_Processes"])
        except (KeyError, ValueError):
            pass

    if summary == EXPECTED_ENRICHMENT:
        log("PASS", f"RQ1 enrichment summary matches expected values: {summary}")
    else:
        log("FAIL", f"RQ1 enrichment summary differs from expected: {summary}")

if q1_enrichment.is_file():
    rows = read_tsv(q1_enrichment)
    log("PASS" if len(rows) == 55 else "WARN",
        f"RQ1 enrichment table has {len(rows)} records; expected historical checkpoint 55")

if q1_direction.is_file():
    rows = read_tsv(q1_direction)
    log("PASS" if len(rows) == 55 else "WARN",
        f"RQ1 direction table has {len(rows)} rows; expected 55 stress-process records")

    required = {
        "Stress", "GO_ID", "Description", "Gene_Count",
        "Positive_Genes", "Negative_Genes", "Median_log2FC",
        "Mean_log2FC", "Coherence", "Direction", "Adjusted_P",
    }
    if rows and required.issubset(rows[0].keys()):
        log("PASS", "RQ1 direction table contains the expected interpretation columns")
    else:
        log("FAIL", "RQ1 direction table is missing one or more expected columns")

if q1_classes.is_file():
    rows = read_tsv(q1_classes)
    counts = {}
    go_ids = set()
    for row in rows:
        cls = row.get("Response_Class", "")
        counts[cls] = counts.get(cls, 0) + 1
        go_ids.add(row.get("GO_ID", ""))

    expected_classes = {
        "Shared across all four stresses": 1,
        "Shared across multiple stresses": 9,
        "Stress-specific": 30,
    }
    if counts == expected_classes and len(go_ids) == 40:
        log("PASS", "RQ1 process classes agree: 1 all-four, 9 multi-stress, 30 specific; 40 unique GO IDs")
    else:
        log("WARN", f"RQ1 process-class counts/unique IDs need review: classes={counts}; unique IDs={len(go_ids)}")

if q1_matrix.is_file():
    rows = read_tsv(q1_matrix)
    log("PASS" if len(rows) == 40 else "WARN",
        f"RQ1 cross-stress direction matrix has {len(rows)} rows; expected 40 unique processes")


# 8. Figure output existence and basic file sanity
section("8. FIGURE AND PUBLICATION-OUTPUT AUDIT")

expected_figures = [
    "Figure_1_enriched_metabolic_processes.png",
    "Figure_1_enriched_metabolic_processes.pdf",
    "Figure_2_top_metabolic_processes.png",
    "Figure_2_top_metabolic_processes.pdf",
    "Figure_3_cross_stress_metabolic_direction_heatmap.png",
    "Figure_4_metabolic_response_direction.png",
    "Figure_4_metabolic_response_direction.pdf",
]

for name in expected_figures:
    path = RESULTS / "figures" / name
    if check_file(path, f"Figure {name}"):
        if path.suffix == ".png":
            try:
                with path.open("rb") as f:
                    signature = f.read(8)
                if signature == b"\x89PNG\r\n\x1a\n":
                    log("PASS", f"{name}: valid PNG file signature")
                else:
                    log("FAIL", f"{name}: PNG signature invalid")
            except OSError:
                log("FAIL", f"{name}: unable to read file")
        elif path.suffix == ".pdf":
            try:
                with path.open("rb") as f:
                    signature = f.read(5)
                if signature == b"%PDF-":
                    log("PASS", f"{name}: valid PDF file signature")
                else:
                    log("FAIL", f"{name}: PDF signature invalid")
            except OSError:
                log("FAIL", f"{name}: unable to read file")


# 9. Final report
section("AUDIT SUMMARY")

print(f"PASS: {checks['PASS']}")
print(f"WARN: {checks['WARN']}")
print(f"FAIL: {checks['FAIL']}")

report_path = VALIDATION / "pipeline_validation_report.txt"
report_path.write_text(
    "\n".join(report)
    + "\n\n"
    + f"PASS: {checks['PASS']}\nWARN: {checks['WARN']}\nFAIL: {checks['FAIL']}\n",
    encoding="utf-8",
)

print(f"\nFull report saved to: {report_path}")
print("This audit checks file presence and cross-output consistency.")
print("It does not fully decompress/revalidate every large FASTQ or BAM.")

sys.exit(1 if checks["FAIL"] else 0)
