"""
Source Checker — Interface for checking source reliability.

For the MVP, this returns unknown reliability.
Future implementation can check against known reliable/unreliable source databases.
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


class SourceChecker:
    """Service for checking the reliability of information sources."""

    def __init__(self):
        self.is_configured = False
        # Future: load known reliable/unreliable source databases

    def check_source(self, url: str) -> dict:
        """Check the reliability of a source URL.

        Args:
            url: The URL to check.

        Returns:
            dict with keys:
                - reliability: str — "trusted", "unknown", "unreliable"
                - details: str — Human-readable explanation
                - status: str — "not_configured", "checked"
        """
        if not self.is_configured:
            return {
                "reliability": "unknown",
                "details": "Source checking is not yet configured.",
                "status": "not_configured",
            }

        # Future: Implement actual source checking
        return {
            "reliability": "unknown",
            "details": "Source checking is not yet configured.",
            "status": "not_configured",
        }


_source_checker: Optional[SourceChecker] = None


def get_source_checker() -> SourceChecker:
    """Get or create the source checker singleton."""
    global _source_checker
    if _source_checker is None:
        _source_checker = SourceChecker()
    return _source_checker
