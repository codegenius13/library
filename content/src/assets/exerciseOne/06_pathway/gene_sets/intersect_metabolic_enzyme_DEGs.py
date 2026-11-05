from pathlib import Path

BASE = Path.home() / "exerciseOne/06_pathway"
ANN = BASE / "annotation"
DEG = Path.home() / "exerciseOne/05_DE_analysis"
OUT = BASE / "gene_sets"

OUT.mkdir(parents=True, exist_ok=True)

# RefGen4 metabolic enzyme genes
metabolic_genes = set()

with open(ANN / "RefGen4_metabolic_enzyme_genes.txt") as f:
    for line in f:
        gene = line.strip()
        if gene:
            metabolic_genes.add(gene)

print(f"Metabolic enzyme gene universe: {len(metabolic_genes)}")

stresses = ["Cold", "Drought", "Heat", "Salinity"]

for stress in stresses:

    deg_file = DEG / f"{stress}_vs_Control_DEGs.tsv"

    genes = []

    with open(deg_file) as f:
        header = f.readline().rstrip("\n").split("\t")

        # Find gene column
        gene_col = None
        for i, name in enumerate(header):
            if name in {"gene", "Gene", "Gene_ID", "gene_id"}:
                gene_col = i
                break

        if gene_col is None:
            gene_col = 0

        for line in f:
            fields = line.rstrip("\n").split("\t")

            if len(fields) <= gene_col:
                continue

            gene = fields[gene_col].strip()

            # DESeq2 files use gene:Zm00001d...
            if gene.startswith("gene:"):
                gene = gene.replace("gene:", "", 1)

            genes.append((gene, fields))

    metabolic_deg = [
        item for item in genes
        if item[0] in metabolic_genes
    ]

    out_file = OUT / f"{stress}_metabolic_enzyme_DEGs.tsv"

    with open(out_file, "w") as out:
        out.write("\t".join(header) + "\n")

        for gene, fields in metabolic_deg:
            out.write("\t".join(fields) + "\n")

    print(f"{stress}: {len(metabolic_deg)} metabolic enzyme DEGs")
    print(f"  Written: {out_file}")
