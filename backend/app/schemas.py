from enum import Enum
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class VerdictType(str, Enum):
    TRUE = "TRUE"
    MOSTLY_TRUE = "MOSTLY_TRUE"
    MISLEADING = "MISLEADING"
    FALSE = "FALSE"
    UNVERIFIED = "UNVERIFIED"


class StanceType(str, Enum):
    SUPPORTS = "SUPPORTS"
    REFUTES = "REFUTES"
    NEUTRAL = "NEUTRAL"


class EvidenceItem(BaseModel):
    source_name: str = Field(..., description="Name of the credible institution or publisher")
    title: str = Field(..., description="Headline or reference title")
    url: Optional[str] = Field(None, description="Direct URL if available")
    snippet: str = Field(..., description="Excerpt or supporting evidence text")
    stance: StanceType = Field(..., description="Stance of the evidence relative to the claim")
    reliability_score: float = Field(0.9, ge=0.0, le=1.0, description="Source reliability index")


class ExtractedClaim(BaseModel):
    claim: str = Field(..., description="Extracted core assertation or sub-claim")
    speaker_or_entity: Optional[str] = Field(None, description="Attributed entity or speaker")
    confidence: float = Field(0.9, ge=0.0, le=1.0, description="Extraction confidence")


class CredibilityMetrics(BaseModel):
    overall_score: int = Field(..., ge=0, le=100, description="Overall trustworthiness score (0-100)")
    factual_accuracy: int = Field(..., ge=0, le=100, description="Accuracy based on verified databases")
    source_credibility: int = Field(..., ge=0, le=100, description="Quality and authority of citations")
    sensationalism_risk: int = Field(..., ge=0, le=100, description="Sensationalism/clickbait detection score")
    manipulation_risk: int = Field(..., ge=0, le=100, description="Deceptive linguistic or framing pattern score")


class RAGMatch(BaseModel):
    claim_id: str
    matched_claim: str
    verdict: str
    category: str
    source: str
    explanation: str
    similarity_score: float = Field(..., ge=0.0, le=1.0)


class VerificationRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=3,
        max_length=10000,
        description="The statement, news headline, or article body to verify"
    )
    url: Optional[str] = Field(
        None,
        description="Optional article or social media URL to extract text from"
    )
    use_kaggle_rag: bool = Field(
        True,
        description="Enable cross-referencing against local Kaggle fact-checking CSV dataset"
    )


class VerificationResponse(BaseModel):
    id: str = Field(..., description="Unique verification job ID")
    query: str = Field(..., description="Original input query")
    verdict: VerdictType = Field(..., description="Final verification verdict")
    credibility_score: int = Field(..., ge=0, le=100, description="Trustworthiness percentage")
    summary_explanation: str = Field(..., description="Comprehensive factual reasoning")
    extracted_claims: List[ExtractedClaim] = Field(default_factory=list)
    evidence_sources: List[EvidenceItem] = Field(default_factory=list)
    rag_matches: List[RAGMatch] = Field(default_factory=list)
    metrics: CredibilityMetrics
    red_flags: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    ai_provider_used: str = Field(..., description="'gemini' or 'mock'")
    timestamp: str = Field(..., description="ISO 8601 evaluation timestamp")


class ClaimExtractionRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=15000)


class ClaimExtractionResponse(BaseModel):
    original_text: str
    claims_found: List[ExtractedClaim]
    count: int


class DatasetItem(BaseModel):
    claim_id: str
    claim_text: str
    verdict: str
    category: str
    source: str
    explanation: str
    confidence: float


class DatasetSearchResponse(BaseModel):
    total_records: int
    matches: List[RAGMatch]


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    ai_provider: str
    gemini_configured: bool
    rag_records_loaded: int


class AnalysisRequest(BaseModel):
    content: str = Field(
        ..., 
        min_length=10, 
        max_length=5000, 
        description="Text content, social post, or claim to analyze."
    )


class IndicatorDetails(BaseModel):
    tactics: List[str] = Field(description="Manipulation tactics identified (e.g. fear-mongering, cherry-picking)")
    bias_level: str = Field(description="Low, Moderate, or High emotional/ideological bias")


class AnalysisResponse(BaseModel):
    credibility_score: int = Field(ge=0, le=100, description="Score from 0 (completely fabricated) to 100 (fully verified)")
    classification: Literal["Genuine", "Misleading", "Fake", "Potentially Manipulated"]
    summary_verdict: str = Field(description="Plain-language explanation for why this score was given")
    red_flags: List[str] = Field(description="Specific indicators that triggered suspicion")
    counter_evidence: List[str] = Field(description="Factual context or verified counter-points")
    indicators: IndicatorDetails


# =============================================================================
# FactSight UI Specific Report Models
# =============================================================================

class SourceTrustMetrics(BaseModel):
    accuracy: int = 88
    transparency: int = 82
    domainAge: str = "Verified Registry"


class SourceTrust(BaseModel):
    reputation: Literal["High", "Medium", "Low", "Unknown"] = "High"
    attribution: Literal["High", "Medium", "Low", "Unknown"] = "High"
    publicationDate: str = "Recent"
    evidenceQuality: Literal["High", "Medium", "Low", "Unknown"] = "High"
    metrics: SourceTrustMetrics = Field(default_factory=SourceTrustMetrics)


class FactSightEvidenceItem(BaseModel):
    id: str
    sourceName: str
    sourceDomain: str = ""
    title: str
    description: str
    relevanceScore: int = 90
    trustRating: Literal["High", "Medium", "Low"] = "High"
    url: Optional[str] = None
    publishDate: str = "Verified"


class AIExplanationDetails(BaseModel):
    mainClaim: str
    supportingEvidence: List[str] = Field(default_factory=list)
    contradictingEvidence: List[str] = Field(default_factory=list)
    sourceQualityAssessment: str = "Evaluated against international fact-checking standards and verified databases."
    missingContext: List[str] = Field(default_factory=list)
    scoreRationale: str = ""


class ClaimBreakdownItem(BaseModel):
    claimText: str
    verdict: Literal["Supported", "Contradicted", "Unverified"] = "Unverified"
    confidence: int = 85


class ManipulationIndicatorItem(BaseModel):
    type: str
    severity: Literal["Low", "Medium", "High"] = "Low"
    description: str


class FactSightReport(BaseModel):
    id: str
    type: str = "text"
    inputPreview: str
    timestamp: str
    credibilityScore: int = Field(ge=0, le=100)
    classification: Literal["Genuine", "Misleading", "Fake", "Potentially Manipulated", "Insufficient Evidence"]
    summary: str
    keyTakeaway: str
    sourceTrust: SourceTrust
    evidence: List[FactSightEvidenceItem] = Field(default_factory=list)
    aiExplanation: AIExplanationDetails
    claimsBreakdown: List[ClaimBreakdownItem] = Field(default_factory=list)
    manipulationIndicators: List[ManipulationIndicatorItem] = Field(default_factory=list)


class TextVerifyRequest(BaseModel):
    text: Optional[str] = None
    content: Optional[str] = None


class UrlVerifyRequest(BaseModel):
    url: str


class EmailVerifyRequest(BaseModel):
    emailContent: str


class SocialVerifyRequest(BaseModel):
    socialUrl: str

