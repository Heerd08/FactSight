import json
import urllib.request

test_claims = [
    "The moon landing was a hoax filmed in Hollywood by Stanley Kubrick.",
    "COVID-19 vaccines alter human DNA with microchips.",
    "The earth is flat and surrounded by an ice wall in Antarctica.",
    "Drinking bleach or chlorine dioxide cures all viral illnesses.",
    "Barack Obama used the Quran instead of the Bible when taking the oath of office.",
    "Albert Einstein failed elementary school mathematics as a child.",
    "Water boils at 100 degrees Celsius at sea level atmospheric pressure."
]

print("=" * 70)
print("TESTING UPGRADED HYBRID RAG MISINFORMATION DETECTION ENGINE")
print("=" * 70 + "\n")

for claim in test_claims:
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/analyze",
        data=json.dumps({"text": claim, "content_type": "text"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        data = json.loads(res.read().decode())
        print(f"Claim: \"{claim}\"")
        print(f"  • Verdict:           {data['classification']} ({round(data['confidence'] * 100)}% Confidence)")
        print(f"  • Credibility Score: {data['credibility_score']} / 10")
        print(f"  • Evidence Count:    {len(data['evidence'])} verified sources")
        for ev in data["evidence"][:2]:
            print(f"      - Source: [{ev['source']}] | Record: {ev['title']}")
        print(f"  • Top Reason:        {data['reasons'][0] if data['reasons'] else 'N/A'}")
        print("-" * 70 + "\n")
