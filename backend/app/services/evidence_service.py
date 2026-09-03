"""
Evidence Retrieval Service — Multi-Tier Hybrid Architecture:
1. Tier 1: Google Gemini Intelligent Pre-Analysis & Query Extraction
2. Tier 2: Tavily Live Deep Web Search & Real-Time News Verification
3. Tier 3: Local ChromaDB Vector Database (Dense Semantic Storage)
"""

import re
import json
import logging
from typing import Optional, Dict, Any, List

from app.rag.retriever import get_rag_retriever
from app.rag.vector_store import get_vector_store
from app.services.ai_search_agent import get_ai_search_agent
from app.services.temporal_service import get_temporal_service

logger = logging.getLogger(__name__)


class EvidenceService:
    """Retrieves verified evidence using Google Gemini query understanding and Tavily live search."""

    def __init__(self):
        self.retriever = get_rag_retriever()
        self.vector_store = get_vector_store()
        self.search_agent = get_ai_search_agent()
        self.temporal_service = get_temporal_service()

    def retrieve_evidence(self, claim: str, content_type: str = "text") -> Dict[str, Any]:
        """Retrieve verified evidence across Gemini query deconstruction and Tavily live search."""
        claim_cleaned = claim.strip()
        if not claim_cleaned:
            return {"sources": [], "status": "no_results", "max_similarity": 0.0, "consensus_verdict": None}

        # Step 1: Run Gemini + Tavily Dual-AI Agent Search
        logger.info(f"Executing Gemini + Tavily Search for input ({content_type}): '{claim_cleaned[:80]}...'")
        agent_result = self.search_agent.search_and_conclude(claim_cleaned, content_type=content_type, max_results=4)
        agent_evidence = agent_result.get("evidence", [])
        agent_verdict = agent_result.get("verdict")
        agent_confidence = agent_result.get("confidence", 0.90)

        formatted_sources = []
        for item in agent_evidence:
            formatted_sources.append({
                "title": item.get("title", "Web Verification Article"),
                "source": item.get("source", "Tavily Web Search"),
                "url": item.get("url", ""),
                "snippet": item.get("snippet", ""),
            })

        consensus_mapped = "False" if agent_verdict == "Fake" else ("True" if agent_verdict == "Genuine" else "Mixed")

        return {
            "sources": formatted_sources,
            "status": "found" if formatted_sources else "no_results",
            "max_similarity": agent_confidence,
            "consensus_verdict": consensus_mapped,
            "direct_answer": agent_result.get("direct_ai_summary"),
            "conclusion": agent_result.get("conclusion"),
            "detailed_explanation": agent_result.get("detailed_explanation"),
            "credibility_score_pct": agent_result.get("credibility_score_pct"),
            "classification": agent_verdict,
            "confidence": agent_confidence,
            "gemini_understanding": agent_result.get("gemini_understanding"),
            "manipulation_type": agent_result.get("manipulation_type"),
            "tavily_verification": agent_result.get("tavily_verification"),
        }


# Singleton
_evidence_service: Optional[EvidenceService] = None


def get_evidence_service() -> EvidenceService:
    global _evidence_service
    if _evidence_service is None:
        _evidence_service = EvidenceService()
    return _evidence_service
