import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.config import settings
from app.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    VerificationRequest,
    VerificationResponse,
    ClaimExtractionRequest,
    ClaimExtractionResponse,
    ExtractedClaim,
    HealthResponse,
    RAGMatch,
    FactSightReport,
    TextVerifyRequest,
    UrlVerifyRequest,
    EmailVerifyRequest,
    SocialVerifyRequest,
)
from app.services import pipeline, rag_service, evaluate_credibility, build_factsight_report

load_dotenv()

app = FastAPI(
    title="TruthGuard AI - Credibility Engine API",
    description="Automated misinformation detection and evidence synthesis API.",
    version="1.0.0"
)

# Configure CORS to allow communication with frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to http://localhost:3000 in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "healthy", "service": "TruthGuard Backend"}


@app.get("/api/health", response_model=HealthResponse, tags=["System"])
def api_health_check():
    """
    Detailed health diagnostic endpoint with AI provider status and loaded Kaggle records.
    """
    return HealthResponse(
        status="healthy",
        service="TruthGuard Backend",
        version="1.0.0",
        ai_provider=settings.AI_PROVIDER,
        gemini_configured=bool(settings.GEMINI_API_KEY),
        rag_records_loaded=len(rag_service.records),
    )


@app.post(
    "/api/v1/assess", 
    response_model=AnalysisResponse, 
    status_code=status.HTTP_200_OK,
    tags=["Analysis"]
)
async def assess_credibility(payload: AnalysisRequest):
    try:
        raw_result = evaluate_credibility(payload.content)
        # Validate against schema before returning
        return AnalysisResponse(**raw_result)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis pipeline error: {str(err)}"
        )


@app.post("/api/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_content_alias(payload: AnalysisRequest):
    """
    Convenience alias for /api/v1/assess
    """
    return await assess_credibility(payload)


# =============================================================================
# FactSight Integration Endpoints
# =============================================================================

@app.post("/api/v1/verify/text", response_model=FactSightReport, tags=["FactSight"])
async def verify_text(payload: TextVerifyRequest):
    content = payload.text or payload.content or ""
    if not content.strip():
        raise HTTPException(status_code=400, detail="Text content is required")
    try:
        return build_factsight_report(content, content_type="text")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


@app.post("/api/v1/verify/url", response_model=FactSightReport, tags=["FactSight"])
async def verify_url(payload: UrlVerifyRequest):
    try:
        return build_factsight_report(f"Content published at URL: {payload.url}", content_type="url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"URL verification failed: {str(e)}")


@app.post("/api/v1/verify/email", response_model=FactSightReport, tags=["FactSight"])
async def verify_email(payload: EmailVerifyRequest):
    try:
        return build_factsight_report(payload.emailContent, content_type="email")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email verification failed: {str(e)}")


@app.post("/api/v1/verify/social", response_model=FactSightReport, tags=["FactSight"])
async def verify_social(payload: SocialVerifyRequest):
    try:
        return build_factsight_report(f"Social post statement: {payload.socialUrl}", content_type="social")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Social verification failed: {str(e)}")



@app.post("/api/verify", response_model=VerificationResponse, tags=["Fact Checking"])
def verify_claim(request: VerificationRequest):
    """
    Detailed multi-dimensional verification endpoint querying Kaggle CSV RAG and returning evidence sources.
    """
    try:
        result = pipeline.verify(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


@app.post("/api/extract-claims", response_model=ClaimExtractionResponse, tags=["Fact Checking"])
def extract_claims(request: ClaimExtractionRequest):
    """
    Extracts individual atomic claims and assertions from an article or longer text.
    """
    import re
    sentences = re.split(r'(?<=[.!?])\s+', request.text.strip())
    claims = [
        ExtractedClaim(claim=s[:200], speaker_or_entity="Input Text", confidence=0.88)
        for s in sentences if len(s.strip()) > 15
    ]
    return ClaimExtractionResponse(
        original_text=request.text,
        claims_found=claims,
        count=len(claims),
    )


@app.get("/api/dataset", response_model=List[RAGMatch], tags=["Kaggle Dataset RAG"])
def search_dataset(
    q: Optional[str] = Query(None, description="Search keyword or claim to query"),
    limit: int = Query(10, ge=1, le=50, description="Max records to return"),
):
    """
    Query the indexed Kaggle CSV benchmark datasets in the data/ directory.
    """
    if q:
        return rag_service.search(q, top_k=limit, threshold=0.05)

    return [
        RAGMatch(
            claim_id=rec["claim_id"],
            matched_claim=rec["claim_text"],
            verdict=rec["verdict"],
            category=rec["category"],
            source=rec["source"],
            explanation=rec["explanation"],
            similarity_score=1.0,
        )
        for rec in rag_service.records[:limit]
    ]


@app.post("/api/dataset/reload", tags=["Kaggle Dataset RAG"])
def reload_dataset():
    """
    Reloads all CSV files from the data/ directory.
    """
    count = rag_service.reload_datasets()
    return {
        "status": "success",
        "message": f"Reloaded {count} benchmark records from data/ directory",
        "total_records": count,
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
