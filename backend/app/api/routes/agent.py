"""
AI Agent Endpoints — Autonomous Web Search & Evidence Synthesis.

POST /api/agent/search-and-conclude
Performs autonomous live web research across journalistic and scientific domains,
analyzes factual stances, and synthesizes an authoritative concluding verdict.
"""

import logging
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from app.services.ai_search_agent import get_ai_search_agent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent", tags=["AI Search Agent"])


class AgentSearchRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=3,
        description="The statement, claim, or news headline for the AI Agent to investigate.",
        examples=["Did NASA fake the Apollo moon landings?"],
    )
    max_results: int = Field(default=5, ge=1, le=10, description="Max web evidence sources to retrieve")


class AgentEvidenceItem(BaseModel):
    title: str
    source: str
    url: str
    snippet: str
    score: Optional[float] = 0.8


class AgentSearchResponse(BaseModel):
    verdict: str
    classification: str
    confidence: float
    credibility_score: int
    conclusion: str
    reasons: List[str]
    evidence: List[AgentEvidenceItem]
    evidence_status: str
    search_engine_used: str
    direct_ai_summary: Optional[str] = None


@router.post(
    "/search-and-conclude",
    response_model=AgentSearchResponse,
    summary="AI Agent Web Search & Conclude",
    description="Autonomous web search agent investigates a claim and synthesizes an evidence-grounded final verdict.",
)
async def agent_search_and_conclude(request: AgentSearchRequest):
    """Run the AI Search Agent to investigate and conclude truthfulness."""
    try:
        agent = get_ai_search_agent()
        result = agent.search_and_conclude(claim=request.query, max_results=request.max_results)
        return result
    except Exception as e:
        logger.error(f"AI Agent search failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI Agent search failed: {str(e)}")
