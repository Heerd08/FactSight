# Kaggle Datasets for Fact-Checking & RAG

Place your Kaggle CSV datasets in this folder (`backend/data/`). The backend will automatically ingest and index all `.csv` files found here on startup.

### Supported CSV Format
Any CSV file with the following standard columns will be seamlessly indexed:
- `claim_id`: Unique identifier (e.g. `FC001`)
- `claim_text`: The factual claim or statement
- `verdict`: `TRUE`, `FALSE`, `MISLEADING`, etc.
- `category`: Topic area (e.g. `Health`, `Technology`, `Science`, `Politics`)
- `source`: Fact-checking organization (e.g. `Reuters Fact Check`, `Snopes`, `PolitiFact`, `WHO`)
- `explanation`: Detailed explanation or debunk summary
- `confidence`: Confidence score (0.0 to 1.0)

### Recommended Kaggle Datasets
1. **LIAR Dataset**: Benchmarked dataset for fake news and fact verification.
2. **COVID-19 Misinformation Dataset**: World Health Organization & PolitiFact verified statements.
3. **Kaggle Fake News & True News Datasets**: Contains thousands of verified real and fake articles.

### How RAG Uses This Data
When an input claim is sent to `/api/verify`:
1. The backend performs lexical and semantic token overlap search against your Kaggle dataset.
2. Matched claims are injected as ground-truth evidence context into the verification prompt.
3. The response includes `rag_matches` detailing matched reference claims and their verdicts.
