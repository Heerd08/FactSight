import urllib.request
import json

test_claims = [
    "Drinking industrial bleach and colloidal silver cures all bacterial infections.",
    "NASA faked all six Apollo moon landings on a soundstage in Nevada.",
    "5G cell phone signals are secretly activating nano-particles in human blood.",
    "Eating bananas in the evening turns your stomach acid into toxic poison.",
    "Albert Einstein was awarded the Nobel Prize in Physics in 1921 for his explanation of the photoelectric effect.",
    "Water expands when it freezes into ice due to its crystalline hydrogen bond lattice."
]

print("=" * 75)
print("VERIFYING CONTINUOUS REALISTIC PERCENTAGES & DYNAMIC MODEL CONFIDENCE")
print("=" * 75 + "\n")

for claim in test_claims:
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/analyze",
        data=json.dumps({"text": claim, "content_type": "text"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        data = json.loads(res.read().decode())
        pct = data.get("credibility_score_pct", data["credibility_score"] * 10)
        conf = data["confidence"] * 100
        print(f"Claim: \"{claim[:65]}...\"")
        print(f"  • Verdict:              {data['classification']}")
        print(f"  • Credibility Score:    {pct}%  (Scale: {data['credibility_score']}/10)")
        print(f"  • Calculated Confidence: {conf:.1f}%")
        print(f"  • Evidence Count:       {len(data['evidence'])} verified sources")
        print("-" * 75)
