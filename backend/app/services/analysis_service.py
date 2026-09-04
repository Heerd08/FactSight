"""
Analysis Service — Multi-Modal Verification Orchestration Engine.

Orchestrates the 6-modality pipeline:
1. Multi-modal Extraction (Text, URL scraping, OCR, Email parsing, Social extraction)
2. Linguistic manipulation & phishing detection
3. Multi-tier Hybrid Evidence Retrieval (ChromaDB + Tavily AI Search)
4. Continuous multi-factor Credibility & Confidence calculation
5. Database 1 audit logging & history storage
"""

import logging
from typing import Optional
from sqlalchemy.orm import Session

from app.api.schemas.analysis import AnalyzeResponse, EvidenceItem
from app.services.content_extractor import get_content_extractor
from app.services.evidence_service import get_evidence_service
from app.services.credibility_service import get_credibility_service
from app.services.manipulation_detector import get_manipulation_detector
from app.database.models import AnalysisHistory, AuditLog
from app.core.config import settings

logger = logging.getLogger(__name__)


class AnalysisService:
    """Orchestrates the verification pipeline across all 6 input modalities."""

    def __init__(self):
        self.extractor = get_content_extractor()
        self.evidence_service = get_evidence_service()
        self.credibility_service = get_credibility_service()
        self.manipulation_detector = get_manipulation_detector()
        self.model_version = settings.MODEL_VERSION

    def analyze(
        self,
        text: Optional[str] = None,
        url: Optional[str] = None,
        content_type: str = "text",
        sender: Optional[str] = None,
        image_base64: Optional[str] = None,
        db: Optional[Session] = None,
        user_id: Optional[int] = None,
        client_ip: Optional[str] = None,
    ) -> AnalyzeResponse:
        """Execute verification across any modality.

        Args:
            text: Plain text input / claim / email body
            url: Article or social media URL
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

        # Step 3: Query Multi-tier Knowledge Base (Gemini Pre-Analysis + Tavily Live Search)
        evidence_result = self.evidence_service.retrieve_evidence(
            claim_text,
            content_type=content_type,
            modality_metadata=modality_metadata,
        )
        evidence_status = evidence_result.get("status", "not_configured")
        rag_consensus = evidence_result.get("consensus_verdict")
        rag_similarity = evidence_result.get("max_similarity", 0.0)
        raw_sources = evidence_result.get("sources", [])

        evidence_items = [
            EvidenceItem(**src) for src in raw_sources
        ]

        if evidence_result.get("detailed_explanation") and evidence_result.get("credibility_score_pct") is not None:
            classification = evidence_result["classification"]
            confidence = float(evidence_result["confidence"])
            credibility_score_pct = int(evidence_result["credibility_score_pct"])
            credibility_score = max(1, min(10, round(credibility_score_pct / 10.0)))
            detailed_explanation = evidence_result["detailed_explanation"]

            # Incorporate Gemini detected manipulation technique
            gemini_manip = evidence_result.get("manipulation_type")
            if gemini_manip and gemini_manip.lower() not in ["none", "n/a"]:
                if gemini_manip not in manipulation_indicators:
                    manipulation_indicators.append(gemini_manip)

            # Incorporate visual manipulation flags if present from image extraction
            if "visual_manipulation_flags" in modality_metadata:
                for v_flag in modality_metadata["visual_manipulation_flags"]:
                    if v_flag and v_flag.lower() not in ["none", "n/a"] and v_flag not in manipulation_indicators:
                        manipulation_indicators.append(v_flag)
        else:
            classification, confidence = self.credibility_service.evaluate_rag_classification(
                evidence_status=evidence_status,
                rag_consensus=rag_consensus,
                rag_similarity=rag_similarity,
                manipulation_indicators=manipulation_indicators,
                claim_text=claim_text,
                evidence_sources=raw_sources,
            )
            credibility_score_pct = self.credibility_service.compute_credibility_percentage(
                classification=classification,
                confidence=confidence,
                evidence_status=evidence_status,
                manipulation_indicators=manipulation_indicators,
                rag_consensus=rag_consensus,
                rag_similarity=rag_similarity,
                claim_text=claim_text,
                evidence_sources=raw_sources,
            )
            credibility_score = max(1, min(10, round(credibility_score_pct / 10.0)))
            detailed_explanation = self.credibility_service.generate_detailed_synthesis(
                classification=classification,
                confidence=confidence,
                claim_text=claim_text,
                evidence_sources=raw_sources,
                direct_answer=evidence_result.get("direct_answer") or evidence_result.get("conclusion"),
            )

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
            credibility_score_pct=credibility_score_pct,
            detailed_explanation=detailed_explanation,
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

        # Step 8: Persist to Database 1 (Application DB)
        if db is not None:
            try:
                import json
                history_record = AnalysisHistory(
                    user_id=user_id,
                    input_text=claim_text,
                    classification=classification,
                    confidence=confidence,
                    credibility_score=credibility_score,
                    main_claim=claim_text[:200],
                    reasons=json.dumps(reasons),
                    suspicious_phrases=json.dumps(suspicious_phrases),
                    manipulation_indicators=json.dumps(manipulation_indicators),
                    evidence=json.dumps([item.model_dump() for item in evidence_items]),
                    evidence_status=evidence_status,
                    recommendation=recommendation,
                    model_version=self.model_version,
                )
                db.add(history_record)
                db.flush()

                audit_log = AuditLog(
                    user_id=user_id,
                    action=f"analyze_{content_type}",
                    resource_type="analysis",
                    resource_id=history_record.id,
                    ip_address=client_ip,
                    details=f'{{"classification": "{classification}", "confidence": {confidence:.2f}, "score": {credibility_score_pct}}}',
                )
                db.add(audit_log)
                db.commit()
                logger.info(f"Analysis saved to SQL DB (id={history_record.id}) for modality: {content_type}")
            except Exception as e:
                logger.error(f"Failed to save analysis to Database 1: {e}", exc_info=True)
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
