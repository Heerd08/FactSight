"""
Knowledge Ingestion Service — Ingests fact-checking articles, claims, and verified sources into Vector Database.

Supports:
- High-quality seed fact-check corpus (PolitiFact, Reuters, CDC, WHO, SciCheck)
- CSV, JSON, and Parquet batch file ingestion CLI
"""

import json
import logging
import argparse
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
        # Document text includes the claim, snippet, and source for rich semantic retrieval
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


def ingest_file(file_path: str, claim_col: str = "claim", snippet_col: str = "snippet", source_col: str = "source", url_col: str = "url"):
    """Ingest external CSV, JSON, or Parquet fact-check dataset into the Vector Database."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    logger.info(f"Loading dataset file: {path.name}")
    if path.suffix == ".csv":
        df = pd.read_csv(path)
    elif path.suffix == ".json":
        df = pd.read_json(path)
    elif path.suffix == ".parquet":
        df = pd.read_parquet(path)
    else:
        raise ValueError("Unsupported format. Use .csv, .json, or .parquet")

    documents = []
    metadatas = []
    ids = []

    for idx, row in df.iterrows():
        claim = str(row.get(claim_col, ""))
        snippet = str(row.get(snippet_col, row.get("text", "")))
        source = str(row.get(source_col, "Verified Fact Check"))
        url = str(row.get(url_col, ""))
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
    vector_store.add_documents(documents=documents, metadatas=metadatas, ids=ids)
    logger.info(f"Successfully ingested {len(ids)} documents from {path.name}. Total in Vector DB: {vector_store.count()}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser(description="FactSight Vector DB Ingestion CLI")
    parser.add_argument("--seed", action="store_true", help="Ingest standard benchmark seed corpus")
    parser.add_argument("--file", type=str, help="Path to custom dataset file (.csv, .json, .parquet)")
    args = parser.parse_args()

    if args.file:
        ingest_file(args.file)
    else:
        seed_vector_store()
