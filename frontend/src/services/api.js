/**
 * FactSight AI - Backend Integration Service Interface
 * 
 * FRONTEND-ONLY PREPARATION:
 * This service defines placeholder functions and standardized contract formats
 * ready to be connected to the FactSight AI backend API.
 * 
 * TODO: When the backend is ready:
 * 1. Replace API_BASE_URL with your actual backend URL (e.g. process.env.VITE_API_URL || 'http://localhost:8000/api')
 * 2. Connect the fetch/axios calls in each function below.
 * 3. Ensure the backend returns the expected schema (score, classification, evidence, source trust, explanation).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Expected Verification Response Schema (Reference for Backend Team):
 * {
 *   id: string,
 *   type: 'text' | 'url' | 'image' | 'email' | 'social',
 *   inputPreview: string,
 *   timestamp: string,
 *   credibilityScore: number, // 0 - 100
 *   classification: 'Genuine' | 'Misleading' | 'Fake' | 'Potentially Manipulated' | 'Insufficient Evidence',
 *   summary: string,
 *   keyTakeaway: string,
 *   sourceTrust: {
 *     reputation: 'High' | 'Medium' | 'Low' | 'Unknown',
 *     attribution: 'High' | 'Medium' | 'Low' | 'Unknown',
 *     publicationDate: string,
 *     evidenceQuality: 'High' | 'Medium' | 'Low' | 'Unknown',
 *     metrics: { accuracy: number, transparency: number, domainAge: string }
 *   },
 *   evidence: Array<{
 *     id: string,
 *     sourceName: string,
 *     sourceDomain: string,
 *     title: string,
 *     description: string,
 *     relevanceScore: number, // percentage
 *     trustRating: 'High' | 'Medium' | 'Low',
 *     url: string,
 *     publishDate: string
 *   }>,
 *   aiExplanation: {
 *     mainClaim: string,
 *     supportingEvidence: string[],
 *     contradictingEvidence: string[],
 *     sourceQualityAssessment: string,
 *     missingContext: string[],
 *     scoreRationale: string
 *   },
 *   claimsBreakdown: Array<{
 *     claimText: string,
 *     verdict: 'Supported' | 'Contradicted' | 'Unverified',
 *     confidence: number
 *   }>,
 *   manipulationIndicators: Array<{
 *     type: string,
 *     severity: 'Low' | 'Medium' | 'High',
 *     description: string
 *   }>
 * }
 */

/**
 * Analyze pasted text or factual claims
 * @param {string} text - Content or claim text
 */
export async function analyzeText(text) {
  // TODO: Connect to backend POST /verify/text
  /*
  const response = await fetch(`${API_BASE_URL}/verify/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!response.ok) throw new Error('Verification failed');
  return await response.json();
  */
  return {
    success: true,
    status: 'ready_for_backend',
    submittedData: { type: 'text', content: text, submittedAt: new Date().toISOString() },
    message: 'Analysis request created. Connect backend endpoint to retrieve live verification result.'
  };
}

/**
 * Analyze an article or web page URL
 * @param {string} url - Target URL to analyze
 */
export async function analyzeUrl(url) {
  // TODO: Connect to backend POST /verify/url
  /*
  const response = await fetch(`${API_BASE_URL}/verify/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (!response.ok) throw new Error('Verification failed');
  return await response.json();
  */
  return {
    success: true,
    status: 'ready_for_backend',
    submittedData: { type: 'url', content: url, submittedAt: new Date().toISOString() },
    message: 'URL analysis request created. Connect backend endpoint to retrieve live verification result.'
  };
}

/**
 * Analyze an uploaded screenshot or visual asset
 * @param {File} file - Image file object
 */
export async function analyzeImage(file) {
  // TODO: Connect to backend POST /verify/image
  /*
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}/verify/image`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Verification failed');
  return await response.json();
  */
  return {
    success: true,
    status: 'ready_for_backend',
    submittedData: { type: 'image', fileName: file?.name, fileSize: file?.size, submittedAt: new Date().toISOString() },
    message: 'Image analysis request created. Connect backend endpoint to retrieve live verification result.'
  };
}

/**
 * Analyze raw email content or forwarded headers
 * @param {string} emailContent - Email body text
 */
export async function analyzeEmail(emailContent) {
  // TODO: Connect to backend POST /verify/email
  /*
  const response = await fetch(`${API_BASE_URL}/verify/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailContent })
  });
  if (!response.ok) throw new Error('Verification failed');
  return await response.json();
  */
  return {
    success: true,
    status: 'ready_for_backend',
    submittedData: { type: 'email', content: emailContent, submittedAt: new Date().toISOString() },
    message: 'Email analysis request created. Connect backend endpoint to retrieve live verification result.'
  };
}

/**
 * Analyze a social media post URL
 * @param {string} socialUrl - Social media post URL
 */
export async function analyzeSocialMedia(socialUrl) {
  // TODO: Connect to backend POST /verify/social
  /*
  const response = await fetch(`${API_BASE_URL}/verify/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ socialUrl })
  });
  if (!response.ok) throw new Error('Verification failed');
  return await response.json();
  */
  return {
    success: true,
    status: 'ready_for_backend',
    submittedData: { type: 'social', content: socialUrl, submittedAt: new Date().toISOString() },
    message: 'Social post analysis request created. Connect backend endpoint to retrieve live verification result.'
  };
}
