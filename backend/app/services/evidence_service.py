"""
Evidence Retrieval Service — Connects to Vector Database (Database 2) via RAG Retriever.

Retrieves verified fact-checks and authoritative source evidence with semantic similarity matching.
IMPORTANT: This service NEVER fabricates URLs, sources, citations, or evidence.
"""

import logging
from typing import Optional, Dict, Any

from app.rag.retriever import get_rag_retriever

logger = logging.getLogger(__name__)


class EvidenceService:
    """Service for retrieving real verification evidence from the Vector Database."""

    def __init__(self):
        self.retriever = get_rag_retriever()
        self.is_configured = True

    def retrieve_evidence(self, claim: str) -> Dict[str, Any]:
        """Retrieve verified evidence for a given claim from Vector Database.

        Args:
            claim: The factual claim to search evidence for.

        Returns:
            dict with keys:
                - sources: list[dict] — Each dict has: title, source, url, snippet
                - status: str — "found", "no_results", or "not_configured"
                - max_similarity: float
                - consensus_verdict: Optional[str]
        """
        try:
            return self.retriever.retrieve(claim, top_k=3)
        except Exception as e:
            logger.error(f"RAG evidence retrieval error: {e}")
            return {
                "sources": [],
                "status": "not_configured",
                "max_similarity": 0.0,
                "consensus_verdict": None,
            }

        # results = self._search_fact_checks(claim)
        # if not results:
        #     results = self._search_news(claim)
        # if not results:
        #     return {"sources": [], "status": "no_results"}
        # return {"sources": results, "status": "found"}

        return {
            "sources": [],
            "status": "not_configured",
        }

    def _search_fact_checks(self, claim: str) -> list[dict]:
        """Search fact-checking databases. To be implemented.

        Should return list of dicts with: title, source, url, snippet
        """
        raise NotImplementedError("Fact-check search not yet implemented")

    def _search_news(self, claim: str) -> list[dict]:
        """Search trusted news sources. To be implemented.

        Should return list of dicts with: title, source, url, snippet
        """
        raise NotImplementedError("News search not yet implemented")


# Module-level singleton
_evidence_service: Optional[EvidenceService] = None


def get_evidence_service() -> EvidenceService:
    """Get or create the evidence service singleton."""
    global _evidence_service
    if _evidence_service is None:
        _evidence_service = EvidenceService()
    return _evidence_service
