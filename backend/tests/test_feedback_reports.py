"""
Tests for Feedback, Reports, and AuditLog endpoints.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.db import SessionLocal, Base, engine, init_db
from app.database.models import AnalysisHistory

client = TestClient(app)


@pytest.fixture
def sample_analysis():
    """Create a sample analysis record in the test database."""
    init_db()
    db = SessionLocal()
    analysis = AnalysisHistory(
        input_text="Sample claim for testing reports and feedback.",
        classification="Fake",
        confidence=0.89,
        credibility_score=2,
        main_claim="Sample claim",
        reasons="[\"Model identified false pattern\"]",
        evidence="[]",
        model_version="test-v2",
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    analysis_id = analysis.id
    db.close()
    return analysis_id


class TestFeedbackEndpoints:
    """Tests for Feedback submission and listing."""

    def test_submit_feedback_success(self, sample_analysis):
        """Should submit user feedback successfully."""
        response = client.post(
            "/api/feedback",
            json={
                "analysis_id": sample_analysis,
                "rating": 5,
                "is_accurate": True,
                "user_comment": "Great accurate analysis!",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["analysis_id"] == sample_analysis
        assert data["rating"] == 5
        assert data["is_accurate"] is True

    def test_submit_feedback_invalid_rating(self, sample_analysis):
        """Should reject rating outside 1-5 range."""
        response = client.post(
            "/api/feedback",
            json={
                "analysis_id": sample_analysis,
                "rating": 6,
            },
        )
        assert response.status_code == 422

    def test_submit_feedback_nonexistent_analysis(self):
        """Should return 404 for invalid analysis ID."""
        response = client.post(
            "/api/feedback",
            json={
                "analysis_id": 999999,
                "rating": 4,
            },
        )
        assert response.status_code == 404

    def test_list_feedback(self, sample_analysis):
        """Should list submitted feedback."""
        response = client.get("/api/feedback")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestReportEndpoints:
    """Tests for Report generation and retrieval."""

    def test_generate_report_success(self, sample_analysis):
        """Should generate a structured report from analysis."""
        response = client.post(
            "/api/reports",
            json={
                "analysis_id": sample_analysis,
                "title": "Intelligence Assessment #1",
                "export_format": "json",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["analysis_id"] == sample_analysis
        assert data["title"] == "Intelligence Assessment #1"
        assert "key_findings" in data

    def test_get_report_by_id(self, sample_analysis):
        """Should retrieve report by ID."""
        create_resp = client.post(
            "/api/reports",
            json={
                "analysis_id": sample_analysis,
                "export_format": "markdown",
            },
        )
        report_id = create_resp.json()["id"]

        get_resp = client.get(f"/api/reports/{report_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["id"] == report_id

    def test_list_reports(self):
        """Should list all generated reports."""
        response = client.get("/api/reports")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
