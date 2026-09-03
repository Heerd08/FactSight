"""
SQLAlchemy models for the FactSight Application Database (Database 1).

Includes 5 Core Tables:
1. User: User accounts & authentication roles
2. AnalysisHistory: Full record of analyzed claims & AI/RAG results
3. Report: Exportable intelligence reports generated from analyses
4. Feedback: User validation & ground truth feedback on AI assessments
5. AuditLog: System-wide audit trail for compliance & tracking
"""

import json
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database.db import Base


class User(Base):
    """User accounts and roles for the FactSight application."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default="user")  # user, analyst, admin
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    analyses = relationship("AnalysisHistory", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class AnalysisHistory(Base):
    """Stores the history of all analyzed claims and RAG evidence results."""

    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    input_text = Column(Text, nullable=False)
    classification = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    credibility_score = Column(Integer, nullable=False)
    main_claim = Column(Text, nullable=True)
    reasons = Column(Text, nullable=False, default="[]")  # JSON list
    suspicious_phrases = Column(Text, nullable=False, default="[]")  # JSON list
    manipulation_indicators = Column(Text, nullable=False, default="[]")  # JSON list
    evidence = Column(Text, nullable=False, default="[]")  # JSON list of RAG sources
    evidence_status = Column(String(50), nullable=False, default="not_configured")
    recommendation = Column(Text, nullable=False, default="")
    model_version = Column(String(100), nullable=False)
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="analyses")
    reports = relationship("Report", back_populates="analysis", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="analysis", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        """Convert the record to a dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "input_text": self.input_text,
            "classification": self.classification,
            "confidence": self.confidence,
            "credibility_score": self.credibility_score,
            "main_claim": self.main_claim,
            "reasons": json.loads(self.reasons) if self.reasons else [],
            "suspicious_phrases": json.loads(self.suspicious_phrases) if self.suspicious_phrases else [],
            "manipulation_indicators": json.loads(self.manipulation_indicators) if self.manipulation_indicators else [],
            "evidence": json.loads(self.evidence) if self.evidence else [],
            "evidence_status": self.evidence_status,
            "recommendation": self.recommendation,
            "model_version": self.model_version,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Report(Base):
    """Detailed exportable assessment reports generated from analyses."""

    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analysis_history.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    key_findings = Column(Text, nullable=False)  # JSON-encoded string or detailed markdown
    export_format = Column(String(50), nullable=False, default="json")  # json, pdf, markdown
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="reports")
    analysis = relationship("AnalysisHistory", back_populates="reports")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "analysis_id": self.analysis_id,
            "title": self.title,
            "summary": self.summary,
            "key_findings": self.key_findings,
            "export_format": self.export_format,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Feedback(Base):
    """User feedback and ground truth validation for AI analyses."""

    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analysis_history.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1 to 5
    is_accurate = Column(Boolean, nullable=True)  # True if user agrees with classification
    user_comment = Column(Text, nullable=True)
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="feedbacks")
    analysis = relationship("AnalysisHistory", back_populates="feedbacks")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "analysis_id": self.analysis_id,
            "rating": self.rating,
            "is_accurate": self.is_accurate,
            "user_comment": self.user_comment,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class AuditLog(Base):
    """System-wide audit trail recording critical user and system actions."""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # ANALYZE, SUBMIT_FEEDBACK, GENERATE_REPORT, RAG_QUERY
    resource_type = Column(String(100), nullable=True)  # analysis, report, feedback
    resource_id = Column(Integer, nullable=True)
    ip_address = Column(String(50), nullable=True)
    details = Column(Text, nullable=False, default="{}")  # JSON details
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="audit_logs")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "ip_address": self.ip_address,
            "details": json.loads(self.details) if self.details else {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

