"""
Reports API Router — Endpoints for generating, exporting, and retrieving intelligence assessment reports.
"""

import json
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import Report, AnalysisHistory, AuditLog
from app.api.schemas.analysis import ReportCreate, ReportResponse, ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/reports",
    response_model=ReportResponse,
    summary="Generate Analysis Report",
    description="Generate a detailed intelligence credibility report from an existing analysis.",
    responses={404: {"model": ErrorResponse, "description": "Analysis not found"}},
    tags=["Reports"],
)
async def generate_report(
    request: ReportCreate,
    db: Session = Depends(get_db),
):
    """Generate a structured report from an analysis record."""
    analysis = db.query(AnalysisHistory).filter(AnalysisHistory.id == request.analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found")

    title = request.title or f"FactSight Credibility Report #{analysis.id} - {analysis.classification}"
    summary = f"Credibility assessment for claim: '{analysis.main_claim or analysis.input_text[:100]}'. Verdict: {analysis.classification} (Score: {analysis.credibility_score}/10, Confidence: {analysis.confidence:.1%})."
    
    findings_data = {
        "classification": analysis.classification,
        "confidence": analysis.confidence,
        "credibility_score": analysis.credibility_score,
        "reasons": json.loads(analysis.reasons) if analysis.reasons else [],
        "evidence": json.loads(analysis.evidence) if analysis.evidence else [],
        "manipulation_indicators": json.loads(analysis.manipulation_indicators) if analysis.manipulation_indicators else [],
        "recommendation": analysis.recommendation,
        "model_version": analysis.model_version,
    }

    report = Report(
        analysis_id=analysis.id,
        title=title,
        summary=summary,
        key_findings=json.dumps(findings_data),
        export_format=request.export_format,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Audit log
    audit = AuditLog(
        action="GENERATE_REPORT",
        resource_type="report",
        resource_id=report.id,
        details=json.dumps({"analysis_id": analysis.id, "format": request.export_format}),
    )
    db.add(audit)
    db.commit()

    return ReportResponse(
        id=report.id,
        analysis_id=report.analysis_id,
        title=report.title,
        summary=report.summary,
        key_findings=report.key_findings,
        export_format=report.export_format,
        created_at=report.created_at.isoformat() if report.created_at else "",
    )


@router.get(
    "/reports/{report_id}",
    response_model=ReportResponse,
    summary="Get Report by ID",
    description="Retrieve an intelligence assessment report.",
    responses={404: {"model": ErrorResponse, "description": "Report not found"}},
    tags=["Reports"],
)
async def get_report(
    report_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve a single report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return ReportResponse(
        id=report.id,
        analysis_id=report.analysis_id,
        title=report.title,
        summary=report.summary,
        key_findings=report.key_findings,
        export_format=report.export_format,
        created_at=report.created_at.isoformat() if report.created_at else "",
    )


@router.get(
    "/reports",
    response_model=List[ReportResponse],
    summary="List Reports",
    description="List all generated assessment reports.",
    tags=["Reports"],
)
async def list_reports(
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List recent reports."""
    reports = db.query(Report).order_by(Report.created_at.desc()).limit(limit).all()
    return [
        ReportResponse(
            id=r.id,
            analysis_id=r.analysis_id,
            title=r.title,
            summary=r.summary,
            key_findings=r.key_findings,
            export_format=r.export_format,
            created_at=r.created_at.isoformat() if r.created_at else "",
        )
        for r in reports
    ]
