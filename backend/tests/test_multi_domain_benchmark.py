import urllib.request
import json

test_claims = [
    "Morgan Freeman passed away today in his sleep at his home.",
    "Modi will announce emergency in India next week.",
    "The speed of light in vacuum is approximately 299,792 kilometers per second.",
    "Drinking kerosene cures throat cancer completely."
]

print("=" * 80)
print("COMPREHENSIVE MULTI-DOMAIN AI AGENT BENCHMARK")
print("=" * 80 + "\n")

for claim in test_claims:
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/analyze",
        data=json.dumps({"text": claim, "content_type": "text"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=20) as res:
        data = json.loads(res.read().decode())
        pct = data.get("credibility_score_pct", data["credibility_score"] * 10)
        conf = data["confidence"] * 100
        print(f"Claim: \"{claim}\"")
        print(f"  • Verdict:              {data['classification']}")
        print(f"  • Credibility Score:    {pct}%  (Scale: {data['credibility_score']}/10)")
        print(f"  • Calculated Confidence: {conf:.1f}%")
        print(f"  • Target Entity Sources: {len(data['evidence'])} verified sources")
        for ev in data.get("evidence", [])[:2]:
            print(f"      - [{ev['source']}]: {ev['title']} ({ev['url']})")
        print("-" * 80)
