"""
Pydantic schemas for API request/response validation.

Supports all 6 Input Modalities:
1. Copy-Paste Plain Text
2. Web Article / URL
3. Screenshot Image
4. Browser Extension Submissions
5. Forwarded Email Verification
6. Social Media Posts (X/Twitter, Reddit, YouTube, Instagram)
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List


class AnalyzeRequest(BaseModel):
    """Request body for the /api/analyze endpoint supporting all 6 modalities."""
    text: Optional[str] = Field(
        None,
        description="The claim, article text, email body, or post text to analyze.",
        examples=["COVID-19 vaccines contain microchips for tracking."],
    )
    url: Optional[str] = Field(
        None,
        description="Article URL or social media post URL to scrape and analyze.",
        examples=["https://reuters.com/world/clean-energy-investments-2025"],
    )
    content_type: str = Field(
        default="text",
        description="Input modality: 'text', 'url', 'image', 'email', 'social', or 'extension'",
        examples=["text"],
    )
    sender: Optional[str] = Field(
        None,
        description="Optional sender email address for email spoofing and phishing detection.",
        examples=["security-update@paypal-alerts-notice.xyz"],
    )
    image_base64: Optional[str] = Field(
        None,
        description="Base64 encoded screenshot image data for OCR extraction.",
    )
    mime_type: Optional[str] = Field(
        "image/jpeg",
        description="MIME type of the uploaded image file.",
    )



class EvidenceItem(BaseModel):
    """A single piece of evidence from a verification source."""
    title: str = Field(..., description="Title of the evidence source")
    source: str = Field(..., description="Name of the source")
    url: str = Field(..., description="URL to the source")
    snippet: str = Field(..., description="Relevant excerpt from the source")


class AnalyzeResponse(BaseModel):
    """Response body for the /api/analyze endpoint."""
    classification: str = Field(
        ...,
        description="Pure RAG evaluated label: Genuine, Misleading, Fake, or Unverified",
        examples=["Fake"],
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="RAG semantic cosine alignment confidence (0.0-1.0)",
        examples=[0.884],
    )
    credibility_score: int = Field(
        ...,
        ge=1,
        le=10,
        description="AI-derived credibility score (1-10) based on vector consensus & manipulation checks.",
        examples=[2],
    )
    credibility_score_pct: int = Field(
        default=50,
        ge=0,
        le=100,
        description="Real continuous credibility percentage (0-100%)",
        examples=[18],
    )
    detailed_explanation: Optional[str] = Field(
        None,
        description="Comprehensive narrative explanation synthesizing evidence and stating why the claim is fake/genuine",
    )
    main_claim: Optional[str] = Field(
        None,
        description="Extracted core assertion from the input",
    )
    reasons: list[str] = Field(
        default_factory=list,
        description="Factual reasons and evidence citations supporting the verdict",
    )
    suspicious_phrases: list[str] = Field(
        default_factory=list,
        description="Detected suspicious or manipulative phrases",
    )
    manipulation_indicators: list[str] = Field(
        default_factory=list,
        description="Detected manipulation techniques (urgency, emotional appeal, spoofing)",
    )
    evidence: list[EvidenceItem] = Field(
        default_factory=list,
        description="Verified evidence items retrieved from Database 2 (ChromaDB Vector Store) and Tavily Web Search",
    )
    evidence_status: str = Field(
        default="not_configured",
        description="Status of evidence retrieval: 'not_configured', 'no_results', 'found'",
    )
    recommendation: str = Field(
        default="",
        description="Actionable recommendation for the user",
    )
    model_version: str = Field(
        ...,
        description="Version identifier of the RAG engine",
        examples=["rag-tavily-hybrid-v1"],
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Modality-specific metadata (e.g. extracted URL title, social platform, email risk)",
    )


class HealthResponse(BaseModel):
    """Response body for the /api/health endpoint."""
    status: str = Field(..., examples=["ok"])
    model_loaded: bool = Field(..., description="Whether the RAG Engine is loaded and ready")
    model_version: str = Field(..., description="Current RAG model version identifier")
    vector_db_loaded: bool = Field(default=True, description="Whether the Vector DB (ChromaDB) is initialized")
    vector_db_documents: int = Field(default=0, description="Number of indexed fact-checks in vector store")


class FeedbackCreate(BaseModel):
    """Request body for submitting user feedback on an analysis."""
    analysis_id: int = Field(..., description="ID of the analysis history record")
    rating: int = Field(..., ge=1, le=5, description="1 to 5 star rating")
    is_accurate: Optional[bool] = Field(None, description="True if user agrees with AI assessment")
    user_comment: Optional[str] = Field(None, max_length=2000, description="Optional user feedback comment")


class FeedbackResponse(BaseModel):
    """Response returned after submitting feedback."""
    id: int
    analysis_id: int
    rating: int
    is_accurate: Optional[bool]
    user_comment: Optional[str]
    created_at: str


class ReportCreate(BaseModel):
    """Request body for generating an exportable intelligence report."""
    analysis_id: int = Field(..., description="ID of the analysis history record")
    title: Optional[str] = Field(None, description="Custom title for the report")
    export_format: str = Field(default="json", description="Export format: json, pdf, markdown")


class ReportResponse(BaseModel):
    """Exportable intelligence report response."""
    id: int
    analysis_id: int
    title: str
    summary: str
    key_findings: str
    export_format: str
    created_at: str


class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str = Field(..., description="Error message")
