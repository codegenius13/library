from pathlib import Path
import gzip
import re
from functools import lru_cache

BASE = Path.home() / "exerciseOne/06_pathway/annotation"
OUT = Path.home() / "exerciseOne/07_results/01_answer/data"

OBO = BASE / "go-basic.obo"
GAF = BASE / "maize.B73.AGPv4.aggregate.gaf.gz"

METABOLIC_ROOTS = {
    "GO:0008152",
    "GO:0044238",
    "GO:0044281",
    "GO:0005975",
    "GO:0006082",
    "GO:0006091",
    "GO:0006520",
    "GO:0006629",
}

# ------------------------------------------------------------
# Parse GO parent relationships
# ------------------------------------------------------------

parents = {}
names = {}
namespace = {}

current = None
obsolete = False

with open(OBO, encoding="utf-8", errors="ignore") as f:

    for line in f:
        line = line.rstrip()

        if line == "[Term]":
            current = None
            obsolete = False

        elif line.startswith("id: GO:"):
            current = line.split("id:", 1)[1].strip()
            parents.setdefault(current, set())

        elif current and line.startswith("name: "):
            names[current] = line.split("name:", 1)[1].strip()

        elif current and line.startswith("namespace: "):
            namespace[current] = line.split("namespace:", 1)[1].strip()

        elif current and line.startswith("is_a: GO:"):
            parents[current].add(
                line.split("is_a:", 1)[1].split()[0]
            )

        elif current and line.startswith("relationship: part_of GO:"):
            parents[current].add(
                line.split("relationship: part_of", 1)[1].split()[0]
            )

        elif current and line.startswith("is_obsolete: true"):
            obsolete = True

        if obsolete and current:
            parents.pop(current, None)
            names.pop(current, None)
            namespace.pop(current, None)

@lru_cache(maxsize=None)
def is_metabolic(go_id):
    if go_id in METABOLIC_ROOTS:
        return True

    for parent in parents.get(go_id, set()):
        if is_metabolic(parent):
            return True

    return False

metabolic_terms = {
    go_id
    for go_id in parents
    if namespace.get(go_id) == "biological_process"
    and is_metabolic(go_id)
}

print("Metabolic BP terms:", len(metabolic_terms))

# ------------------------------------------------------------
# Read RefGen4 GAF
# ------------------------------------------------------------

pairs = set()

with gzip.open(GAF, "rt", encoding="utf-8", errors="ignore") as f:

    for line in f:

        if line.startswith("!"):
            continue

        fields = line.rstrip("\n").split("\t")

        if len(fields) < 9:
            continue

        gene = fields[1]
        go_id = fields[4]
        aspect = fields[8]

        if not gene.startswith("Zm00001d"):
            continue

        if aspect != "P":
            continue

        if go_id not in metabolic_terms:
            continue

        pairs.add((go_id, gene))

# ------------------------------------------------------------
# Write TERM2GENE
# ------------------------------------------------------------

term2gene = OUT / "metabolic_BP_TERM2GENE.tsv"
term2name = OUT / "metabolic_BP_TERM2NAME.tsv"

with open(term2gene, "w") as out:
    out.write("GO_ID\tGene_ID\n")

    for go_id, gene in sorted(pairs):
        out.write(f"{go_id}\t{gene}\n")

with open(term2name, "w") as out:
    out.write("GO_ID\tDescription\n")

    for go_id in sorted({x[0] for x in pairs}):
        out.write(
            f"{go_id}\t{names.get(go_id, 'Unknown')}\n"
        )

print("Metabolic BP gene-term pairs:", len(pairs))
print("Written:", term2gene)
print("Written:", term2name)
