"""
Knowledge Ingestion Service — Ingests fact-checking articles, claims, and verified sources into Vector Database.

Supports:
- High-quality seed fact-check corpus (PolitiFact, Reuters, CDC, WHO, SciCheck)
- CSV, TSV (LIAR), JSON, JSONL (FEVEROUS), and Parquet batch file ingestion CLI
"""

import json
import logging
import argparse
import csv
from pathlib import Path
from typing import List, Dict, Any, Optional

import pandas as pd

from app.rag.vector_store import get_vector_store

logger = logging.getLogger(__name__)

# Curated benchmark fact-check seed database for immediate RAG verification
SEED_FACT_CHECKS = [
    {
        "id": "fc_001",
        "claim": "COVID-19 vaccines contain microchips or tracking devices developed by the government or Bill Gates.",
        "verdict": "False",
        "title": "Fact Check: COVID-19 vaccines do not contain microchips or RFID tracking technology",
        "source": "Reuters Fact Check",
        "url": "https://www.reuters.com/article/factcheck-coronavirus-vaccine-microchip-idUSL1N2M81I7",
        "snippet": "Claims that COVID-19 vaccines contain microchips or nanotechnology for surveillance are completely false. Independent laboratories, FDA regulatory reviews, and ingredient lists confirm vaccines contain mRNA, lipids, salts, and sugars.",
        "category": "Health & Medicine",
    },
    {
        "id": "fc_002",
        "claim": "5G wireless network radiation is the direct cause of the COVID-19 pandemic and viral mutations.",
        "verdict": "False",
        "title": "Fact Check: No link between 5G wireless technology and coronavirus spread",
        "source": "World Health Organization (WHO)",
        "url": "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters",
        "snippet": "Viruses cannot travel on radio waves or mobile networks. COVID-19 is spreading in many countries that do not have 5G mobile networks. 5G uses non-ionizing electromagnetic radiation that cannot generate biological viruses.",
        "category": "Technology & Health",
    },
    {
        "id": "fc_003",
        "claim": "The Great Wall of China is visible from the Moon with the naked human eye.",
        "verdict": "False",
        "title": "NASA Science: Is the Great Wall of China visible from Space or the Moon?",
        "source": "NASA Earth Observatory",
        "url": "https://earthobservatory.nasa.gov/images/2012/great-wall-of-china",
        "snippet": "The Great Wall of China cannot be seen from the Moon without optical magnification. Astronauts have confirmed it is barely distinguishable from low Earth orbit only under perfect lighting and high-resolution camera lenses.",
        "category": "Science & Space",
    },
    {
        "id": "fc_004",
        "claim": "Water boils at 100 degrees Celsius at standard atmospheric sea level pressure.",
        "verdict": "True",
        "title": "Physical Properties of Water: Boiling Point and Phase Changes",
        "source": "National Institute of Standards and Technology (NIST)",
        "url": "https://www.nist.gov/pml/weights-and-measures",
        "snippet": "Under standard atmospheric pressure (1 atm or 101.325 kPa), the boiling point of pure water is precisely 100 degrees Celsius (212 degrees Fahrenheit).",
        "category": "Physics & Chemistry",
    },
    {
        "id": "fc_005",
        "claim": "The United Nations was officially established in October 1945 following the conclusion of World War II.",
        "verdict": "True",
        "title": "History of the United Nations Charter and Inception",
        "source": "United Nations Official Archives",
        "url": "https://www.un.org/en/about-us/history-of-the-un",
        "snippet": "The United Nations officially came into existence on 24 October 1945, when the UN Charter had been ratified by China, France, the Soviet Union, the United Kingdom, the United States and by a majority of other signatories.",
        "category": "History & Politics",
    },
    {
        "id": "fc_006",
        "claim": "Drinking bleach or chlorine dioxide cures viral infections and eradicates diseases.",
        "verdict": "False",
        "title": "FDA Warning: Dangerous claims regarding ingestion of chlorine dioxide products",
        "source": "US Food and Drug Administration (FDA)",
        "url": "https://www.fda.gov/consumers/consumer-updates/danger-dont-drink-miracle-mineral-solution-or-similar-products",
        "snippet": "Ingesting industrial bleach or chlorine dioxide products can cause severe, life-threatening side effects including acute liver failure, respiratory failure, and severe dehydration. It is not an approved medical treatment.",
        "category": "Health & Safety",
    },
    {
        "id": "fc_007",
        "claim": "Global average surface temperatures have risen significantly since the pre-industrial era due to human greenhouse gas emissions.",
        "verdict": "True",
        "title": "IPCC Sixth Assessment Report: Physical Science Basis of Climate Change",
        "source": "Intergovernmental Panel on Climate Change (IPCC)",
        "url": "https://www.ipcc.ch/report/ar6/wg1/",
        "snippet": "Scientific evidence unequivocally demonstrates that human influence has warmed the atmosphere, ocean, and land. Global surface temperature has increased by approximately 1.1°C compared to 1850-1900 levels.",
        "category": "Environmental Science",
    },
    {
        "id": "fc_008",
        "claim": "The Earth is flat and scientific space agencies maintain an armed military ice wall around Antarctica.",
        "verdict": "False",
        "title": "Planetary Geodesy and Satellite Observations of Earth's Oblate Spheroid Shape",
        "source": "European Space Agency (ESA)",
        "url": "https://www.esa.int/Applications/Observing_the_Earth",
        "snippet": "Centuries of navigational physics, satellite observations, and gravitational measurements confirm Earth is an oblate spheroid. Claims of a perimeter ice wall guarded by military forces are baseless conspiracy theories.",
        "category": "Science & Astronomy",
    },
]


def seed_vector_store():
    """Ingest the default curated seed fact-check dataset into the vector store."""
    vector_store = get_vector_store()
    logger.info(f"Seeding vector database with {len(SEED_FACT_CHECKS)} verified benchmark fact-checks...")

    documents = []
    metadatas = []
    ids = []

    for item in SEED_FACT_CHECKS:
        doc_text = f"Claim: {item['claim']}\nVerification: {item['snippet']}"
        documents.append(doc_text)
        metadatas.append({
            "claim": item["claim"],
            "title": item["title"],
            "source": item["source"],
            "url": item["url"],
            "verdict": item["verdict"],
            "category": item["category"],
            "snippet": item["snippet"],
        })
        ids.append(item["id"])

    vector_store.add_documents(
        documents=documents,
        metadatas=metadatas,
        ids=ids,
    )
    logger.info(f"Vector store seeded successfully. Total documents: {vector_store.count()}")


def ingest_file(file_path: str, limit: Optional[int] = None):
    """Ingest CSV, TSV (LIAR), JSONL (FEVEROUS), JSON, or Parquet dataset into Vector DB."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    logger.info(f"Loading dataset file: {path.name} (limit={limit})")
    documents = []
    metadatas = []
    ids = []

    # 1. JSONL (FEVEROUS)
    if path.suffix == ".jsonl":
        with open(path, "r", encoding="utf-8") as f:
            for idx, line in enumerate(f):
                if limit and idx >= limit:
                    break
                try:
                    data = json.loads(line)
                    claim = data.get("claim", "").strip()
                    label = data.get("label", "").strip()
                    if not claim or label not in ["SUPPORTS", "REFUTES"]:
                        continue

                    verdict = "True" if label == "SUPPORTS" else "False"
                    source = "FEVEROUS Benchmark Knowledge Base"
                    snippet = f"Verified statement: {claim}. Ground truth evaluation confirmed as {label}."
                    doc_text = f"Claim: {claim}\nVerification: {snippet}"
                    doc_id = f"feverous_{idx}"

                    documents.append(doc_text)
                    metadatas.append({
                        "claim": claim,
                        "title": f"FEVEROUS Fact Verification #{idx}",
                        "source": source,
                        "url": "https://fever.ai/",
                        "verdict": verdict,
                        "snippet": snippet,
                    })
                    ids.append(doc_id)
                except Exception:
                    continue

    # 2. TSV (LIAR dataset)
    elif path.suffix == ".tsv":
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.reader(f, delimiter="\t")
            for idx, row in enumerate(reader):
                if limit and idx >= limit:
                    break
                try:
                    if len(row) < 3:
                        continue
                    raw_label = row[1].strip().lower()
                    claim = row[2].strip()
                    context = f"Subject: {row[3] if len(row) > 3 else ''} by {row[4] if len(row) > 4 else 'Public Speaker'}"

                    # Map 6-point LIAR labels
                    if raw_label in ["true", "mostly-true"]:
                        verdict = "True"
                    elif raw_label in ["false", "pants-fire", "barely-true"]:
                        verdict = "False"
                    else:
                        verdict = "Unverified"

                    source = "PolitiFact (LIAR Dataset)"
                    snippet = f"Statement by {row[4] if len(row) > 4 else 'Speaker'}: {claim}. PolitiFact rating: {raw_label}."
                    doc_text = f"Claim: {claim}\nVerification: {snippet}"
                    doc_id = f"liar_{idx}"

                    documents.append(doc_text)
                    metadatas.append({
                        "claim": claim,
                        "title": f"PolitiFact Check #{idx}",
                        "source": source,
                        "url": "https://www.politifact.com/",
                        "verdict": verdict,
                        "snippet": snippet,
                    })
                    ids.append(doc_id)
                except Exception:
                    continue

    # 3. Standard CSV / JSON / Parquet
    elif path.suffix in [".csv", ".json", ".parquet"]:
        if path.suffix == ".csv":
            df = pd.read_csv(path)
        elif path.suffix == ".json":
            df = pd.read_json(path)
        else:
            df = pd.read_parquet(path)

        if limit:
            df = df.head(limit)

        for idx, row in df.iterrows():
            claim = str(row.get("claim", row.get("title", row.get("statement", ""))))
            snippet = str(row.get("snippet", row.get("text", row.get("explanation", ""))))
            source = str(row.get("source", "Verified Fact Check"))
            url = str(row.get("url", ""))
            verdict = str(row.get("verdict", row.get("label", "Checked")))

            if not claim and not snippet:
                continue

            doc_text = f"Claim: {claim}\nVerification: {snippet}"
            doc_id = f"custom_{path.stem}_{idx}"

            documents.append(doc_text)
            metadatas.append({
                "claim": claim,
                "title": str(row.get("title", f"Fact Check #{idx}")),
                "source": source,
                "url": url,
                "verdict": verdict,
                "snippet": snippet,
            })
            ids.append(doc_id)

    vector_store = get_vector_store()
    # Batch add in chunks of 200
    batch_size = 200
    for i in range(0, len(ids), batch_size):
        vector_store.add_documents(
            documents=documents[i:i+batch_size],
            metadatas=metadatas[i:i+batch_size],
            ids=ids[i:i+batch_size],
        )
    logger.info(f"Successfully ingested {len(ids)} documents from {path.name}. Total in Vector DB: {vector_store.count()}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser(description="FactSight Vector DB Ingestion CLI")
    parser.add_argument("--seed", action="store_true", help="Ingest standard benchmark seed corpus")
    parser.add_argument("--file", type=str, help="Path to custom dataset file (.jsonl, .tsv, .csv, .json, .parquet)")
    parser.add_argument("--limit", type=int, default=None, help="Maximum number of records to index")
    args = parser.parse_args()

    if args.file:
        ingest_file(args.file, limit=args.limit)
    else:
        seed_vector_store()
