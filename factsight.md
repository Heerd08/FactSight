# VERIQ AI — Hackathon Development Plan

> **Project:** VERIQ AI  
> **Tagline:** Verify What You See.  
> **Duration:** 18 Hours  
> **Team:** 3 Members, 3 Laptops  
> **Goal:** Build a real working AI-powered misinformation detection and credibility assessment website.

---

## 1. Project Objective

VERIQ AI allows a user to paste:

- A news article
- A social media post
- An online claim
- A forwarded message

The system will:

1. Analyze the actual user-provided content.
2. Extract the main factual claim.
3. Detect suspicious or manipulative language.
4. Search for real verification evidence and fact-check results.
5. Compare available evidence with the claim.
6. Generate a credibility assessment.
7. Explain the reasons and show the evidence used.

> **Important:** VERIQ AI must not use fake data or invented evidence.

---

# 2. Final Tech Stack

## Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- Axios

## Backend

- Python
- FastAPI
- Uvicorn
- Pydantic
- python-dotenv

## AI

- Gemini API

## Verification

- Real fact-check / evidence search APIs
- Trusted public sources where available

## Development

- Antigravity
- GitHub
- VS Code if needed

## Database

**No database for the first MVP.**

Do not spend hackathon time on login, authentication, or user accounts.

---

# 3. Final Architecture

```text
                     USER
                       |
                       v
              React + Vite Frontend
                       |
                       | POST /api/analyze
                       v
                 FastAPI Backend
                       |
             +---------+----------+
             |                    |
             v                    v
        Gemini AI           Verification
             |                    |
       Claim Extraction     Real Evidence
             |                    |
             +---------+----------+
                       |
                       v
              Credibility Assessment
                       |
                       v
              Explainable AI Report
                       |
                       v
                  React Frontend
```

---

# 4. Team Division

## PERSON 1 — Frontend Developer

### Laptop 1

**Technology:**

- React
- Vite
- JavaScript
- Tailwind CSS

### Responsibilities

- Home page
- Content input
- Analyze button
- Loading screen
- API integration
- Results page
- Credibility meter
- Evidence cards
- Error handling
- Responsive design

### Required frontend flow

```text
User enters real content
        |
        v
Click Analyze
        |
        v
POST /api/analyze
        |
        v
Show real loading state
        |
        v
Receive backend response
        |
        v
Display real result
```

### Rule

**No hard-coded analysis results.**

---

## PERSON 2 — AI Developer

### Laptop 2

**Technology:**

- Python
- Gemini API

### Responsibilities

Create an AI service that:

1. Extracts the main factual claim.
2. Extracts important sub-claims.
3. Detects suspicious phrases.
4. Detects sensational language.
5. Detects urgency or emotional manipulation.
6. Identifies possible missing context.
7. Assesses the content using the real evidence provided by the backend.
8. Produces a simple explanation for users.

### Important rule

The AI must **not** label a claim as fake simply because the wording sounds suspicious.

Correct process:

```text
User Content
     |
     v
AI Extracts Claim
     |
     v
Verification Searches for Evidence
     |
     v
Evidence + Claim Sent to AI
     |
     v
AI Generates Evidence-Based Assessment
```

---

## PERSON 3 — Backend and Verification Developer

### Laptop 3

**Technology:**

- Python
- FastAPI
- Uvicorn
- Requests / HTTP client

### Responsibilities

1. Create the backend API.
2. Receive frontend requests.
3. Call the AI claim extraction service.
4. Send the extracted claim to real verification sources.
5. Collect available evidence.
6. Send evidence to the AI assessment service.
7. Calculate the credibility score.
8. Return the final JSON response.

### Main endpoint

```text
POST /api/analyze
```

---

# 5. Final Project Folder Structure

```text
veriq-ai/
|
+-- frontend/
|   |
|   +-- src/
|       |
|       +-- components/
|       |   +-- Navbar.jsx
|       |   +-- ContentInput.jsx
|       |   +-- LoadingSteps.jsx
|       |   +-- CredibilityScore.jsx
|       |   +-- EvidenceCard.jsx
|       |   +-- AnalysisResult.jsx
|       |
|       +-- pages/
|       |   +-- Home.jsx
|       |   +-- Result.jsx
|       |
|       +-- services/
|       |   +-- api.js
|       |
|       +-- App.jsx
|
+-- backend/
|   |
|   +-- main.py
|   |
|   +-- routers/
|   |   +-- analyze.py
|   |
|   +-- services/
|   |   +-- ai_service.py
|   |   +-- verification_service.py
|   |   +-- scoring_service.py
|   |
|   +-- schemas/
|   |   +-- analysis.py
|   |
|   +-- requirements.txt
|
+-- .gitignore
+-- README.md
```

---

# 6. API Request and Response Contract

All team members must agree on this before development.

## Request

```json
{
  "content": "User-entered text goes here"
}
```

## Final Response

```json
{
  "classification": "Misleading",
  "credibility_score": 48,
  "confidence": 82,
  "main_claim": "The extracted main claim",
  "suspicious_phrases": [
    "Share this immediately"
  ],
  "manipulation_indicators": [
    "Urgency language"
  ],
  "reasons": [
    "The claim could not be confirmed using the available evidence",
    "Urgency language was detected"
  ],
  "evidence": [
    {
      "title": "Real evidence title",
      "source": "Real source name",
      "url": "Real source URL",
      "snippet": "Relevant evidence summary"
    }
  ],
  "recommendation": "Verify this information before sharing."
}
```

> All displayed evidence must come from a real source. Never invent a title, source, URL, or evidence result.

---

# 7. Development Plan

## PHASE 1 — Hour 0 to 1: Team Setup

### All 3 members together

- [ ] Confirm project name: **VERIQ AI**
- [ ] Confirm project tagline: **Verify What You See**
- [ ] Create shared GitHub repository
- [ ] Add all 3 team members as collaborators
- [ ] Clone repository on all laptops
- [ ] Create branches:
  - `frontend`
  - `ai-engine`
  - `backend`
- [ ] Set up Antigravity
- [ ] Create required API keys
- [ ] Create `.env` files
- [ ] Add secrets to `.gitignore`
- [ ] Agree on the API request/response format above

### Git rule

```text
main       = stable final project
frontend   = Person 1 work
ai-engine  = Person 2 work
backend    = Person 3 work
```

---

# 8. PHASE 2 — Hour 1 to 4: Parallel Development

## Person 1

Build the frontend with:

- Text input
- Analyze button
- Loading state
- Result layout
- Evidence section

The frontend can initially use the **agreed API response structure**, but it must be connected to the real backend as soon as possible.

## Person 2

Build and test:

```text
extract_claims(text)
```

Test with at least 5 different real claims.

The output should include:

- Main claim
- Sub-claims
- Suspicious phrases
- Manipulation indicators

## Person 3

Build:

```text
FastAPI server
POST /api/analyze
CORS
Request validation
Verification service
Scoring service
```

### Checkpoint at Hour 4

```text
Frontend UI        = READY
AI extraction      = WORKING
Backend endpoint   = WORKING
```

---

# 9. PHASE 3 — Hour 4 to 6: First Integration

Connect the complete pipeline:

```text
Frontend
   |
   v
FastAPI
   |
   v
AI Claim Extraction
   |
   v
Verification Service
   |
   v
AI Assessment
   |
   v
Final JSON
   |
   v
Frontend Result
```

## Goal

By the end of Hour 6:

```text
REAL USER INPUT
      |
      v
REAL AI ANALYSIS
      |
      v
REAL RESULT DISPLAYED
```

This is your first working MVP.

---

# 10. PHASE 4 — Hour 6 to 10: Real Verification

Build the evidence pipeline:

```text
Main Claim
     |
     v
Search Existing Fact Checks
     |
     +---- Evidence Found ----+
     |                        |
    YES                      NO
     |                        |
     v                        v
Use Fact Check          Search Trusted Sources
     |                        |
     +-----------+------------+
                 |
                 v
           Evidence Summary
                 |
                 v
          AI Final Assessment
```

## Required behavior

### If evidence supports the claim

Return:

```text
Supported / Genuine
```

### If evidence contradicts the claim

Return:

```text
Contradicted / Fake
```

### If evidence shows important missing context

Return:

```text
Misleading
```

### If manipulation indicators are strong but factual verification is limited

Return:

```text
Potentially Manipulated
```

### If evidence is insufficient

Return:

```text
Insufficient Evidence
```

**Never force an unknown claim into Fake or Genuine.**

---

# 11. Credibility Score

Use a transparent scoring model.

Example components:

| Component | Purpose |
|---|---|
| Verification evidence | Strongest influence |
| Source reliability | Evidence quality |
| Claim consistency | Whether evidence matches claim |
| Manipulation indicators | Language-based warning signals |

## Important

The score is an **AI credibility assessment**, not a guaranteed proof of truth.

Display the reasons behind the score.

---

# 12. PHASE 5 — Hour 10 to 13: UI and UX

## Person 1

Add:

- Credibility score meter
- Classification badge
- Analysis progress steps
- Evidence cards
- Source links
- Suspicious phrase highlighting
- Responsive design
- Error states

## Person 2

Improve:

- Claim extraction
- Prompt reliability
- Explanation quality
- Structured output validation

## Person 3

Improve:

- Error handling
- API fallbacks
- Score calculation
- Evidence formatting

---

# 13. PHASE 6 — Hour 13 to 16: Testing

Test at least:

- [ ] A well-supported factual claim
- [ ] A known false claim
- [ ] A misleading claim
- [ ] A sensational social media post
- [ ] A claim with insufficient evidence

Test:

- [ ] Empty input
- [ ] Very short input
- [ ] Long article
- [ ] API failure
- [ ] Slow internet
- [ ] No evidence found

Record:

```text
Input
Expected category
Actual result
Evidence found
```

---

# 14. PHASE 7 — Hour 16 to 18: Finalization

All team members:

- [ ] Merge stable code into `main`
- [ ] Run the complete application
- [ ] Test the complete flow
- [ ] Prepare 3 reliable demo examples
- [ ] Prepare backup screenshots
- [ ] Record a short backup demo video
- [ ] Prepare architecture slide
- [ ] Prepare technology stack slide
- [ ] Prepare demo explanation

---

# 15. Final Application Flow

```text
+-----------------------+
| User Pastes Content   |
+----------+------------+
           |
           v
+-----------------------+
| Extract Main Claim    |
+----------+------------+
           |
           v
+-----------------------+
| AI Content Analysis   |
+----------+------------+
           |
           v
+-----------------------+
| Search Real Evidence  |
+----------+------------+
           |
           v
+-----------------------+
| Assess Claim Against  |
| Available Evidence    |
+----------+------------+
           |
           v
+-----------------------+
| Credibility Score     |
+----------+------------+
           |
           v
+-----------------------+
| Explainable Report    |
+-----------------------+
```

---

# 16. What NOT to Build

Do not spend time on:

- Login and signup
- Complex database
- User accounts
- Training your own ML model
- Mobile application
- Deepfake detection
- Complex image analysis
- Perfect web scraping

These can be future features.

---

# 17. Final Success Criteria

By the end of the hackathon, VERIQ AI should:

- [x] Accept real user content
- [x] Use real AI analysis
- [x] Extract actual claims
- [x] Search real verification evidence
- [x] Avoid invented evidence
- [x] Provide a credibility assessment
- [x] Explain why
- [x] Display real evidence and source links
- [x] Handle insufficient evidence honestly
- [x] Work end-to-end through a real website

---

# 18. Golden Rule

> **First make the complete real pipeline work. Then improve the UI. Then add extra features.**

## Priority order

```text
1. Real Input
2. Backend API
3. Real AI Analysis
4. Real Verification
5. Final Result
6. Frontend Polish
7. Extra Features
```

**By Hour 6, you should have a real end-to-end working MVP.**

---

# Final Team Summary

| Person | Laptop | Technology | Responsibility |
|---|---|---|---|
| Person 1 | Laptop 1 | React + JavaScript | Frontend and UI |
| Person 2 | Laptop 2 | Python + Gemini | AI analysis |
| Person 3 | Laptop 3 | Python + FastAPI | Backend and verification |

## Final Stack

```text
Frontend  → React + Vite + JavaScript + Tailwind CSS
Backend   → Python + FastAPI
AI        → Gemini API
Verification → Real fact-check and evidence sources
Development → Antigravity
Collaboration → GitHub
```

**VERIQ AI — Verify What You See.**
