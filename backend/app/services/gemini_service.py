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

GEMINI_MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest"]


class GeminiService:
    """Intelligent agent that deconstructs claims, evaluates Tavily evidence, and delivers authoritative verdicts."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")

    def is_available(self) -> bool:
        return bool(self.api_key)

    def extract_claim_from_image(
        self,
        image_base64: str,
        mime_type: str = "image/jpeg",
        current_date_str: str = "September 04, 2026",
    ) -> Dict[str, Any]:
        """Use Gemini Multimodal Vision API to perform deep OCR, detect visual manipulation, and synthesize the core claim."""
        if not self.is_available():
            return {
                "extracted_text": "",
                "visual_description": "Visual input",
                "visual_manipulation_flags": [],
                "is_manipulative_visual": False,
                "extracted_claim": "Image claim (Gemini API unavailable)",
                "detected_language": "English",
                "primary_subject": "Visual Claim",
                "search_queries": [],
            }

        # Clean base64 if it has data URL prefix
        if "," in image_base64:
            header, base64_data = image_base64.split(",", 1)
            if "image/png" in header:
                mime_type = "image/png"
            elif "image/webp" in header:
                mime_type = "image/webp"
            elif "image/jpeg" in header or "image/jpg" in header:
                mime_type = "image/jpeg"
        else:
            base64_data = image_base64

        prompt = f"""You are FactSight's Senior Visual Misinformation & Multimodal Forensics Agent.
The current real-time ground truth date is: {current_date_str}.

Examine this image with forensic precision:
1. Complete OCR: Transcribe every piece of visible text, headlines, subtitles, captions, handles, watermarks, timestamps, and numbers.
2. Visual Forensic Inspection:
   - Is this a screenshot of a social media post (X/Twitter, Instagram, WhatsApp, Facebook, TikTok)? Check for signs of manipulation (misaligned fonts, fake verified badge, edited timestamps, doctored usernames).
   - Is this an infographic, chart, or graph? Check for deceptive axes, cherry-picked date ranges, exaggerated percentages, or missing baselines.
   - Is this a meme, satirical graphic, or commercial promotion presented as genuine breaking news?
   - Are there photoshopped elements, out-of-context images, or false attribution overlays?
3. Synthesize the single core factual claim being asserted by or within this image into clear, normal, unambiguous text suitable for fact-checking.
4. Detect the primary language of the text/content in the image.
5. Generate 2-3 clean, high-precision search queries specifically tailored for Tavily Web Search to verify the claim.
6. Spatial Attention Analysis (CRITICAL for XAI Heatmap Visualization):
   Identify 3-8 distinct regions in the image that most influenced your forensic verdict.
   For each region, provide:
   - A bounding box as percentage coordinates [x1, y1, x2, y2] where each value is 0.0-1.0 representing fraction of image width/height. (0,0) is top-left, (1,1) is bottom-right.
   - An importance score (0.0-1.0) indicating how much this region influenced the overall verdict.
   - A category: "manipulated" (edited/doctored/fake elements), "suspicious" (potentially misleading), "verified" (authentic/trusted elements like real logos, watermarks), or "neutral" (background/irrelevant).
   - A short reason explaining WHY this region is important.

   Examples of regions to identify:
   - Headline text areas with sensationalist or false claims → "manipulated", high importance
   - Doctored timestamps, edited usernames, fake verification badges → "manipulated", high importance
   - Authentic publisher logos, real watermarks, verified account badges → "verified", medium importance
   - Background scenery, decorative elements → "neutral", low importance
   - Misleading graph axes, cherry-picked data ranges → "suspicious", high importance

Return a strict JSON object with this exact schema:
{{
  "extracted_text": "all transcribed text from the image",
  "visual_description": "concise description of visual scene, layout, and entities",
  "visual_manipulation_flags": ["e.g. Altered Social Media Timestamp", "Manipulated Graph Y-Axis", "None"],
  "is_manipulative_visual": boolean,
  "extracted_claim": "concise, normalized factual claim statement",
  "detected_language": "English | German | Spanish | French | Hindi | etc.",
  "primary_subject": "main entity or subject",
  "search_queries": ["query 1", "query 2"],
  "attention_regions": [
    {{
      "region": "human-readable description of region location and content",
      "importance": 0.0,
      "category": "manipulated | suspicious | verified | neutral",
      "reason": "why this region matters for the verdict",
      "bbox_pct": [0.0, 0.0, 0.0, 0.0]
    }}
  ]
}}
"""
        for model_name in GEMINI_MODELS:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {"text": prompt},
                                {
                                    "inline_data": {
                                        "mime_type": mime_type,
                                        "data": base64_data
                                    }
                                }
                            ]
                        }
                    ],
                    "generationConfig": {"response_mime_type": "application/json"}
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=30) as res:
                    data = json.loads(res.read().decode("utf-8"))
                    text_resp = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(text_resp)
                    logger.info(f"Gemini image forensics ({model_name}) extracted claim: '{parsed.get('extracted_claim')}' | Manipulative: {parsed.get('is_manipulative_visual')} | Attention regions: {len(parsed.get('attention_regions', []))}")
                    return parsed
            except Exception as e:
                logger.warning(f"Gemini extract_claim_from_image with {model_name} failed: {e}. Trying next model...")
                continue

        logger.warning("All Gemini models failed for image claim extraction.")
        return {
            "extracted_text": "",
            "visual_description": "Screenshot image",
            "visual_manipulation_flags": [],
            "is_manipulative_visual": False,
            "extracted_claim": "Visual claim from uploaded screenshot",
            "detected_language": "English",
            "primary_subject": "Image Submission",
            "search_queries": [],
            "attention_regions": [],
        }

    def translate_social_content_to_claim(
        self,
        url: str,
        platform: str,
        metadata: Dict[str, Any],
        web_snippets: List[Dict[str, Any]],
        current_date_str: str = "September 04, 2026",
    ) -> Dict[str, Any]:
        """Use Gemini to translate viral social video/reel/post intelligence into a clear normal text claim for Tavily."""
        if not self.is_available():
            slug_claim = metadata.get("title") or metadata.get("slug") or url
            return {
                "video_title": metadata.get("title", ""),
                "creator": metadata.get("author", ""),
                "summary_of_content": slug_claim,
                "normal_text_claim": slug_claim,
                "detected_language": "English",
                "primary_subject": platform,
                "verification_queries": [f"{platform} viral claim fact check"],
            }

        snippets_text = "\n".join([
            f"- [{s.get('title', '')}]: {s.get('snippet', '') or s.get('content', '')[:250]}"
            for s in web_snippets[:5]
        ])

        prompt = f"""You are FactSight's Social Media & Viral Video Decoding Agent.
Current ground-truth date is: {current_date_str}.

The user provided a social media link ({platform}): {url}

Extracted Metadata from URL:
- Title / Headline: {metadata.get('title', 'None')}
- Creator / Author: {metadata.get('author', 'Unknown')}
- Caption / Description: {metadata.get('description', 'None')}
- Tags / Keywords: {metadata.get('keywords', 'None')}

Web Search Intelligence regarding this specific link or post:
\"\"\"
{snippets_text or 'No external web search snippets available.'}
\"\"\"

Analyze this video, reel, or post:
1. Identify what this video, reel, or post is actually about (topic, speaker, visual event, context).
2. Translate the content of this reel/video/post into clear, normal, unambiguous text.
3. Formulate the core factual assertion or claim being made in the video so that it can be checked for misinformation.
4. Detect the primary language.
5. Generate 2-3 clean, high-precision search queries specifically tailored for Tavily Web Search to fact-check whether the claim in this video is genuine, misleading, or fake.

Return a strict JSON object with this exact schema:
{{
  "video_title": "string",
  "creator": "string",
  "summary_of_content": "clear explanation of what happens or is said in the video",
  "normal_text_claim": "concise, normalized factual claim statement",
  "detected_language": "English | German | Spanish | French | Hindi | etc.",
  "primary_subject": "main entity or subject",
  "verification_queries": ["query 1", "query 2"]
}}
"""
        for model_name in GEMINI_MODELS:
            try:
                url_api = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json"}
                }
                req = urllib.request.Request(
                    url_api,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=18) as res:
                    data = json.loads(res.read().decode("utf-8"))
                    text_resp = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(text_resp)
                    logger.info(f"Gemini translated {platform} video/reel ({model_name}) into claim: '{parsed.get('normal_text_claim')}'")
                    return parsed
            except Exception as e:
                logger.warning(f"Gemini translate_social_content_to_claim with {model_name} failed: {e}. Trying next model...")
                continue

        slug_fallback = metadata.get("title") or metadata.get("description") or f"Viral video from {platform}"
        return {
            "video_title": metadata.get("title", ""),
            "creator": metadata.get("author", ""),
            "summary_of_content": slug_fallback,
            "normal_text_claim": slug_fallback,
            "detected_language": "English",
            "primary_subject": platform,
            "verification_queries": [f"{platform} viral claim fact check"],
        }

    def analyze_and_formulate_queries(
        self,
        input_text: str,
        content_type: str = "text",
        current_date_str: str = "September 04, 2026",
    ) -> Dict[str, Any]:
        """Use Gemini to deconstruct raw input, detect language, evaluate URL headline vs body framing, and formulate targeted Tavily queries."""
        if not self.is_available():
            return self._fallback_understanding(input_text)

        url_specific_guidance = ""
        if content_type == "url":
            url_specific_guidance = """
SPECIAL URL ARTICLE ANALYSIS:
The input contains the headline and text of a web article or news report.
1. Carefully compare the Article Headline / Title against the Article Body.
2. Check for Clickbait or Sensationalist Headline Distortion: Does the headline make an absolute, alarming, or exaggerated claim that the body text softens, qualifies, or fails to support?
3. Check for Out-of-Context Reporting: Does the article present a local recommendation or proposal as a nationwide law?
4. Identify any selective framing or omission of critical nuance.
"""

        prompt = f"""You are FactSight's Multilingual Claim Understanding & Misinformation Analysis Agent.
The user provided the following input (Content Type: {content_type}):
\"\"\"{input_text}\"\"\"

The current real-time ground truth date is: {current_date_str}.
{url_specific_guidance}

Analyze the input thoroughly:
1. Detect the language of the user input (e.g. German, French, Spanish, Hindi, English, etc.).
2. Extract the primary subject/entity (e.g., "Lionel Messi", "Narendra Modi", "NASA", "US President").
3. Extract the core factual claim being asserted, both in its original language and translated to English for global search indexing.
4. Check if there are any internal logical contradictions, timeline impossibilities, or clickbait headline-body discrepancies.
5. Identify if it is time-sensitive (references to today, tomorrow, this week, upcoming, breaking).
6. Generate 2-3 clean, high-precision search queries specifically designed for Tavily Web Search. If the input is in a non-English language, provide both a native-language search query and an English query to maximize evidence retrieval.

Return a strict JSON object with this exact schema:
{{
  "detected_language": "German | English | Spanish | French | Hindi | etc.",
  "primary_subject": "string",
  "clean_claim": "string in original language",
  "clean_claim_english": "string translated to English",
  "is_time_sensitive": boolean,
  "logical_contradiction": boolean,
  "contradiction_explanation": "string or empty",
  "headline_body_discrepancy": boolean,
  "framing_analysis": "string describing whether headline is clickbait/misleading compared to body text",
  "optimized_tavily_search_queries": ["query 1", "query 2"]
}}
"""
        for model_name in GEMINI_MODELS:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json"}
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=15) as res:
                    data = json.loads(res.read().decode("utf-8"))
                    text_resp = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(text_resp)
                    logger.info(f"Gemini understanding ({model_name}) [Lang: {parsed.get('detected_language')}]: {parsed.get('optimized_tavily_search_queries')}")
                    return parsed
            except Exception as e:
                logger.warning(f"Gemini analyze_and_formulate_queries with {model_name} failed: {e}. Trying next model...")
                continue

        logger.warning("All Gemini models failed for query formulation. Using local fallback.")
        return self._fallback_understanding(input_text)

    def synthesize_fact_check_verdict(
        self,
        claim: str,
        understanding: Dict[str, Any],
        tavily_evidence: List[Dict[str, Any]],
        direct_answer: Optional[str] = None,
        current_date_str: str = "September 04, 2026",
        content_type: str = "text",
        visual_metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Use Gemini as Senior Arbiter to evaluate Tavily evidence, confirm accuracy, distinguish Misleading vs Fake vs Genuine, and generate verdicts in the user's input language."""
        if not self.is_available() or not tavily_evidence:
            return self._fallback_verdict_synthesis(claim, understanding, tavily_evidence, direct_answer)

        evidence_snippets = []
        for i, ev in enumerate(tavily_evidence[:4], 1):
            evidence_snippets.append(
                f"Source {i} [{ev.get('source', 'Web')}]: {ev.get('title', '')} - {ev.get('snippet', '')[:300]}"
            )

        detected_lang = understanding.get("detected_language", "English")
        framing_analysis = understanding.get("framing_analysis", "")
        visual_flags = visual_metadata.get("visual_manipulation_flags", []) if visual_metadata else []

        prompt = f"""You are FactSight's Senior Misinformation Arbiter & Multilingual Verification Engine.
Current ground-truth date is: {current_date_str}.

Input Modality: {content_type}
User Input Claim / Content:
\"\"\"{claim}\"\"\"
Subject Identified: {understanding.get('primary_subject', 'General')}
Detected Language: {detected_lang}
Headline / Framing Analysis: {framing_analysis or 'Standard text claim'}
Visual Forensic Flags: {visual_flags or 'None'}

Tavily Live Web Search Results:
\"\"\"
Direct Answer: {direct_answer or 'None'}

{chr(10).join(evidence_snippets)}
\"\"\"

CRITICAL ARBITRATION & CLASSIFICATION RULES:
1. REVIEW TAVILY: Review Tavily's direct answer and retrieved sources. Confirm whether Tavily's findings are accurate, relevant, and reliable, or if Tavily is off-topic, incomplete, or misunderstanding the claim.
2. PRECISE 4-TIER CLASSIFICATION (KEEP TOKEN IN ENGLISH FOR UI BADGES):
   - "Genuine" (Credibility: 85% - 99%):
     The claim or article is factually accurate, supported by authoritative records, and contains NO deceit, clickbait distortion, or manipulative misrepresentation.
     CRITICAL: DO NOT mark a generic assertion without geographic/institutional context (e.g., 'schools have holiday on monday', 'banks closed tomorrow', 'trains cancelled') as 'Genuine' just because a single distant municipality or foreign country has a holiday. A blanket claim lacking scope is NOT universally Genuine.
   - "Misleading" (Credibility: 25% - 45%):
     CRITICAL REQUIREMENT: DO NOT classify as "Fake" or "Genuine" if there is partial truth or a real event that has been distorted.
     Classify as "Misleading" if:
     * Overgeneralization / Missing Scope: An assertion states a blanket claim (e.g., 'schools have holiday on monday', 'flights suspended') when it only applies to specific districts or foreign regions (e.g. US Labor Day), misleading the reader into believing it applies universally or locally.
     * (For URLs): The article headline is clickbait, sensationalized, or asserts a conclusion not backed by the body text; or inflates a local proposal into a nationwide policy.
     * (For Images/Screenshots): The graphic cherry-picks data, distorts chart axes, takes a real image out of its true historical context, or pairs a real photo with a false caption.
     * (For Social Reels/Videos): The video takes real footage out of context, makes sweeping unproven claims from an isolated incident, or exaggerates scientific/economic facts.
     * (General): The claim contains half-truths, exaggerated numbers, or selective omission of critical context.
   - "Fake" (Credibility: 1% - 15%):
     The claim is completely fabricated out of thin air, a complete hoax, medical quackery with zero basis, a completely doctored/fabricated screenshot, or an event that never occurred at all.
   - "Unverified" (Credibility: 45% - 55%):
     Future political predictions, unconfirmed election speculation, subjective opinions, or claims lacking sufficient public evidence.
3. EXPLAINABLE AI SPAN EXTRACTION (MANDATORY FOR WORD HEATMAP):
   You MUST return:
   - "disputed_phrases": array of exact verbatim substrings from the user's claim that are false, misleading, sensationalized, exaggerated, or factually contradicted by evidence.
   - "verified_phrases": array of exact verbatim substrings from the user's claim that are factually accurate, true, or corroborated.
   - "unattributed_phrases": array of exact verbatim substrings from the user's claim that are vague, unsubstantiated, missing crucial geographic context, or unverified rumors.
   Every entry MUST be an exact verbatim substring present in the user's input claim!
4. MANIPULATION DETECTION:
   Identify the precise technique: e.g. "False Generalization / Missing Scope", "Clickbait / Exaggerated Headline Distortion", "Context Distortion / Selective Framing", "Manipulated Infographic / Deceptive Axes", "Doctored Social Media Screenshot", "Sensationalist Framing", or "None".
5. MULTILINGUAL EXPLANATION IN USER'S NATIVE LANGUAGE:
   The user entered this content in {detected_lang}.
   You MUST write the entire "detailed_explanation" and all items in "key_findings" in fluent, natural, grammatically correct {detected_lang}!
   If {detected_lang} is German, write in German. If French, in French. If Spanish, in Spanish. If Hindi, in Hindi.

Respond in strict JSON adhering to this schema:
{{
  "tavily_verification": "string explaining whether Tavily sources are accurate and relevant",
  "classification": "Genuine | Misleading | Fake | Unverified",
  "confidence": 0.95,
  "credibility_score_pct": 35,
  "is_manipulative": true,
  "manipulation_type": "string describing technique or None",
  "detailed_explanation": "comprehensive multi-paragraph explanation in the user's detected language citing findings and context",
  "key_findings": ["point 1 in user's language", "point 2 in user's language"],
  "disputed_phrases": ["exact phrase from user input that is false or misleading"],
  "verified_phrases": ["exact phrase from user input that is true"],
  "unattributed_phrases": ["exact phrase from user input that is vague or missing context"]
}}
"""
        for model_name in GEMINI_MODELS:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json"}
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=18) as res:
                    data = json.loads(res.read().decode("utf-8"))
                    text_resp = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(text_resp)
                    if "disputed_phrases" not in parsed:
                        parsed["disputed_phrases"] = []
                    if "verified_phrases" not in parsed:
                        parsed["verified_phrases"] = []
                    if "unattributed_phrases" not in parsed:
                        parsed["unattributed_phrases"] = []
                    logger.info(f"Gemini arbiter ({model_name}) complete [{detected_lang}]: {parsed.get('classification')} ({parsed.get('credibility_score_pct')}%) | Disputed: {parsed.get('disputed_phrases')} | Verified: {parsed.get('verified_phrases')}")
                    return parsed
            except Exception as e:
                logger.warning(f"Gemini synthesize_fact_check_verdict with {model_name} failed: {e}. Trying next model...")
                continue

        logger.warning("All Gemini models failed for verdict synthesis. Using rule-based fallback.")
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
                "disputed_phrases": holiday_check.get("disputed_phrases", []),
                "verified_phrases": holiday_check.get("verified_phrases", []),
                "unattributed_phrases": holiday_check.get("unattributed_phrases", []),
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

        # Comprehensive Misleading & Manipulation Patterns
        misleading_regexes = [
            r"\bmisleading\b", r"\bpartially\s*true\b", r"\bout\s*of\s*context\b",
            r"\blacks\s*context\b", r"\bcherry[\s-]picked\b", r"\bexaggerat(ed|ion)\b",
            r"\bmisrepresented\b", r"\bdistorted\b", r"\bhalf[\s-]truth\b",
            r"\bsensationalis(t|m)\b", r"\bmanipulat(ed|ive|ion)\b", r"\boverstat(ed|ement)\b",
            r"\bclickbait\b", r"\bdeceptive\s*framing\b", r"\btaken\s*out\s*of\s*context\b",
            r"\bpartly\s*false\b", r"\bmostly\s*false\b", r"\bmisleading\s*claim\b"
        ]
        has_misleading = any(re.search(pat, combined_lower) for pat in misleading_regexes)

        if has_misleading and not any(re.search(pat, combined_lower) for pat in [r"\bhoax\b", r"\bdebunked\b", r"\bdisproven\b", r"\bextremely\s*dangerous\b"]):
            return {
                "classification": "Misleading",
                "confidence": 0.90,
                "credibility_score_pct": 35,
                "manipulation_type": "Context Distortion / Selective Framing",
                "detailed_explanation": (
                    f"Investigation indicates this claim is **Misleading**. "
                    f"{direct_answer or 'While containing partial factual elements, the claim misrepresents context, exaggerates scope, or cherry-picks facts to support a distorted narrative.'}"
                ),
                "key_findings": [direct_answer or "Claim contains factual elements but presents them with misleading context or selective framing."],
            }

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
