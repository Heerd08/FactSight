"""
Text Cleaner — Basic text preprocessing for misinformation detection.

Operations:
- Whitespace normalization
- URL removal (optional)
- Special character handling
- Empty text detection

Designed to be lightweight and not destroy signal that the model might use.
"""

import re
import logging

logger = logging.getLogger(__name__)


def clean_text(text: str, remove_urls: bool = False) -> str:
    """Clean and normalize text for model input.

    Args:
        text: Raw input text.
        remove_urls: Whether to remove URLs from the text.

    Returns:
        Cleaned text string.
    """
    if not text or not text.strip():
        return ""

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()

    # Remove URLs if requested
    if remove_urls:
        text = re.sub(r"https?://\S+", "", text)
        text = re.sub(r"www\.\S+", "", text)

    # Normalize quotes
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    text = text.replace("\u2018", "'").replace("\u2019", "'")

    # Remove excessive punctuation (e.g., "!!!!" → "!")
    text = re.sub(r"([!?.]){3,}", r"\1", text)

    # Final whitespace cleanup
    text = re.sub(r"\s+", " ", text).strip()

    return text


def batch_clean(texts: list[str], remove_urls: bool = False) -> list[str]:
    """Clean a batch of texts.

    Args:
        texts: List of raw text strings.
        remove_urls: Whether to remove URLs.

    Returns:
        List of cleaned text strings.
    """
    return [clean_text(t, remove_urls=remove_urls) for t in texts]
