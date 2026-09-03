"""
RAG Retriever Service — Performs semantic similarity retrieval of verified evidence.

Takes user input / extracted claims, retrieves nearest matches from Vector Database,
computes semantic similarity scores, and formats structured evidence for credibility scoring.
"""

import logging
from typing import List, Dict, Any, Optional

from app.rag.vector_store import get_vector_store
from app.api.schemas.analysis import EvidenceItem

logger = logging.getLogger(__name__)


class RAGRetriever:
    """Retrieves relevant verified fact-checks from the Vector Database."""

    def __init__(self, min_similarity: float = 0.55):
        self.vector_store = get_vector_store()
        self.min_similarity = min_similarity

    def retrieve(self, query_claim: str, top_k: int = 3) -> Dict[str, Any]:
        """Retrieve verified evidence relevant to the input claim.

        Args:
            query_claim: Text claim to verify
            top_k: Max number of evidence articles to return

        Returns:
            Dict containing:
                - sources: list of EvidenceItem objects/dicts
                - status: 'found', 'no_results', or 'not_configured'
                - max_similarity: highest cosine similarity score
                - consensus_verdict: consensus verdict among retrieved evidence (True/False/Mixed/None)
        """
        # Ensure vector store is initialized
        if not self.vector_store.is_initialized:
            self.vector_store.initialize()

        if self.vector_store.count() == 0:
            logger.info("Vector database collection is empty.")
            return {
                "sources": [],
                "status": "no_results",
                "max_similarity": 0.0,
                "consensus_verdict": None,
            }

        logger.info(f"Querying Vector DB for claim: '{query_claim[:80]}...'")
        raw_matches = self.vector_store.search(
            query=query_claim,
            top_k=top_k,
            min_similarity=self.min_similarity,
        )

        if not raw_matches:
            logger.info(f"No evidence matches found above similarity threshold ({self.min_similarity}).")
            return {
                "sources": [],
                "status": "no_results",
                "max_similarity": 0.0,
                "consensus_verdict": None,
            }

        sources = []
        verdicts = []
        max_similarity = raw_matches[0]["similarity"] if raw_matches else 0.0

        for match in raw_matches:
            meta = match["metadata"]
            snippet = meta.get("snippet", match.get("document", ""))
            sim_pct = int(match["similarity"] * 100)
            
            # Enrich snippet with similarity context
            enriched_snippet = f"[{sim_pct}% Match] {snippet}"
            
            sources.append({
                "title": meta.get("title", "Verified Fact Check"),
                "source": meta.get("source", "Fact-Checking Registry"),
                "url": meta.get("url", ""),
                "snippet": enriched_snippet,
            })
            
            verdict = meta.get("verdict")
            if verdict:
                verdicts.append(verdict.lower())

        # Determine evidence consensus verdict
        consensus = None
        if verdicts:
            if all(v in ("true", "genuine", "accurate") for v in verdicts):
                consensus = "True"
            elif all(v in ("false", "pants-fire", "fake", "incorrect") for v in verdicts):
                consensus = "False"
            else:
                consensus = "Mixed"

        logger.info(f"Retrieved {len(sources)} RAG evidence sources (Max similarity: {max_similarity:.2%}, Consensus: {consensus})")

        return {
            "sources": sources,
            "status": "found",
            "max_similarity": max_similarity,
            "consensus_verdict": consensus,
        }


_retriever: Optional[RAGRetriever] = None


def get_rag_retriever() -> RAGRetriever:
    global _retriever
    if _retriever is None:
        _retriever = RAGRetriever()
    return _retriever
