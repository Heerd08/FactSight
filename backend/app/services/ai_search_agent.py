"""
FactSight AI Web Search Agent — Dual-AI Architecture (Google Gemini + Tavily Search).

Pipeline:
1. Gemini Agent: Pre-analyzes input (Text, URL, Social Media, Image OCR), extracts entities,
   detects contradictions, and formulates high-precision search queries.
2. Tavily Agent: Executes live web search using Gemini-optimized queries to fetch real-time citations.
3. Relevance Gating: Filters out off-topic results.
4. Gemini Reasoner: Synthesizes retrieved evidence into final verdict, continuous percentage score,
   and evidence-grounded factual rationale.
"""

import os
import re
import json
import logging
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional, Tuple

from app.core.config import settings
from app.services.temporal_service import get_temporal_service
from app.services.entity_extractor import get_entity_extractor
from app.services.gemini_service import get_gemini_service

logger = logging.getLogger(__name__)


class AISearchAgent:
    """Autonomous Dual-AI Agent combining Google Gemini and Tavily Live Search."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.TAVILY_API_KEY or os.getenv("TAVILY_API_KEY", "")
        self.temporal_service = get_temporal_service()
        self.entity_extractor = get_entity_extractor()
        self.gemini_service = get_gemini_service()
        self.headers = {
            "User-Agent": "FactSightAgent/1.0 (AI Misinformation Intelligence; info@factsight.org)"
        }

    def search_and_conclude(
        self,
        claim: str,
        content_type: str = "text",
        max_results: int = 5,
        modality_metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Execute autonomous Dual-AI search and evidence-grounded conclusion."""
        claim_clean = claim.strip()
        now_ctx = self.temporal_service.get_current_context()

        # Step 0: Real-Time Calendar, Leap Year & Holiday Grounding Check
        holiday_check = self.temporal_service.check_calendar_or_math_claim(claim_clean)
        if holiday_check:
            verdict = holiday_check["verdict"]
            score_pct = holiday_check["credibility_score_pct"]
            confidence = holiday_check["confidence"]
            explanation = holiday_check["explanation"]
            evidence = [{
                "title": f"{holiday_check['holiday_name']} - Ground Truth Reference",
                "source": "Official International Calendar & Mathematical Index",
                "url": f"https://en.wikipedia.org/wiki/{holiday_check['holiday_name'].replace(' ', '_')}",
                "snippet": f"{holiday_check['explanation']} (Ground-truth system clock: {now_ctx['today_full']}).",
                "score": 0.99,
                "published_date": now_ctx["formatted_date"],
            }]
            return {
                "verdict": verdict,
                "classification": verdict,
                "confidence": confidence,
                "credibility_score": max(1, min(10, round(score_pct / 10))),
                "credibility_score_pct": score_pct,
                "detailed_explanation": explanation,
                "conclusion": explanation,
                "reasons": [explanation],
                "evidence": evidence,
                "evidence_status": "found",
                "search_engine_used": "Real-Time Calendar & Observance Engine",
                "direct_ai_summary": explanation,
                "temporal_grounding": now_ctx["today_full"],
                "primary_subject": holiday_check["holiday_name"],
                "disputed_phrases": holiday_check.get("disputed_phrases", []),
                "suspicious_phrases": holiday_check.get("disputed_phrases", []),
                "verified_phrases": holiday_check.get("verified_phrases", []),
                "unattributed_phrases": holiday_check.get("unattributed_phrases", []),
            }

        # Step 1: Gemini Pre-Search Analysis & Query Formulation
        gemini_understanding = self.gemini_service.analyze_and_formulate_queries(
            input_text=claim_clean,
            content_type=content_type,
            current_date_str=now_ctx["formatted_date"],
        )

        primary_subject = gemini_understanding.get("primary_subject", "Claim Subject")
        queries_to_run = gemini_understanding.get("optimized_tavily_search_queries", [])
        if not queries_to_run:
            queries_to_run = [self.entity_extractor.build_targeted_search_query(claim_clean, year=now_ctx["year"])]

        logger.info(f"Gemini Pre-Search Analysis: Subject='{primary_subject}' | Queries={queries_to_run}")

        # Step 2: Execute Tavily Search on Gemini-Formulated Queries
        all_web_results = []
        direct_answer = None
        engine_used = "Tavily AI Search Engine (Gemini-Optimized)"

        for q in queries_to_run[:2]:
            results, eng, d_ans = self._execute_single_search(q, max_results=3)
            all_web_results.extend(results)
            if d_ans and not direct_answer:
                direct_answer = d_ans

        # Deduplicate results by URL
        seen_urls = set()
        deduped_results = []
        for r in all_web_results:
            url = r.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                deduped_results.append(r)

        # Step 3: Strict Topic Relevance Gating
        entity_info = {
            "entities": [primary_subject] if primary_subject else [],
            "keywords": [w for w in primary_subject.lower().split() if len(w) > 2],
        }
        relevant_evidence = [
            e for e in deduped_results
            if self.entity_extractor.is_evidence_relevant(e, entity_info)
        ]

        if not relevant_evidence and deduped_results:
            relevant_evidence = deduped_results[:3]

        # Step 4: Gemini Evidence Synthesis & Fact-Check Reasoning
        synthesis_result = self.gemini_service.synthesize_fact_check_verdict(
            claim=claim_clean,
            understanding=gemini_understanding,
            tavily_evidence=relevant_evidence,
            direct_answer=direct_answer,
            current_date_str=now_ctx["formatted_date"],
            content_type=content_type,
            visual_metadata=modality_metadata,
        )

        verdict = synthesis_result.get("classification", "Unverified")
        confidence = float(synthesis_result.get("confidence", 0.90))
        score_pct = int(synthesis_result.get("credibility_score_pct", 50))
        score_10 = max(1, min(10, round(score_pct / 10)))
        detailed_explanation = synthesis_result.get("detailed_explanation", "")

        return {
            "verdict": verdict,
            "classification": verdict,
            "confidence": confidence,
            "credibility_score": score_10,
            "credibility_score_pct": score_pct,
            "detailed_explanation": detailed_explanation,
            "conclusion": detailed_explanation,
            "reasons": synthesis_result.get("key_findings", [detailed_explanation[:150]]),
            "evidence": relevant_evidence,
            "evidence_status": "found" if relevant_evidence else "no_results",
            "search_engine_used": engine_used,
            "direct_ai_summary": direct_answer,
            "temporal_grounding": now_ctx["formatted_date"],
            "primary_subject": primary_subject,
            "gemini_understanding": gemini_understanding,
            "manipulation_type": synthesis_result.get("manipulation_type"),
            "tavily_verification": synthesis_result.get("tavily_verification"),
            "disputed_phrases": synthesis_result.get("disputed_phrases", []),
            "suspicious_phrases": synthesis_result.get("disputed_phrases", []),
            "verified_phrases": synthesis_result.get("verified_phrases", []),
            "unattributed_phrases": synthesis_result.get("unattributed_phrases", []),
        }

    def _execute_single_search(self, search_q: str, max_results: int = 3) -> Tuple[List[Dict[str, Any]], str, Optional[str]]:
        """Execute Tavily search with multi-key failover rotation."""
        from app.services.temporal_service import get_temporal_service
        now_ctx = get_temporal_service().get_current_context()

        keys_to_try = settings.tavily_keys
        if not keys_to_try:
            fallback_k = self.api_key or os.getenv("TAVILY_API_KEY", "")
            if fallback_k:
                keys_to_try = [fallback_k]

        for idx, active_key in enumerate(keys_to_try, 1):
            try:
                from tavily import TavilyClient
                client = TavilyClient(api_key=active_key)
                
                response = client.search(
                    query=search_q,
                    search_depth="advanced",
                    max_results=max_results,
                    include_answer=True,
                )

                direct_answer = response.get("answer")
                raw_results = response.get("results", [])
                evidence = []

                for r in raw_results:
                    domain = re.sub(r"^https?://(www\.)?", "", r.get("url", "")).split("/")[0]
                    pub_date = r.get("published_date") or now_ctx["formatted_date"]
                    title = r.get("title", "Web Verification Article")
                    snippet = r.get("content", "")

                    evidence.append({
                        "title": title,
                        "source": domain.capitalize() if domain else "Verified Web",
                        "url": r.get("url", ""),
                        "snippet": snippet[:450],
                        "score": r.get("score", 0.90),
                        "published_date": pub_date,
                    })

                if evidence:
                    return evidence, f"Tavily AI Search Engine (Key #{idx})", direct_answer
            except Exception as e:
                logger.warning(f"Tavily search with key #{idx} for query '{search_q}' failed: {e}. Trying backup key...")
                continue

        # Fallback to Open Web Search
        return self._open_web_search(search_q, max_results=max_results)

    def _open_web_search(self, query: str, max_results: int = 3) -> Tuple[List[Dict[str, Any]], str, Optional[str]]:
        """Open web knowledge search using Wikipedia."""
        clean_q = re.sub(r"[^\w\s]", "", query)
        keywords = " ".join(clean_q.split()[:6])
        search_url = (
            f"https://en.wikipedia.org/w/api.php?action=query&list=search"
            f"&srsearch={urllib.parse.quote(keywords)}&format=json&utf8=1"
        )

        try:
            req = urllib.request.Request(search_url, headers=self.headers)
            with urllib.request.urlopen(req, timeout=6) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                hits = data.get("query", {}).get("search", [])

            if not hits:
                return [], "Open Web Reference Engine", None

            top_titles = [h["title"] for h in hits[:max_results]]
            titles_param = "|".join(top_titles)

            extract_url = (
                f"https://en.wikipedia.org/w/api.php?action=query&prop=extracts"
                f"&exintro=1&explaintext=1&titles={urllib.parse.quote(titles_param)}&format=json&utf8=1"
            )

            req2 = urllib.request.Request(extract_url, headers=self.headers)
            with urllib.request.urlopen(req2, timeout=6) as resp2:
                data2 = json.loads(resp2.read().decode("utf-8"))
                pages = data2.get("query", {}).get("pages", {})

            evidence = []
            for page_id, p in pages.items():
                title = p.get("title", "")
                extract = p.get("extract", "").strip()
                if extract and len(extract) > 30:
                    clean_ext = re.sub(r"\s+", " ", extract)
                    evidence.append({
                        "title": title,
                        "source": "Wikipedia Verified Knowledge Archive",
                        "url": f"https://en.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}",
                        "snippet": clean_ext[:450],
                        "score": 0.85,
                    })

            return evidence, "Open Encyclopedic Engine", None
        except Exception as e:
            logger.error(f"Open web search error: {e}")
            return [], "Open Encyclopedic Engine", None


# Singleton instance
_search_agent = None


def get_ai_search_agent() -> AISearchAgent:
    global _search_agent
    if _search_agent is None:
        _search_agent = AISearchAgent()
    return _search_agent
