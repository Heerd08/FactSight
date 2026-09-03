"""
Tests for model loading and inference.
"""

import pytest

from app.services.model_service import ModelService
from app.services.credibility_service import CredibilityService
from app.services.manipulation_detector import ManipulationDetector


class TestModelService:
    """Tests for the ML model service."""

    def test_singleton_instance(self):
        """ModelService should return the same instance."""
        service1 = ModelService.get_instance()
        service2 = ModelService.get_instance()
        assert service1 is service2

    def test_model_version(self):
        """Model version should be set."""
        service = ModelService.get_instance()
        assert service.model_version is not None
        assert len(service.model_version) > 0

    def test_predict_returns_required_fields(self):
        """Prediction should return classification, confidence, and model_version."""
        service = ModelService.get_instance()
        if not service.is_ready():
            pytest.skip("Model not loaded")

        result = service.predict("Test claim for prediction.")
        assert "classification" in result
        assert "confidence" in result
        assert "model_version" in result
        assert "all_probabilities" in result

    def test_predict_confidence_range(self):
        """Confidence should be between 0 and 1."""
        service = ModelService.get_instance()
        if not service.is_ready():
            pytest.skip("Model not loaded")

        result = service.predict("Test claim.")
        assert 0.0 <= result["confidence"] <= 1.0

    def test_predict_valid_classification(self):
        """Classification should be one of the valid labels."""
        service = ModelService.get_instance()
        if not service.is_ready():
            pytest.skip("Model not loaded")

        result = service.predict("Test claim.")
        valid_labels = ["Genuine", "Misleading", "Fake", "Unverified"]
        assert result["classification"] in valid_labels


class TestCredibilityService:
    """Tests for the credibility scoring service."""

    def setup_method(self):
        self.service = CredibilityService()

    def test_credibility_score_range(self):
        """Credibility score should be between 1 and 10."""
        score = self.service.compute_credibility_score("Genuine", 0.9)
        assert 1 <= score <= 10

        score = self.service.compute_credibility_score("Fake", 0.9)
        assert 1 <= score <= 10

        score = self.service.compute_credibility_score("Unverified", 0.3)
        assert 1 <= score <= 10

    def test_genuine_high_confidence_scores_high(self):
        """Genuine with high confidence should score high."""
        score = self.service.compute_credibility_score("Genuine", 0.95)
        assert score >= 7

    def test_fake_high_confidence_scores_low(self):
        """Fake with high confidence should score low."""
        score = self.service.compute_credibility_score("Fake", 0.95)
        assert score <= 3

    def test_reasons_are_generated(self):
        """Reasons should be generated for any classification."""
        reasons = self.service.generate_reasons("Genuine", 0.8)
        assert len(reasons) >= 2  # At least classification + confidence reasons

    def test_recommendation_not_empty(self):
        """Recommendation should not be empty."""
        rec = self.service.generate_recommendation("Fake", 0.9)
        assert len(rec) > 0


class TestManipulationDetector:
    """Tests for the manipulation detection service."""

    def setup_method(self):
        self.detector = ManipulationDetector()

    def test_detects_urgency(self):
        """Should detect urgency language."""
        result = self.detector.detect("Act now! Share this immediately before it's deleted!")
        assert len(result["manipulation_indicators"]) > 0
        assert "Urgency language" in result["manipulation_indicators"]

    def test_detects_emotional_manipulation(self):
        """Should detect emotional language."""
        result = self.detector.detect("This shocking revelation will terrify you!")
        assert "Emotional manipulation" in result["manipulation_indicators"]

    def test_clean_text_no_manipulation(self):
        """Clean factual text should not trigger manipulation detection."""
        result = self.detector.detect(
            "The committee voted 12-3 to approve the budget amendment."
        )
        assert len(result["manipulation_indicators"]) == 0

    def test_returns_suspicious_phrases(self):
        """Should return the specific phrases detected."""
        result = self.detector.detect("This is a cover-up! Wake up people!")
        assert len(result["suspicious_phrases"]) > 0
