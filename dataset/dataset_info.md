# FactSight Datasets Directory

This folder contains benchmark fact-checking datasets used by the **Pure RAG Knowledge Retrieval Pipeline** (ChromaDB + SentenceTransformers).

---

### Available Datasets:

| Dataset File | Records | Source | Topics Covered |
| :--- | :--- | :--- | :--- |
| **`feverous_dev_challenges.jsonl`** | 7,890 claims | FEVEROUS / Cambridge | Science, Geography, History, Public Figures |
| **`feverous_train_challenges.jsonl`** | 70,000+ claims | FEVEROUS / Cambridge | Global Fact Verification Benchmark |
| **`liar_train.tsv`** | 10,240 claims | PolitiFact / UCSB | US Politics, Economics, Social Issues |
| **`liar_valid.tsv`** | 1,284 claims | PolitiFact / UCSB | Debunked viral claims & political statements |
| **`liar_test.tsv`** | 1,283 claims | PolitiFact / UCSB | Evaluation statements with 6-point ratings |

---

### Dataset Location on Your System:

Because the full dataset files are large (~200MB+ total), they are stored locally at:
📁 **`C:\Users\shishir\AppData\Local\Temp\factsight_datasets\`**
📁 **`C:\Users\shishir\OneDrive\Documents\FactSight-main\FactSight-main\`**

### How to Ingest More Records into ChromaDB:

Run the following command from the `backend/` directory:

```bash
# Ingest 500 claims from the LIAR dataset
python -m app.rag.ingestion --file "C:/Users/shishir/AppData/Local/Temp/factsight_datasets/liar_train.tsv" --limit 500

# Ingest 500 claims from FEVEROUS
python -m app.rag.ingestion --file "feverous_dev_challenges.jsonl" --limit 500
```
