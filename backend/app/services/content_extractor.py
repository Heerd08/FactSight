"""
Content Extractor Service — Handles multi-modal inputs:
1. Plain Text Claims
2. Web Articles / URLs (Scraping & Clean Text Extraction)
3. Screenshots & Visual Assets (OCR / Image Text Parsing)
4. Forwarded Emails & Phishing Solicitations (Domain & Header Inspection)
5. Social Media Links (X / Twitter, Reddit, YouTube, Instagram)
"""

import re
import json
import urllib.request
import urllib.parse
import urllib.error
import logging
from typing import Dict, Any, Optional
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class ContentExtractor:
    """Extracts verifiable claims and metadata from various content modalities."""

    def __init__(self):
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
        }

    def process_input(
        self,
        text: Optional[str] = None,
        url: Optional[str] = None,
        content_type: str = "text",
        sender: Optional[str] = None,
        image_base64: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Process any of the 5 input modalities into a unified text claim for RAG analysis.

        Returns:
            dict containing:
                - claim_text: str (extracted text to verify)
                - metadata: dict (additional context, detected platform, spoofing flags, etc.)
                - modality: str ('text', 'url', 'image', 'email', 'social')
        """
        content_type = (content_type or "text").lower()

        is_social_url = False
        if url:
            u_low = url.lower()
            if any(dom in u_low for dom in ["instagram.com", "youtube.com", "youtu.be", "tiktok.com", "twitter.com", "x.com", "reddit.com", "facebook.com", "fb.watch"]):
                is_social_url = True

        # 1. Social Media Link (Explicit or auto-detected by domain)
        if content_type == "social" or is_social_url:
            target_url = url or (text.strip() if text else "")
            return self.extract_from_social(target_url)

        # 2. Image / Screenshot
        elif content_type == "image":
            return self.extract_from_image(text or "", image_base64=image_base64)

        # 3. Email Verification
        elif content_type == "email":
            return self.extract_from_email(text or "", sender=sender)

        # 4. URL / News Article
        elif content_type == "url" or (url and not text):
            target_url = url or text.strip()
            return self.extract_from_url(target_url)

        # 5. Copy-Paste Plain Text
        else:
            cleaned = (text or "").strip()
            return {
                "claim_text": cleaned,
                "modality": "text",
                "metadata": {"length": len(cleaned)},
            }

    def extract_from_url(self, url: str) -> Dict[str, Any]:
        """Fetch and extract article content, title, and metadata from a web URL."""
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        logger.info(f"Extracting article text from URL: {url}")
        try:
            req = urllib.request.Request(url, headers=self.headers)
            with urllib.request.urlopen(req, timeout=8) as response:
                html = response.read().decode("utf-8", errors="ignore")

            soup = BeautifulSoup(html, "html.parser")

            # Extract Title
            title = ""
            og_title = soup.find("meta", property="og:title")
            if og_title and og_title.get("content"):
                title = og_title["content"].strip()
            elif soup.title and soup.title.string:
                title = soup.title.string.strip()

            # Extract Meta Description
            description = ""
            meta_desc = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", property="og:description")
            if meta_desc and meta_desc.get("content"):
                description = meta_desc["content"].strip()

            # Extract Main Body Paragraphs
            paragraphs = [p.get_text().strip() for p in soup.find_all("p") if len(p.get_text().strip()) > 30]
            body_text = " ".join(paragraphs[:8])

            # Explicitly structured text so Gemini can analyze Headline vs Body discrepancy
            structured_claim = f"[Headline]: {title}\n[Summary]: {description}\n[Article Excerpt]: {body_text}".strip()
            if len(structured_claim) < 30:
                structured_claim = f"News report from {url} regarding: {title or 'Current Events'}."

            domain = re.sub(r"^https?://(www\.)?", "", url).split("/")[0]

            return {
                "claim_text": structured_claim[:3000],
                "modality": "url",
                "metadata": {
                    "source_url": url,
                    "title": title,
                    "description": description,
                    "domain": domain,
                    "extracted_paragraphs_count": len(paragraphs),
                },
            }
        except Exception as e:
            logger.warning(f"Failed to fetch live URL content ({url}): {e}. Using domain heuristics.")
            domain = re.sub(r"^https?://(www\.)?", "", url).split("/")[0]
            return {
                "claim_text": f"Article from {domain}: {url}",
                "modality": "url",
                "metadata": {
                    "source_url": url,
                    "domain": domain,
                    "fetch_error": str(e),
                },
            }

    def extract_from_social(self, url: str) -> Dict[str, Any]:
        """Extract viral claim context from a social media post URL using social scrapers, Tavily search, and Gemini translation."""
        url_lower = url.lower()
        platform = "Social Media"
        metadata = {"source_url": url}

        if "youtube.com" in url_lower or "youtu.be" in url_lower:
            platform = "YouTube"
        elif "instagram.com" in url_lower:
            platform = "Instagram"
        elif "tiktok.com" in url_lower:
            platform = "TikTok"
        elif "twitter.com" in url_lower or "x.com" in url_lower:
            platform = "X (Twitter)"
        elif "reddit.com" in url_lower or "redd.it" in url_lower:
            platform = "Reddit"
        elif "facebook.com" in url_lower or "fb.watch" in url_lower:
            platform = "Facebook"

        # 1. Platform-Specific High-Fidelity Extraction
        # YouTube oEmbed API (official, instantaneous)
        if platform == "YouTube":
            try:
                oembed_url = f"https://www.youtube.com/oembed?url={urllib.parse.quote(url)}&format=json"
                req = urllib.request.Request(oembed_url, headers=self.headers)
                with urllib.request.urlopen(req, timeout=5) as res:
                    oembed_data = json.loads(res.read().decode("utf-8"))
                    metadata["title"] = oembed_data.get("title")
                    metadata["author"] = oembed_data.get("author_name")
                    logger.info(f"YouTube oEmbed resolved: '{metadata.get('title')}' by {metadata.get('author')}")
            except Exception as e:
                logger.warning(f"YouTube oEmbed error: {e}")

        # Instagram / Facebook / TikTok OpenGraph with social crawler User-Agent
        if not metadata.get("title") or platform in ["Instagram", "Facebook", "TikTok"]:
            try:
                social_headers = {
                    "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                }
                req = urllib.request.Request(url, headers=social_headers)
                with urllib.request.urlopen(req, timeout=6) as res:
                    html = res.read().decode("utf-8", errors="ignore")
                    soup = BeautifulSoup(html, "html.parser")
                    og_title = soup.find("meta", property="og:title")
                    og_desc = soup.find("meta", property="og:description")
                    if og_title and og_title.get("content"):
                        metadata["title"] = og_title["content"].strip()
                    if og_desc and og_desc.get("content"):
                        metadata["description"] = og_desc["content"].strip()
                    logger.info(f"Social OpenGraph resolved for {platform}: Title='{metadata.get('title')}'")
            except Exception as e:
                logger.warning(f"Social OpenGraph scrape failed for {url}: {e}")

        # 2. Tavily Link Search on the Web for mentions and discussions
        web_snippets = []
        try:
            from app.core.config import settings
            from tavily import TavilyClient
            tavily_keys = settings.tavily_keys
            if tavily_keys:
                c = TavilyClient(api_key=tavily_keys[0])
                clean_url = url.split("?")[0]
                search_res = c.search(query=f'"{clean_url}"', search_depth="advanced", max_results=4)
                for r in search_res.get("results", []):
                    web_snippets.append({
                        "title": r.get("title", ""),
                        "snippet": r.get("content", "")[:350],
                        "url": r.get("url", "")
                    })
        except Exception as e:
            logger.warning(f"Tavily search for social link failed: {e}")

        # 3. Gemini Video/Reel Translation into Normal Text
        translated_claim = metadata.get("title") or metadata.get("description") or f"Viral content from {platform}"
        try:
            from app.services.gemini_service import get_gemini_service
            gemini_service = get_gemini_service()
            if gemini_service.is_available():
                translation_res = gemini_service.translate_social_content_to_claim(
                    url=url,
                    platform=platform,
                    metadata=metadata,
                    web_snippets=web_snippets
                )
                normal_claim = translation_res.get("normal_text_claim", "").strip()
                if normal_claim:
                    translated_claim = normal_claim
                metadata.update({
                    "video_topic": translation_res.get("video_topic", ""),
                    "creator": translation_res.get("creator", metadata.get("author", "")),
                    "summary_of_content": translation_res.get("summary_of_content", ""),
                    "gemini_verification_queries": translation_res.get("verification_queries", []),
                })
                logger.info(f"Gemini decoded {platform} video/reel into claim: '{translated_claim}'")
        except Exception as e:
            logger.warning(f"Gemini translation for social link failed: {e}")

        return {
            "claim_text": translated_claim,
            "modality": "social",
            "metadata": metadata,
        }

    def extract_from_email(self, email_text: str, sender: Optional[str] = None) -> Dict[str, Any]:
        """Inspect email content for phishing indicators, spoofed headers, and urgency tactics."""
        phishing_flags = []
        sender_risk = "Low"

        # Check sender domain anomalies
        if sender:
            sender_lower = sender.lower()
            suspicious_tlds = [".xyz", ".top", ".buzz", ".work", ".click", ".country", ".tk"]
            brand_impersonations = ["paypal", "apple", "microsoft", "amazon", "netflix", "bank", "security", "alert"]

            for brand in brand_impersonations:
                if brand in sender_lower and not sender_lower.endswith(f"@{brand}.com"):
                    phishing_flags.append(f"Potential spoofed domain pretending to be {brand.capitalize()}")
                    sender_risk = "High"

            for tld in suspicious_tlds:
                if sender_lower.endswith(tld):
                    phishing_flags.append(f"Suspicious high-risk top-level domain ({tld})")
                    sender_risk = "High"

        # Check urgency keywords in body
        urgency_patterns = [
            r"account\s+(will be\s+)?suspended",
            r"immediate\s+action\s+required",
            r"verify\s+your\s+(identity|password|wallet|funds)",
            r"unauthorized\s+transaction",
            r"click\s+the\s+link\s+below",
            r"wire\s+transfer",
            r"gift\s+card",
        ]
        for pattern in urgency_patterns:
            if re.search(pattern, email_text, re.IGNORECASE):
                phishing_flags.append(f"Urgent phishing call-to-action detected: '{pattern}'")

        combined = f"Email content from {sender or 'Unknown Sender'}: {email_text}".strip()

        return {
            "claim_text": combined[:2000],
            "modality": "email",
            "metadata": {
                "sender": sender,
                "sender_risk": sender_risk,
                "phishing_flags": phishing_flags,
            },
        }

    def extract_from_image(self, text_or_filename: str, image_base64: Optional[str] = None) -> Dict[str, Any]:
        """Process screenshot image submissions and extract claim via Gemini Multimodal Vision."""
        claim = text_or_filename.strip() if text_or_filename else "Screenshot image claim"
        metadata = {
            "has_image_data": bool(image_base64),
            "image_filename": text_or_filename,
        }

        if image_base64:
            try:
                from app.services.gemini_service import get_gemini_service
                gemini_service = get_gemini_service()
                if gemini_service.is_available():
                    ocr_res = gemini_service.extract_claim_from_image(image_base64)
                    extracted_claim = ocr_res.get("extracted_claim", "").strip()
                    if extracted_claim:
                        claim = extracted_claim
                    metadata.update({
                        "extracted_ocr_text": ocr_res.get("extracted_text", ""),
                        "detected_language": ocr_res.get("detected_language", "English"),
                        "primary_subject": ocr_res.get("primary_subject", ""),
                        "gemini_search_queries": ocr_res.get("search_queries", []),
                    })
                    logger.info(f"Successfully converted uploaded image to text claim via Gemini: '{claim}'")
            except Exception as e:
                logger.warning(f"Failed to extract claim from image via Gemini: {e}")

        return {
            "claim_text": claim,
            "modality": "image",
            "metadata": metadata,
        }


# Module singleton
_extractor = None


def get_content_extractor() -> ContentExtractor:
    """Get content extractor instance."""
    global _extractor
    if _extractor is None:
        _extractor = ContentExtractor()
    return _extractor
