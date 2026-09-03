import json
import pytest
from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.db import Base
from app.database.models import User, AnalysisHistory, Report, Feedback, AuditLog


@pytest.fixture
def db_session():
    """Create an in-memory SQLite database session."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestSession = sessionmaker(bind=engine)
    session = TestSession()
    yield session
    session.close()


class TestDatabaseModels:
    """Tests for all 5 relational tables in Database 1."""

    def test_user_creation(self, db_session):
        """Should create a User record."""
        user = User(
            username="fact_checker_1",
            email="checker@factsight.org",
            role="analyst",
        )
        db_session.add(user)
        db_session.commit()

        assert user.id is not None
        assert user.username == "fact_checker_1"
        assert user.role == "analyst"

    def test_analysis_history_and_user_relation(self, db_session):
        """Should link analysis history to user."""
        user = User(username="analyst_2")
        db_session.add(user)
        db_session.commit()

        analysis = AnalysisHistory(
            user_id=user.id,
            input_text="COVID-19 vaccine 5G claim",
            classification="Fake",
            confidence=0.95,
            credibility_score=2,
            model_version="v2",
        )
        db_session.add(analysis)
        db_session.commit()

        assert analysis.id is not None
        assert analysis.user.username == "analyst_2"

    def test_report_creation(self, db_session):
        """Should create a report linked to analysis."""
        analysis = AnalysisHistory(
            input_text="Water boils at 100C",
            classification="Genuine",
            confidence=0.98,
            credibility_score=9,
            model_version="v2",
        )
        db_session.add(analysis)
        db_session.commit()

        report = Report(
            analysis_id=analysis.id,
            title="Scientific Verification Report",
            summary="Confirmed true via physics laws",
            key_findings="{\"evidence_count\": 1}",
            export_format="json",
        )
        db_session.add(report)
        db_session.commit()

        assert report.id is not None
        assert report.analysis_id == analysis.id

    def test_feedback_creation(self, db_session):
        """Should record feedback on analysis."""
        analysis = AnalysisHistory(
            input_text="Claim",
            classification="Fake",
            confidence=0.8,
            credibility_score=3,
            model_version="v2",
        )
        db_session.add(analysis)
        db_session.commit()

        feedback = Feedback(
            analysis_id=analysis.id,
            rating=5,
            is_accurate=True,
            user_comment="Spot on detection.",
        )
        db_session.add(feedback)
        db_session.commit()

        assert feedback.id is not None
        assert feedback.rating == 5
        assert feedback.is_accurate is True

    def test_audit_log_creation(self, db_session):
        """Should record system audit log."""
        audit = AuditLog(
            action="ANALYZE",
            resource_type="analysis",
            resource_id=1,
            ip_address="127.0.0.1",
            details=json.dumps({"status": "ok"}),
        )
        db_session.add(audit)
        db_session.commit()

        assert audit.id is not None
        assert audit.action == "ANALYZE"
        assert audit.to_dict()["details"]["status"] == "ok"
