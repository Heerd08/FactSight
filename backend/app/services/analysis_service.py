"""
Analysis Service — Orchestrates the Multi-Modal Pure RAG Analysis Pipeline.

Supports 6 Input Modalities:
1. Copy-Paste Plain Text
2. Web Article / URL
3. Screenshot Image / OCR
4. Browser Extension Submissions
5. Forwarded Email Verification
6. Social Media Posts (X/Twitter, Reddit, YouTube, Instagram)
"""

import json
import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.services.content_extractor import get_content_extractor
from app.services.evidence_service import get_evidence_service
from app.services.credibility_service import get_credibility_service
from app.services.manipulation_detector import get_manipulation_detector
from app.database.models import AnalysisHistory, AuditLog
from app.api.schemas.analysis import AnalyzeResponse, EvidenceItem

logger = logging.getLogger(__name__)


class AnalysisService:
    """Orchestrates the multi-modal Pure RAG analysis pipeline."""

    def __init__(self):
        self.extractor = get_content_extractor()
        self.evidence_service = get_evidence_service()
        self.credibility_service = get_credibility_service()
        self.manipulation_detector = get_manipulation_detector()
        self.model_version = "rag-chromadb-minilm-v1"

    def analyze(
        self,
        text: Optional[str] = None,
        url: Optional[str] = None,
        content_type: str = "text",
        sender: Optional[str] = None,
        image_base64: Optional[str] = None,
        db: Session = None,
        user_id: Optional[int] = None,
        client_ip: Optional[str] = None,
    ) -> AnalyzeResponse:
        """Run the multi-modal Pure RAG analysis pipeline.

        Args:
            text: Input text/claim/email body
            url: Web article URL or social media post link
            content_type: 'text', 'url', 'image', 'email', 'social', 'extension'
            sender: Sender email address (for email verification)
            image_base64: Base64 image payload (for image verification)
            db: Database session
            user_id: Optional user ID
            client_ip: Optional client IP

        Returns:
            AnalyzeResponse with all analysis results and citations.
        """
        logger.info(f"Processing input modality: {content_type}")

        # Step 1: Multi-modal content extraction and normalization
        extracted = self.extractor.process_input(
            text=text,
            url=url,
            content_type=content_type,
            sender=sender,
            image_base64=image_base64,
        )
        claim_text = extracted["claim_text"]
        modality_metadata = extracted.get("metadata", {})

        # Step 2: Linguistic manipulation & phishing detection
        manipulation_result = self.manipulation_detector.detect(claim_text)
        manipulation_indicators = manipulation_result["manipulation_indicators"]
        suspicious_phrases = manipulation_result["suspicious_phrases"]

        # Incorporate email phishing flags if present
        if "phishing_flags" in modality_metadata:
            for flag in modality_metadata["phishing_flags"]:
                if flag not in manipulation_indicators:
                    manipulation_indicators.append(flag)

        # Step 3: Query ChromaDB Vector Database (Database 2)
        search_query = claim_text[:500]
        evidence_result = self.evidence_service.retrieve_evidence(search_query)
        evidence_status = evidence_result.get("status", "not_configured")
        rag_consensus = evidence_result.get("consensus_verdict")
        rag_similarity = evidence_result.get("max_similarity", 0.0)

        evidence_items = [
            EvidenceItem(**src) for src in evidence_result.get("sources", [])
        ]

        # Step 4: Pure RAG Classification & Confidence Evaluation
        classification, confidence = self.credibility_service.evaluate_rag_classification(
            evidence_status=evidence_status,
            rag_consensus=rag_consensus,
            rag_similarity=rag_similarity,
            manipulation_indicators=manipulation_indicators,
        )

        # Step 5: Pure RAG Credibility Score Synthesis (1 to 10)
        credibility_score = self.credibility_service.compute_credibility_score(
            classification=classification,
            confidence=confidence,
            evidence_status=evidence_status,
            manipulation_indicators=manipulation_indicators,
            rag_consensus=rag_consensus,
            rag_similarity=rag_similarity,
        )

        # Step 6: Generate Evidence-Grounded Rationales
        reasons = self.credibility_service.generate_reasons(
            classification=classification,
            confidence=confidence,
            evidence_status=evidence_status,
            manipulation_indicators=manipulation_indicators,
            suspicious_phrases=suspicious_phrases,
            rag_consensus=rag_consensus,
            rag_similarity=rag_similarity,
        )

        recommendation = self.credibility_service.generate_recommendation(
            classification=classification,
            confidence=confidence,
            evidence_status=evidence_status,
        )

        # Step 7: Build structured response
        response = AnalyzeResponse(
            classification=classification,
            confidence=confidence,
            credibility_score=credibility_score,
            main_claim=claim_text if len(claim_text) < 200 else claim_text[:197] + "...",
            reasons=reasons,
            suspicious_phrases=suspicious_phrases,
            manipulation_indicators=manipulation_indicators,
            evidence=[item.model_dump() for item in evidence_items],
            evidence_status=evidence_status,
            recommendation=recommendation,
            model_version=self.model_version,
            metadata=modality_metadata,
        )

        # Step 8: Store in Database 1 (AnalysisHistory & AuditLog)
        if db:
            try:
                history = AnalysisHistory(
                    user_id=user_id,
                    input_text=claim_text,
                    classification=classification,
                    confidence=confidence,
                    credibility_score=credibility_score,
                    main_claim=response.main_claim,
                    reasons=json.dumps(reasons),
                    suspicious_phrases=json.dumps(suspicious_phrases),
                    manipulation_indicators=json.dumps(manipulation_indicators),
                    evidence=json.dumps([item.model_dump() for item in evidence_items]),
                    evidence_status=evidence_status,
                    recommendation=recommendation,
                    model_version=self.model_version,
                )
                db.add(history)
                db.commit()
                db.refresh(history)

                audit = AuditLog(
                    user_id=user_id,
                    action=f"ANALYZE_{content_type.upper()}",
                    resource_type="analysis",
                    resource_id=history.id,
                    ip_address=client_ip,
                    details=json.dumps({
                        "modality": content_type,
                        "classification": classification,
                        "credibility_score": credibility_score,
                        "evidence_count": len(evidence_items),
                        "evidence_status": evidence_status,
                        "rag_consensus": rag_consensus,
                        "rag_similarity": rag_similarity,
                    }),
                )
                db.add(audit)
                db.commit()
                logger.info(f"Analysis saved to SQL DB (id={history.id}) for modality: {content_type}")
            except Exception as e:
                logger.error(f"Failed to store analysis in SQL database: {e}")
                db.rollback()

        return response


# Module-level singleton
_analysis_service = None


def get_analysis_service() -> AnalysisService:
    """Get or create the analysis service singleton."""
    global _analysis_service
    if _analysis_service is None:
        _analysis_service = AnalysisService()
    return _analysis_service
