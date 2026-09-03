"""
Manipulation Detector — Rule-based detection of manipulative language patterns.

Detects:
- Urgency language ("act now", "share immediately")
- Emotional manipulation ("shocking", "you won't believe")
- False authority ("doctors say", "scientists confirm" without citation)
- Absolutist language ("always", "never", "100%")
- Conspiracy markers ("they don't want you to know", "cover-up")

This is a simple heuristic-based system, not an ML model.
False positives are expected. Results should be treated as indicators, not proof.
"""

import re
import logging

logger = logging.getLogger(__name__)

# Pattern categories with associated phrases
URGENCY_PATTERNS = [
    r"\bact now\b",
    r"\bshare (?:this )?immediately\b",
    r"\bbefore it'?s too late\b",
    r"\burgent\b",
    r"\bbreaking\b",
    r"\bshare (?:this )?before\b",
    r"\bdon'?t wait\b",
    r"\blimited time\b",
    r"\bforward (?:this )?to everyone\b",
    r"\bspread the word\b",
]

EMOTIONAL_PATTERNS = [
    r"\bshocking\b",
    r"\byou won'?t believe\b",
    r"\bunbelievable\b",
    r"\bmind[- ]?blowing\b",
    r"\bhorrifying\b",
    r"\bterrifying\b",
    r"\bheartbreaking\b",
    r"\boutrageous\b",
    r"\binsane\b",
    r"\bwake up\b",
]

FALSE_AUTHORITY_PATTERNS = [
    r"\bdoctors (?:say|confirm|warn|reveal)\b",
    r"\bscientists (?:say|confirm|warn|reveal|discover)\b",
    r"\bexperts (?:say|confirm|warn|reveal)\b",
    r"\bstudies (?:show|prove|confirm)\b",
    r"\bresearch (?:shows|proves|confirms)\b",
]

ABSOLUTIST_PATTERNS = [
    r"\b100\s*%\b",
    r"\babsolutely\b",
    r"\bdefinitely proven\b",
    r"\bwithout a doubt\b",
    r"\bundeniable\b",
    r"\birrefutable\b",
    r"\bguaranteed\b",
]

CONSPIRACY_PATTERNS = [
    r"\bthey don'?t want you to know\b",
    r"\bcover[- ]?up\b",
    r"\bbig pharma\b",
    r"\bmainstream media (?:won'?t|doesn'?t|refuses to)\b",
    r"\bhidden truth\b",
    r"\bwhat they'?re hiding\b",
    r"\bsuppressed\b",
    r"\bcensored\b",
]

PATTERN_CATEGORIES = {
    "Urgency language": URGENCY_PATTERNS,
    "Emotional manipulation": EMOTIONAL_PATTERNS,
    "Unattributed authority claims": FALSE_AUTHORITY_PATTERNS,
    "Absolutist language": ABSOLUTIST_PATTERNS,
    "Conspiracy language": CONSPIRACY_PATTERNS,
}


class ManipulationDetector:
    """Detects manipulative language patterns in text."""

    def detect(self, text: str) -> dict:
        """Analyze text for manipulation indicators.

        Args:
            text: The text to analyze.

        Returns:
            dict with keys:
                - manipulation_indicators: list[str] — Categories of detected manipulation
                - suspicious_phrases: list[str] — Specific phrases found
                - details: dict[str, list[str]] — Category → matching phrases
        """
        text_lower = text.lower()
        indicators = []
        suspicious_phrases = []
        details = {}

        for category, patterns in PATTERN_CATEGORIES.items():
            matches = []
            for pattern in patterns:
                found = re.findall(pattern, text_lower)
                matches.extend(found)

            if matches:
                indicators.append(category)
                suspicious_phrases.extend(matches)
                details[category] = list(set(matches))

        return {
            "manipulation_indicators": indicators,
            "suspicious_phrases": list(set(suspicious_phrases)),
            "details": details,
        }


# Module-level singleton
_detector = None


def get_manipulation_detector() -> ManipulationDetector:
    """Get or create the manipulation detector singleton."""
    global _detector
    if _detector is None:
        _detector = ManipulationDetector()
    return _detector
