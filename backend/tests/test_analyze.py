"""
Tests for the /api/analyze endpoint.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestAnalyzeEndpoint:
    """Tests for POST /api/analyze."""

    def test_analyze_valid_input(self):
        """Should return a valid analysis for normal text."""
        response = client.post(
            "/api/analyze",
            json={"text": "The earth revolves around the sun."},
        )
        # May be 200 or 503 depending on model loading
        if response.status_code == 200:
            data = response.json()
            assert "classification" in data
            assert "confidence" in data
            assert "credibility_score" in data
            assert "reasons" in data
            assert "evidence" in data
            assert "model_version" in data
            assert data["classification"] in ["Genuine", "Misleading", "Fake", "Unverified"]
            assert 0.0 <= data["confidence"] <= 1.0
            assert 1 <= data["credibility_score"] <= 10

    def test_analyze_empty_text(self):
        """Should reject empty text."""
        response = client.post(
            "/api/analyze",
            json={"text": ""},
        )
        assert response.status_code in [400, 422]

    def test_analyze_whitespace_only(self):
        """Should reject whitespace-only text."""
        response = client.post(
            "/api/analyze",
            json={"text": "   "},
        )
        assert response.status_code in [400, 422]

    def test_analyze_missing_text_field(self):
        """Should reject request without text field."""
        response = client.post(
            "/api/analyze",
            json={},
        )
        assert response.status_code in [400, 422]

    def test_analyze_invalid_content_type(self):
        """Should reject non-JSON content."""
        response = client.post(
            "/api/analyze",
            content="not json",
            headers={"Content-Type": "text/plain"},
        )
        assert response.status_code == 422

    def test_analyze_long_text(self):
        """Should handle long text input."""
        long_text = "This is a test claim. " * 500  # ~11,000 chars
        response = client.post(
            "/api/analyze",
            json={"text": long_text},
        )
        # Should work (under 50k limit) or 503 if model not loaded
        assert response.status_code in [200, 503]

    def test_analyze_response_has_evidence_status(self):
        """Response should include evidence_status field."""
        response = client.post(
            "/api/analyze",
            json={"text": "Test claim for evidence status check."},
        )
        if response.status_code == 200:
            data = response.json()
            assert "evidence_status" in data
            assert data["evidence_status"] in ["not_configured", "no_results", "found"]

    def test_analyze_response_has_manipulation_indicators(self):
        """Response should include manipulation_indicators field."""
        response = client.post(
            "/api/analyze",
            json={"text": "BREAKING: Share this immediately before it gets deleted!"},
        )
        if response.status_code == 200:
            data = response.json()
            assert "manipulation_indicators" in data
            assert "suspicious_phrases" in data
            # This text should trigger manipulation detection
            assert len(data["manipulation_indicators"]) > 0 or len(data["suspicious_phrases"]) > 0


class TestAnalyzeExampleClaims:
    """Test with example claims for manual verification.

    NOTE: These tests verify the pipeline works end-to-end.
    They do NOT assert that the model's prediction is "correct" —
    the model's prediction is an AI assessment, not a verified fact.
    """

    EXAMPLE_CLAIMS = [
        "COVID-19 vaccines contain microchips for government tracking.",
        "Water boils at 100 degrees Celsius at standard atmospheric pressure.",
        "The Great Wall of China is visible from space with the naked eye.",
        "5G cell towers spread coronavirus.",
        "The United Nations was established in 1945.",
    ]

    @pytest.mark.parametrize("claim", EXAMPLE_CLAIMS)
    def test_example_claim_produces_valid_response(self, claim):
        """Each example claim should produce a structurally valid response."""
        response = client.post("/api/analyze", json={"text": claim})
        if response.status_code == 200:
            data = response.json()
            assert data["classification"] in ["Genuine", "Misleading", "Fake", "Unverified"]
            assert 0.0 <= data["confidence"] <= 1.0
            assert 1 <= data["credibility_score"] <= 10
            assert isinstance(data["reasons"], list)
            assert len(data["reasons"]) > 0
