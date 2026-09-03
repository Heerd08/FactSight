# FactSight API Documentation (v2.0 — Dual-DB & RAG Edition)

> **For Frontend Developers & Backend Integrators**  
> Complete specification of FactSight's REST API, Dual-Database Architecture, and RAG Evidence System.

---

## 1. System Overview & Base URL

```
http://localhost:8000
```

- **Database 1**: Relational Application Database (`users`, `analysis_history`, `reports`, `feedback`, `audit_logs`).
- **Database 2**: Vector Database (ChromaDB Fact-Checking Semantic Knowledge Base).
- **Interactive OpenAPI UI**: http://localhost:8000/docs
- **ReDoc Interactive UI**: http://localhost:8000/redoc

---

## 2. API Endpoints

### `GET /api/health` — System Health Check
Verifies server status, ML model availability, and Vector DB status.

**Response (200 OK):**
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_version": "deberta-v3-base-baseline-v1",
  "vector_db_loaded": true,
  "vector_db_documents": 8
}
```

---

### `POST /api/analyze` — Core Content Credibility Analysis
Accepts a claim, article, or social media post. Executes DeBERTa-v3 model inference, queries the Vector Database via RAG for semantic evidence, computes credibility score, detects manipulative language, and stores history with audit logging.

**Request Body:**
```json
{
  "text": "BREAKING: Scientists and government agencies confirm COVID-19 vaccines contain microchips for tracking."
}
```

**Response (200 OK):**
```json
{
  "classification": "Fake",
  "confidence": 0.892,
  "credibility_score": 1,
  "main_claim": "BREAKING: Scientists and government agencies confirm COVID-19 vaccines contain microchips for tracking.",
  "reasons": [
    "The AI model classified this content as likely false.",
    "The model's confidence in this classification is high (89%).",
    "Vector Database RAG retrieval found verified fact-check sources refuting this claim (86% semantic match).",
    "Manipulation indicators detected: Urgency language, Unattributed authority claims."
  ],
  "suspicious_phrases": [
    "breaking",
    "scientists confirm"
  ],
  "manipulation_indicators": [
    "Urgency language",
    "Unattributed authority claims"
  ],
  "evidence": [
    {
      "title": "Fact Check: COVID-19 vaccines do not contain microchips or RFID tracking technology",
      "source": "Reuters Fact Check",
      "url": "https://www.reuters.com/article/factcheck-coronavirus-vaccine-microchip-idUSL1N2M81I7",
      "snippet": "[86% Match] Claims that COVID-19 vaccines contain microchips or nanotechnology for surveillance are completely false. Independent laboratories, FDA regulatory reviews, and ingredient lists confirm vaccines contain mRNA, lipids, salts, and sugars."
    }
  ],
  "evidence_status": "found",
  "recommendation": "This content is likely false based on AI analysis and verified fact-checking records. Do not share this without verifying from authoritative sources.",
  "model_version": "deberta-v3-base-baseline-v1"
}
```

---

### `POST /api/feedback` — Submit User Feedback / Ground Truth
Allows users or analysts to submit feedback on an analysis.

**Request Body:**
```json
{
  "analysis_id": 1,
  "rating": 5,
  "is_accurate": true,
  "user_comment": "Accurate detection with genuine Reuters fact check."
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "analysis_id": 1,
  "rating": 5,
  "is_accurate": true,
  "user_comment": "Accurate detection with genuine Reuters fact check.",
  "created_at": "2026-09-03T16:15:00.000Z"
}
```

---

### `GET /api/feedback` — List Recent Feedback
Returns recent feedback submissions.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "analysis_id": 1,
    "rating": 5,
    "is_accurate": true,
    "user_comment": "Accurate detection.",
    "created_at": "2026-09-03T16:15:00.000Z"
  }
]
```

---

### `POST /api/reports` — Generate Intelligence Report
Generates an exportable credibility assessment report.

**Request Body:**
```json
{
  "analysis_id": 1,
  "title": "FactSight Executive Intelligence Report #1",
  "export_format": "json"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "analysis_id": 1,
  "title": "FactSight Executive Intelligence Report #1",
  "summary": "Credibility assessment for claim: 'COVID-19 vaccines contain microchips'. Verdict: Fake (Score: 1/10, Confidence: 89.2%).",
  "key_findings": "{\"classification\": \"Fake\", \"credibility_score\": 1, \"reasons\": [...]}",
  "export_format": "json",
  "created_at": "2026-09-03T16:16:00.000Z"
}
```

---

### `GET /api/reports/{report_id}` — Get Report by ID
Retrieve a previously generated intelligence report.

---

## 3. Database Schema Reference

### Database 1: Application Database (Relational)

| Table | Purpose | Key Fields |
|---|---|---|
| `users` | User management & roles | `id`, `username`, `email`, `role`, `is_active` |
| `analysis_history` | Historical claims & AI assessments | `id`, `user_id`, `input_text`, `classification`, `confidence`, `credibility_score`, `reasons`, `evidence`, `evidence_status` |
| `reports` | Intelligence assessment summaries | `id`, `user_id`, `analysis_id`, `title`, `summary`, `key_findings`, `export_format` |
| `feedback` | User validation ratings | `id`, `user_id`, `analysis_id`, `rating`, `is_accurate`, `user_comment` |
| `audit_logs` | Compliance & action tracking | `id`, `user_id`, `action`, `resource_type`, `resource_id`, `ip_address`, `details` |

### Database 2: Vector Database (RAG Semantic Corpus)

- **Engine**: ChromaDB with persistent HNSW index.
- **Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors).
- **Metadata Fields**: `claim`, `title`, `source`, `url`, `verdict`, `category`, `snippet`.

---

## 4. Ingesting Custom Fact-Checking Datasets

You can ingest external datasets (.csv, .json, .parquet) into the Vector DB:

```bash
# Ingest custom dataset into Vector DB
python -m app.rag.ingestion --file path/to/dataset.csv

# Seed default benchmark corpus
python -m app.rag.ingestion --seed
```
