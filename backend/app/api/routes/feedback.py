"""
Feedback API Router — Endpoints for collecting user feedback and ground truth ratings on AI assessments.
"""

import json
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import Feedback, AnalysisHistory, AuditLog
from app.api.schemas.analysis import FeedbackCreate, FeedbackResponse, ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/feedback",
    response_model=FeedbackResponse,
    summary="Submit Analysis Feedback",
    description="Submit user feedback and accuracy ratings on an analysis.",
    responses={404: {"model": ErrorResponse, "description": "Analysis not found"}},
    tags=["Feedback"],
)
async def submit_feedback(
    request: FeedbackCreate,
    db: Session = Depends(get_db),
):
    """Save user feedback for an analysis."""
    analysis = db.query(AnalysisHistory).filter(AnalysisHistory.id == request.analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found")

    feedback = Feedback(
        analysis_id=request.analysis_id,
        rating=request.rating,
        is_accurate=request.is_accurate,
        user_comment=request.user_comment,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    # Log audit
    audit = AuditLog(
        action="SUBMIT_FEEDBACK",
        resource_type="feedback",
        resource_id=feedback.id,
        details=json.dumps({"analysis_id": request.analysis_id, "rating": request.rating}),
    )
    db.add(audit)
    db.commit()

    return FeedbackResponse(
        id=feedback.id,
        analysis_id=feedback.analysis_id,
        rating=feedback.rating,
        is_accurate=feedback.is_accurate,
        user_comment=feedback.user_comment,
        created_at=feedback.created_at.isoformat() if feedback.created_at else "",
    )


@router.get(
    "/feedback",
    response_model=List[FeedbackResponse],
    summary="List Feedback",
    description="Retrieve recent feedback submissions.",
    tags=["Feedback"],
)
async def list_feedback(
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List recent feedback items."""
    feedbacks = db.query(Feedback).order_by(Feedback.created_at.desc()).limit(limit).all()
    return [
        FeedbackResponse(
            id=f.id,
            analysis_id=f.analysis_id,
            rating=f.rating,
            is_accurate=f.is_accurate,
            user_comment=f.user_comment,
            created_at=f.created_at.isoformat() if f.created_at else "",
        )
        for f in feedbacks
    ]
