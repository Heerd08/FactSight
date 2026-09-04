# FactSight AI — Multi-Modal Misinformation Detection & Credibility Assessment System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=flat&logo=react)](https://react.dev/)
[![ChromaDB](https://img.shields.io/badge/Vector%20DB-ChromaDB%20(Pure%20RAG)-FF6F00)](https://www.trychroma.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%204-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🏛️ System Architecture

```
User Input (5 Modalities)
    │  (Text, URL, Screenshot OCR, Email, Social Link)
    ▼
FastAPI Multi-Modal Ingestion Engine
    ├── 1. Linguistic Manipulation & Phishing Urgency Detector
    ├── 2. Dense Semantic Vector Encoder (all-MiniLM-L6-v2)
    └── 3. Pure RAG Evidence Retrieval (Database 2: ChromaDB)
    ▼
Credibility Synthesis & Consensus Engine (1–10 Score)
    ├── Grounded Factual Verdict (Genuine / Misleading / Fake / Unverified)
    ├── Verified Source Citations & Direct Counter-Rationales
    └── Dual-Database Persistence (Database 1: Relational SQL Audits)
    ▼
Interactive React 18 Dashboard & Exportable Intelligence Reports
```

---

## 📁 Repository Structure

```
FactSight/
├── backend/                  # FastAPI Pure RAG Backend Engine
│   ├── app/
│   │   ├── api/routes/       # REST Endpoints (/analyze, /health, /feedback, /reports)
│   │   ├── database/         # Database 1: SQL Models (Users, History, Audits)
│   │   ├── rag/              # Database 2: ChromaDB Vector Store & Embeddings
│   │   └── services/         # Multi-Modal Extractor, Credibility & Manipulation Services
│   └── tests/                # 44 Automated Unit & Integration Tests
│
├── frontend/                 # React 18 + Vite UI Verification Platform
│   ├── src/
│   │   ├── components/       # Verification Hub, Score Gauges, Evidence Citations
│   │   ├── pages/            # Dashboard, Results, History, SavedReports, Insights
│   │   └── services/         # Backend API Client (http://127.0.0.1:8000/api)
│   └── package.json          # Vite + Tailwind 4 Dependencies
│
├── dataset/                  # Knowledge Base & Fact-Checking Datasets
│   ├── sample_verified_facts.csv # Curated Benchmark Fact-Checks (PolitiFact, Reuters, WHO, NIST)
│   └── dataset_info.md       # Dataset Ingestion Guide & Sources
│
├── extension/                # Chrome & Edge Manifest V3 Browser Companion
│   ├── manifest.json         # Extension Manifest V3
│   ├── popup.html / popup.js # 1-Click Verification Popup
│   └── content.js            # On-page Selection Verification Badges
│
└── ml/                       # Machine Learning Tokenizers & Dataset Loaders
```

---

## 🚀 Quick Start Guide

### 1. Start the Backend (FastAPI + ChromaDB RAG)
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **API URL**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Start the Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
- **Web App**: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🧪 Run Automated Tests
```bash
pytest backend/tests/ -v
```
- **44 test cases covering Database 1, Database 2 RAG, and all REST endpoints.**
