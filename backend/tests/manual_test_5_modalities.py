import json
import urllib.request

test_cases = [
    {
        "category": "1. COPY-PASTE TEXT (VIRAL MISINFORMATION)",
        "payload": {
            "text": "COVID-19 vaccines contain microchips designed for biometric surveillance by the government.",
            "content_type": "text"
        }
    },
    {
        "category": "1b. COPY-PASTE TEXT (VERIFIED SCIENTIFIC FACT)",
        "payload": {
            "text": "Water boils at 100 degrees Celsius at standard atmospheric pressure.",
            "content_type": "text"
        }
    },
    {
        "category": "2. ANALYZE A URL (ARTICLE SCRAPER & VERIFICATION)",
        "payload": {
            "url": "https://reuters.com/clean-energy-investment-record-2025",
            "content_type": "url"
        }
    },
    {
        "category": "3. SCREENSHOT ANALYSIS (VIRAL MEME / IMAGE OCR)",
        "payload": {
            "text": "Extracted text from viral screenshot: 5G cell towers spread coronavirus and mutate human DNA.",
            "content_type": "image"
        }
    },
    {
        "category": "4. EMAIL VERIFICATION (SPOOFED PHISHING SOLICITATION)",
        "payload": {
            "sender": "security-alert@bankofamerica-urgent-notice.xyz",
            "text": "URGENT: Your online account has been flagged for suspicious activity and will be permanently suspended within 24 hours. Click the link below to verify your password and identity immediately.",
            "content_type": "email"
        }
    },
    {
        "category": "5. SOCIAL MEDIA LINK (VIRAL POST CLAIM)",
        "payload": {
            "url": "https://x.com/conspiracy_daily/status/1892837461",
            "text": "Viral tweet: Secret documents prove NASA faked all astronomical images using CGI.",
            "content_type": "social"
        }
    }
]

print("=" * 70)
print("FACTSIGHT PURE RAG - TESTING ALL 5 CORE INPUT MODALITIES")
print("=" * 70 + "\n")

for tc in test_cases:
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/analyze",
        data=json.dumps(tc["payload"]).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        data = json.loads(res.read().decode())
        print(f"[{tc['category']}]")
        print(f"  • Classification:     {data['classification']}")
        print(f"  • Confidence:         {round(data['confidence'] * 100)}%")
        print(f"  • Credibility Score:  {data['credibility_score']} / 10")
        print(f"  • Evidence Status:    {data['evidence_status']}")
        print(f"  • Verified Sources:   {len(data['evidence'])} found")
        if data["evidence"]:
            for ev in data["evidence"]:
                print(f"      - Source: [{ev['source']}] | Record: {ev['title']}")
        if data["manipulation_indicators"]:
            print(f"  • Flagged Markers:    {', '.join(data['manipulation_indicators'])}")
        print(f"  • Top RAG Reason:     {data['reasons'][0] if data['reasons'] else 'N/A'}")
        print(f"  • Recommendation:     {data['recommendation']}")
        print("-" * 70 + "\n")
