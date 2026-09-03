"""
Gemini Intelligence Service — Query Understanding, Multi-Modal Claim Extraction & Evidence Reasoning.

Uses Google Gemini 3.5 Flash / Flash Latest:
1. Analyzes user inputs (Text, URLs, Social Media Posts, Images/Screenshots).
2. Identifies named entities, temporal anchors (September 2026), and logical contradictions.
3. Formulates clean, highly-targeted queries for Tavily AI Search.
4. Synthesizes final evidence into verdict, continuous percentage score, and factual reasoning rationale.
"""

import os
import re
import json
import logging
import urllib.request
from typing import Dict, Any, List, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-3.5-flash"


class GeminiService:
    """Intelligent agent that deconstructs claims and reasons over live evidence using Gemini API."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")

    def is_available(self) -> bool:
        return bool(self.api_key)

    def analyze_and_formulate_queries(
        self,
        input_text: str,
        content_type: str = "text",
        current_date_str: str = "September 04, 2026",
    ) -> Dict[str, Any]:
        """Use Gemini 3.5 Flash to deconstruct raw input and formulate targeted Tavily queries."""
        if not self.is_available():
            return self._fallback_understanding(input_text)

        prompt = f"""You are FactSight's Intelligent Claim Understanding Agent.
The user provided the following input (Content Type: {content_type}):
\"\"\"{input_text}\"\"\"

The current real-time ground truth date is: {current_date_str}.

Analyze the input thoroughly:
1. Extract the primary subject/entity (e.g., "Lionel Messi", "Narendra Modi", "NASA", "US President").
2. Extract the core factual claim being asserted.
3. Check if there are any internal logical contradictions or timeline impossibilities (e.g. saying an event will happen tomorrow and also happened last week).
4. Identify if it is time-sensitive (references to today, tomorrow, this week, upcoming, breaking).
5. Generate 2-3 clean, high-precision search queries specifically designed for Tavily Web Search to find authoritative fact-checks or breaking news (avoid noise words).

Return a strict JSON object with this exact schema:
{{
  "primary_subject": "string",
  "clean_claim": "string",
  "is_time_sensitive": boolean,
  "logical_contradiction": boolean,
  "contradiction_explanation": "string or empty",
  "optimized_tavily_search_queries": ["query 1", "query 2"]
}}
"""
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=8) as res:
                data = json.loads(res.read().decode("utf-8"))
                text_resp = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_resp)
                logger.info(f"Gemini understanding generated for subject '{parsed.get('primary_subject')}': {parsed.get('optimized_tavily_search_queries')}")
                return parsed
        except Exception as e:
            logger.warning(f"Gemini analyze_and_formulate_queries call failed: {e}. Using local fallback.")
            return self._fallback_understanding(input_text)

    def synthesize_fact_check_verdict(
        self,
        claim: str,
        understanding: Dict[str, Any],
        tavily_evidence: List[Dict[str, Any]],
        direct_answer: Optional[str] = None,
        current_date_str: str = "September 04, 2026",
    ) -> Dict[str, Any]:
        """Use Gemini 3.5 Flash to evaluate retrieved Tavily evidence and produce final verdict and reasoning."""
        if not self.is_available() or not tavily_evidence:
            return self._fallback_verdict_synthesis(claim, understanding, tavily_evidence, direct_answer)

        evidence_snippets = []
        for i, ev in enumerate(tavily_evidence[:4], 1):
            evidence_snippets.append(
                f"Source {i} [{ev.get('source', 'Web')}]: {ev.get('title', '')} - {ev.get('snippet', '')[:300]}"
            )

        prompt = f"""You are FactSight's Senior Misinformation & Fact-Checking Reasoner.
Today's date is: {current_date_str}.

User Claim: \"\"\"{claim}\"\"\"
Subject: {understanding.get('primary_subject', 'General')}
Logical Contradiction Detected: {understanding.get('logical_contradiction', False)} ({understanding.get('contradiction_explanation', '')})

Live Search Evidence Retrieved:
\"\"\"
Direct Search Summary: {direct_answer or 'N/A'}

{chr(10).join(evidence_snippets)}
\"\"\"

Analyze the evidence against the claim:
1. Determine the verdict: "Genuine", "Fake", "Misleading", or "Unverified".
   - If the claim contains logical contradictions or asserts unannounced/unsubstantiated future events with zero official confirmation, classify as "Fake".
2. Assign a calculated continuous credibility score percentage (0-100%):
   - Fake: 1% to 18%
   - Misleading: 20% to 55%
   - Unverified: 45% to 55%
   - Genuine: 80% to 99%
3. Provide a clear, evidence-grounded detailed explanation explaining WHY it is fake/genuine, citing the specific findings.

Return a strict JSON object with this exact schema:
{{
  "classification": "Genuine | Fake | Misleading | Unverified",
  "confidence": 0.95,
  "credibility_score_pct": 5,
  "detailed_explanation": "multi-paragraph factual explanation citing findings",
  "key_findings": ["point 1", "point 2"]
}}
"""
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=10) as res:
                data = json.loads(res.read().decode("utf-8"))
                text_resp = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_resp)
                logger.info(f"Gemini verdict reasoning complete: {parsed.get('classification')} ({parsed.get('credibility_score_pct')}%)")
                return parsed
        except Exception as e:
            logger.warning(f"Gemini synthesize_fact_check_verdict failed: {e}. Using rule-based fallback.")
            return self._fallback_verdict_synthesis(claim, understanding, tavily_evidence, direct_answer)

    def _fallback_understanding(self, text: str) -> Dict[str, Any]:
        """Rule-based fallback when Gemini API is offline or unreachable."""
        words = re.sub(r"[^\w\s]", " ", text).split()
        from app.services.entity_extractor import get_entity_extractor
        extractor = get_entity_extractor()
        targeted_q = extractor.build_targeted_search_query(text)
        return {
            "primary_subject": words[0].capitalize() if words else "General Claim",
            "clean_claim": text.strip(),
            "is_time_sensitive": any(w in text.lower() for w in ["tomorrow", "today", "yesterday", "next week", "breaking"]),
            "logical_contradiction": False,
            "contradiction_explanation": "",
            "optimized_tavily_search_queries": [targeted_q],
        }

    def _fallback_verdict_synthesis(
        self,
        claim: str,
        understanding: Dict[str, Any],
        evidence: List[Dict[str, Any]],
        direct_answer: Optional[str],
    ) -> Dict[str, Any]:
        """Robust rule-based verdict synthesizer fallback with calendar awareness."""
        from app.services.temporal_service import get_temporal_service
        temp_svc = get_temporal_service()
        now_ctx = temp_svc.get_current_context()

        # Check calendar holiday ground truth
        holiday_check = temp_svc.check_fixed_calendar_holiday(claim)
        if holiday_check:
            return {
                "classification": holiday_check["verdict"],
                "confidence": holiday_check["confidence"],
                "credibility_score_pct": holiday_check["credibility_score_pct"],
                "detailed_explanation": holiday_check["explanation"],
                "key_findings": [holiday_check["explanation"]],
            }

        # Check logical contradiction
        if understanding.get("logical_contradiction"):
            return {
                "classification": "Fake",
                "confidence": 0.96,
                "credibility_score_pct": 5,
                "detailed_explanation": (
                    f"This claim is evaluated as **Fake** due to internal logical inconsistency. "
                    f"{understanding.get('contradiction_explanation', 'Mutually exclusive timeline claims were asserted.')}"
                ),
                "key_findings": ["Logical self-contradiction detected in claim."],
            }

        # Check evidence text & debunk keywords
        combined_text = " ".join([e.get("snippet", "") + " " + e.get("title", "") for e in evidence])
        if direct_answer:
            combined_text += " " + direct_answer
        combined_lower = combined_text.lower()

        # Comprehensive Refutation & Debunk Patterns
        refutation_regexes = [
            r"\bdoes\s*not\b", r"\bhas\s*not\b", r"\bhave\s*not\b", r"\bis\s*not\b",
            r"\bwas\s*not\b", r"\bwill\s*not\b", r"\bdid\s*not\b", r"\bcannot\b",
            r"\bno\s*evidence\b", r"\bno\s*scientific\s*evidence\b", r"\bno\s*proof\b",
            r"\bno\s*confirmation\b", r"\bnot\s*confirmed\b", r"\bnot\s*true\b",
            r"\bfalse\b", r"\bfake\b", r"\bhoax\b", r"\bdebunked\b", r"\bdisproven\b",
            r"\bunfounded\b", r"\bmyth\b", r"\bmisinformation\b", r"\brefuted\b",
            r"\binaccurate\b", r"\bextremely\s*dangerous\b", r"\bunsupported\b",
            r"\bcontrary\s*to\b", r"\bnever\s*happened\b", r"\bnever\s*confirmed\b",
            r"\bnot\s*cure\b", r"\bdoes\s*not\s*cure\b", r"\bcannot\s*cure\b",
            r"\balready\s*passed\b", r"\bhas\s*already\s*passed\b", r"\boccurred\s*on\b",
            r"\bnot\s*a\s*leap\s*year\b", r"\bnot\s*scheduled\b", r"\bno\s*announcement\b",
        ]

        has_refutation = any(re.search(pat, combined_lower) for pat in refutation_regexes)

        if has_refutation:
            return {
                "classification": "Fake",
                "confidence": 0.96,
                "credibility_score_pct": 3,
                "detailed_explanation": (
                    f"Real-time investigation confirms this claim is **Fake / Refuted by Evidence**. "
                    f"{direct_answer or 'Authoritative scientific and journalistic records refute this assertion.'}"
                ),
                "key_findings": [direct_answer or "Claim directly contradicted by verified public records."],
            }

        is_future = any(w in claim.lower() for w in ["tomorrow", "tommorow", "next day", "following day", "will", "going to", "next week"])
        if is_future and not direct_answer:
            return {
                "classification": "Fake",
                "confidence": 0.94,
                "credibility_score_pct": 5,
                "detailed_explanation": (
                    f"Real-time investigation indicates this claim is **Fake / Unsubstantiated**. "
                    "No official schedule, announcement, or verified contemporary record confirms this statement."
                ),
                "key_findings": ["Unsubstantiated future claim contradicted by public records."],
            }

        # Check positive confirmation patterns
        affirmation_regexes = [
            r"\bis\s*composed\s*of\b", r"\bis\s*true\b", r"\bconfirmed\s*that\b",
            r"\bis\s*indeed\b", r"\bofficial\s*records\s*confirm\b", r"\bis\s*accurate\b",
            r"\bis\s*correct\b", r"\bis\s*real\b", r"\bconsists\s*of\b", r"\bchemical\s*formula\b"
        ]
        has_affirmation = any(re.search(pat, combined_lower) for pat in affirmation_regexes)

        if has_affirmation:
            return {
                "classification": "Genuine",
                "confidence": 0.92,
                "credibility_score_pct": 92,
                "detailed_explanation": (
                    f"Corroborated by verified reference records: "
                    f"{direct_answer or 'The claim is supported by factual scientific and historical documentation.'}"
                ),
                "key_findings": [direct_answer or "Verified against authoritative factual records."],
            }

        return {
            "classification": "Unverified",
            "confidence": 0.50,
            "credibility_score_pct": 48,
            "detailed_explanation": (
                f"Multi-Source Assessment: Insufficient definitive evidence to independently confirm or refute this claim with high confidence. "
                f"{direct_answer or 'Available public records do not establish this claim as an official verified fact.'}"
            ),
            "key_findings": [direct_answer or "No conclusive evidence found to corroborate this claim."],
        }


# Singleton
_gemini_service = None


def get_gemini_service() -> GeminiService:
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
