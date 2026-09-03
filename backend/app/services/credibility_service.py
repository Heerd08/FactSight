"""
Credibility Service — Pure RAG Credibility Assessment & Reasoning Engine.

In a Pure RAG architecture:
1. Classification is determined from semantic similarity and consensus of retrieved facts in Vector DB.
2. Confidence reflects vector embedding cosine similarity distances.
3. Credibility score (1-10) is derived from factual consensus, evidence quality, and linguistic manipulation markers.
4. Explanations cite authoritative fact-checks and primary sources directly from the knowledge base.
"""

import logging

logger = logging.getLogger(__name__)


class CredibilityService:
    """Evaluates credibility and generates transparent rationales purely from RAG retrieval."""

    def evaluate_rag_classification(
        self,
        evidence_status: str,
        rag_consensus: str | None,
        rag_similarity: float,
        manipulation_indicators: list[str] | None = None,
    ) -> tuple[str, float]:
        """Determine classification label and confidence score purely from RAG Vector DB evidence.

        Args:
            evidence_status: Status ('found', 'no_results', 'not_configured')
            rag_consensus: Fact-check consensus ('True', 'False', 'Mixed', None)
            rag_similarity: Maximum cosine similarity (0.0 to 1.0)
            manipulation_indicators: List of detected manipulation patterns

        Returns:
            tuple[str, float]: (classification, confidence)
        """
        if manipulation_indicators is None:
            manipulation_indicators = []

        # Strong semantic match in Vector Knowledge Base (>= 60% similarity)
        if evidence_status == "found" and rag_similarity >= 0.60:
            confidence = min(0.98, max(0.70, rag_similarity + 0.10))
            if rag_consensus == "True":
                return "Genuine", confidence
            elif rag_consensus == "False":
                return "Fake", confidence
            elif rag_consensus == "Mixed":
                return "Misleading", confidence
            else:
                return "Unverified", 0.60

        # Moderate semantic match (45% - 60% similarity)
        elif evidence_status == "found" and rag_similarity >= 0.45:
            confidence = min(0.75, max(0.55, rag_similarity))
            if rag_consensus == "False":
                return "Fake", confidence
            elif rag_consensus == "True":
                return "Genuine", confidence
            else:
                return "Misleading", confidence

        # Low or no match in Vector Knowledge Base (< 45% similarity)
        else:
            if len(manipulation_indicators) >= 2:
                return "Misleading", 0.65
            elif len(manipulation_indicators) == 1:
                return "Unverified", 0.55
            else:
                return "Unverified", 0.50

    def compute_credibility_score(
        self,
        classification: str,
        confidence: float,
        evidence_status: str = "not_configured",
        manipulation_indicators: list[str] | None = None,
        rag_consensus: str | None = None,
        rag_similarity: float = 0.0,
    ) -> int:
        """Compute a credibility score from 1 (least credible) to 10 (most credible).

        Args:
            classification: RAG evaluated label
            confidence: Confidence score (0.0 - 1.0)
            evidence_status: 'found', 'no_results', or 'not_configured'
            manipulation_indicators: Detected manipulation markers
            rag_consensus: 'True', 'False', 'Mixed', or None
            rag_similarity: Max similarity score (0.0 - 1.0)

        Returns:
            int: Credibility score from 1 to 10
        """
        if manipulation_indicators is None:
            manipulation_indicators = []

        # Base score from RAG classification
        base_scores = {
            "Genuine": 8.5,
            "Misleading": 4.5,
            "Fake": 1.5,
            "Unverified": 5.0,
        }
        score = base_scores.get(classification, 5.0)

        # RAG Evidence Strength Adjustment
        if evidence_status == "found" and rag_similarity >= 0.50:
            if rag_consensus == "True":
                score = min(10.0, score + (rag_similarity * 1.5))
            elif rag_consensus == "False":
                score = max(1.0, score - (rag_similarity * 1.5))
            elif rag_consensus == "Mixed":
                score = 4.0

        # Manipulation Penalty
        if manipulation_indicators:
            penalty = min(len(manipulation_indicators) * 0.75, 2.5)
            score -= penalty

        return max(1, min(10, round(score)))

    def generate_reasons(
        self,
        classification: str,
        confidence: float,
        evidence_status: str = "not_configured",
        manipulation_indicators: list[str] | None = None,
        suspicious_phrases: list[str] | None = None,
        rag_consensus: str | None = None,
        rag_similarity: float = 0.0,
    ) -> list[str]:
        """Generate transparent, evidence-grounded rationales."""
        if manipulation_indicators is None:
            manipulation_indicators = []
        if suspicious_phrases is None:
            suspicious_phrases = []

        reasons = []

        # RAG Evidence status & consensus
        if evidence_status == "found":
            if rag_consensus == "False":
                reasons.append(
                    f"Vector Database RAG retrieval matched verified fact-checks refuting this claim ({rag_similarity:.0%} semantic alignment)."
                )
            elif rag_consensus == "True":
                reasons.append(
                    f"Vector Database RAG retrieval found authoritative fact-checks confirming this claim ({rag_similarity:.0%} semantic alignment)."
                )
            elif rag_consensus == "Mixed":
                reasons.append(
                    f"Vector Database RAG retrieval found mixed or disputed reporting ({rag_similarity:.0%} semantic alignment)."
                )
            else:
                reasons.append(
                    f"Vector Database RAG retrieval matched relevant knowledge records ({rag_similarity:.0%} semantic alignment)."
                )
        elif evidence_status == "no_results":
            reasons.append("No directly matching fact-check records were found in the vector knowledge base for this specific claim.")
        elif evidence_status == "not_configured":
            reasons.append("Vector database search is not configured.")

        # Classification & Confidence
        if classification == "Genuine":
            reasons.append(f"Content is classified as Genuine with {confidence:.0%} confidence based on corroborated evidence.")
        elif classification == "Fake":
            reasons.append(f"Content is classified as Fake with {confidence:.0%} confidence due to direct factual contradiction in verified records.")
        elif classification == "Misleading":
            reasons.append(f"Content is classified as Misleading ({confidence:.0%} confidence) due to partial evidence alignment or manipulative framing.")
        else:
            reasons.append(f"Content is currently Unverified ({confidence:.0%} confidence). Additional ground-truth data recommended.")

        # Manipulation indicators
        if manipulation_indicators:
            indicator_text = ", ".join(manipulation_indicators[:3])
            reasons.append(f"Linguistic manipulation patterns flagged: {indicator_text}.")

        # Suspicious phrases
        if suspicious_phrases:
            phrase_text = ", ".join(f'"{p}"' for p in suspicious_phrases[:3])
            reasons.append(f"Sensationalist phrases identified: {phrase_text}.")

        return reasons

    def generate_recommendation(
        self,
        classification: str,
        confidence: float,
        evidence_status: str = "not_configured",
    ) -> str:
        """Generate actionable user guidance based on RAG findings."""
        if classification == "Genuine":
            return (
                "The claim is corroborated by verified records in the knowledge base. "
                "Always verify primary sources for real-time updates."
            )
        elif classification == "Fake":
            return (
                "This claim is directly refuted by verified fact-checks in the knowledge base. "
                "Avoid disseminating this content."
            )
        elif classification == "Misleading":
            return (
                "This content may contain selective framing or omitted context. "
                "Cross-check with multiple independent primary sources before sharing."
            )
        else:
            return (
                "No conclusive fact-check match was found in the vector database. "
                "Exercise caution and consult official archives or primary documentation."
            )


# Module-level singleton
_credibility_service = None


def get_credibility_service() -> CredibilityService:
    """Get or create the credibility service singleton."""
    global _credibility_service
    if _credibility_service is None:
        _credibility_service = CredibilityService()
    return _credibility_service
