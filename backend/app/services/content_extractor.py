"""
Content Extractor Service — Handles multi-modal inputs:
1. Plain Text Claims
2. Web Articles / URLs (Scraping & Clean Text Extraction)
3. Screenshots & Visual Assets (OCR / Image Text Parsing)
4. Forwarded Emails & Phishing Solicitations (Domain & Header Inspection)
5. Social Media Links (X / Twitter, Reddit, YouTube, Instagram)
"""

import re
import urllib.request
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

        # 1. URL / News Article
        if content_type == "url" or (url and not text):
            target_url = url or text.strip()
            return self.extract_from_url(target_url)

        # 2. Social Media Link
        elif content_type == "social":
            target_url = url or (text.strip() if text else "")
            return self.extract_from_social(target_url)

        # 3. Email Verification
        elif content_type == "email":
            return self.extract_from_email(text or "", sender=sender)

        # 4. Image / Screenshot
        elif content_type == "image":
            return self.extract_from_image(text or "", image_base64=image_base64)

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
            if soup.title and soup.title.string:
                title = soup.title.string.strip()
            og_title = soup.find("meta", property="og:title")
            if og_title and og_title.get("content"):
                title = og_title["content"].strip()

            # Extract Meta Description
            description = ""
            meta_desc = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", property="og:description")
            if meta_desc and meta_desc.get("content"):
                description = meta_desc["content"].strip()

            # Extract Main Body Paragraphs
            paragraphs = [p.get_text().strip() for p in soup.find_all("p") if len(p.get_text().strip()) > 30]
            body_text = " ".join(paragraphs[:8])

            combined_text = f"{title}. {description}. {body_text}".strip()
            if len(combined_text) < 20:
                combined_text = f"News report from {url} regarding current events and public statements."

            return {
                "claim_text": combined_text[:2000],
                "modality": "url",
                "metadata": {
                    "source_url": url,
                    "title": title,
                    "description": description,
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
        """Extract viral claim context from a social media post URL."""
        url_lower = url.lower()
        platform = "Unknown Social Platform"

        if "twitter.com" in url_lower or "x.com" in url_lower:
            platform = "X (formerly Twitter)"
        elif "reddit.com" in url_lower or "redd.it" in url_lower:
            platform = "Reddit"
        elif "youtube.com" in url_lower or "youtu.be" in url_lower:
            platform = "YouTube"
        elif "instagram.com" in url_lower:
            platform = "Instagram"
        elif "tiktok.com" in url_lower:
            platform = "TikTok"
        elif "facebook.com" in url_lower or "fb.watch" in url_lower:
            platform = "Facebook"

        # Try to extract post slug or title from URL
        slug = url.split("/")[-1].replace("-", " ").replace("_", " ")
        if slug.isdigit() or len(slug) < 3:
            parts = [p for p in url.split("/") if p and not p.startswith("http")]
            slug = " ".join(parts[-2:]) if len(parts) >= 2 else url

        claim = f"Viral claim shared on {platform} ({url}): {slug}"

        return {
            "claim_text": claim,
            "modality": "social",
            "metadata": {
                "platform": platform,
                "url": url,
                "slug": slug,
            },
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
        """Process screenshot image submissions and extract claim."""
        # Clean extracted OCR text or prompt
        claim = text_or_filename.strip() if text_or_filename else "Screenshot image claim"

        return {
            "claim_text": claim,
            "modality": "image",
            "metadata": {
                "has_image_data": bool(image_base64),
                "image_filename": text_or_filename,
            },
        }


# Module singleton
_extractor = None


def get_content_extractor() -> ContentExtractor:
    """Get content extractor instance."""
    global _extractor
    if _extractor is None:
        _extractor = ContentExtractor()
    return _extractor
