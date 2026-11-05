from pathlib import Path
import re

BASE = Path.home() / "exerciseOne/06_pathway/annotation"

GAF = BASE / "maize.B73.AGPv4.aggregate.gaf.gz"
OBO = BASE / "go-basic.obo"
ENZYME_TERMS = BASE / "enzyme_function_GO_terms.tsv"

OUT_TSV = BASE / "RefGen4_metabolic_enzyme_genes.tsv"
OUT_TXT = BASE / "RefGen4_metabolic_enzyme_genes.txt"

METABOLIC_ROOTS = {
    "GO:0008152",  # metabolic process
    "GO:0044238",  # primary metabolic process
    "GO:0044281",  # small molecule metabolic process
    "GO:0005975",  # carbohydrate metabolic process
    "GO:0006082",  # organic acid metabolic process
    "GO:0006091",  # generation of precursor metabolites and energy
    "GO:0006520",  # amino acid metabolic process
    "GO:0006629",  # lipid metabolic process
}

# ------------------------------------------------------------
# 1. Parse GO ontology: is_a + part_of relationships
# ------------------------------------------------------------

parents = {}

current = None
obsolete = False

with open(OBO, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        line = line.rstrip()

        if line == "[Term]":
            current = None
            obsolete = False

        elif line.startswith("id: GO:"):
            current = line.split("id:", 1)[1].strip()
            parents.setdefault(current, set())

        elif current and line.startswith("is_a: GO:"):
            parent = line.split("is_a:", 1)[1].split()[0]
            parents[current].add(parent)

        elif current and line.startswith("relationship: part_of GO:"):
            parent = line.split("relationship: part_of", 1)[1].split()[0]
            parents[current].add(parent)

        elif current and line.startswith("is_obsolete: true"):
            obsolete = True

        if obsolete and current:
            parents.pop(current, None)

print(f"GO terms with parent relationships: {len(parents)}")

# ------------------------------------------------------------
# 2. Determine which BP terms belong to metabolic branches
# ------------------------------------------------------------

from functools import lru_cache

@lru_cache(maxsize=None)
def reaches_metabolic_root(go_id):
    if go_id in METABOLIC_ROOTS:
        return True

    for parent in parents.get(go_id, ()):
        if reaches_metabolic_root(parent):
            return True

    return False


# ------------------------------------------------------------
# 3. Read enzyme-associated MF terms
# ------------------------------------------------------------

enzyme_terms = set()

with open(ENZYME_TERMS, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()

        if not line or line.startswith("GO_ID"):
            continue

        parts = line.split("\t")

        if parts:
            go_id = parts[0].strip()

            if re.match(r"^GO:\d+$", go_id):
                enzyme_terms.add(go_id)

print(f"Enzyme molecular-function terms available: {len(enzyme_terms)}")

# ------------------------------------------------------------
# 4. Read GAF and collect:
#    gene -> enzyme MF terms
#    gene -> metabolic BP terms
# ------------------------------------------------------------

enzyme_by_gene = {}
metabolic_bp_by_gene = {}

import gzip

with gzip.open(GAF, "rt", encoding="utf-8", errors="ignore") as f:
    for line in f:
        if line.startswith("!"):
            continue

        fields = line.rstrip("\n").split("\t")

        if len(fields) < 9:
            continue

        gene = fields[1].strip()
        go_id = fields[4].strip()
        aspect = fields[8].strip()

        if not gene.startswith("Zm00001d"):
            continue

        # Molecular Function enzyme annotation
        if aspect == "F" and go_id in enzyme_terms:
            enzyme_by_gene.setdefault(gene, set()).add(go_id)

        # Biological Process annotation
        elif aspect == "P":
            if reaches_metabolic_root(go_id):
                metabolic_bp_by_gene.setdefault(gene, set()).add(go_id)

# ------------------------------------------------------------
# 5. Require BOTH:
#    enzyme-associated MF
#    metabolic BP
# ------------------------------------------------------------

metabolic_genes = sorted(
    set(enzyme_by_gene) & set(metabolic_bp_by_gene)
)

print(f"Genes with enzyme-associated MF: {len(enzyme_by_gene)}")
print(f"Genes with metabolic BP annotation: {len(metabolic_bp_by_gene)}")
print(f"RefGen4 metabolic enzyme genes: {len(metabolic_genes)}")

# ------------------------------------------------------------
# 6. Write detailed table
# ------------------------------------------------------------

with open(OUT_TSV, "w", encoding="utf-8") as out:
    out.write(
        "Gene_ID\tEnzyme_GO_Count\tEnzyme_GO_Terms\tMetabolic_BP_Count\tMetabolic_BP_Terms\n"
    )

    for gene in metabolic_genes:
        enzyme_gos = sorted(enzyme_by_gene[gene])
        bp_gos = sorted(metabolic_bp_by_gene[gene])

        out.write(
            f"{gene}\t"
            f"{len(enzyme_gos)}\t"
            f"{';'.join(enzyme_gos)}\t"
            f"{len(bp_gos)}\t"
            f"{';'.join(bp_gos)}\n"
        )

# ------------------------------------------------------------
# 7. Write gene-only list
# ------------------------------------------------------------

with open(OUT_TXT, "w", encoding="utf-8") as out:
    for gene in metabolic_genes:
        out.write(gene + "\n")

print(f"Written: {OUT_TSV}")
print(f"Written: {OUT_TXT}")
