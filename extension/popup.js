const API_URL = 'http://127.0.0.1:8000/api/analyze';

document.getElementById('verifyBtn').addEventListener('click', async () => {
  const text = document.getElementById('claimInput').value.trim();
  if (!text) return;
  await performVerification({ text: text, content_type: 'text' });
});

document.getElementById('verifyTabBtn').addEventListener('click', async () => {
  if (chrome && chrome.tabs) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      document.getElementById('claimInput').value = tab.url;
      await performVerification({ url: tab.url, content_type: 'url' });
    }
  } else {
    const fallbackUrl = window.location.href;
    await performVerification({ url: fallbackUrl, content_type: 'url' });
  }
});

async function performVerification(payload) {
  const loader = document.getElementById('loader');
  const resultCard = document.getElementById('resultCard');
  const verdictLabel = document.getElementById('verdictLabel');
  const scoreBadge = document.getElementById('scoreBadge');
  const reasonsText = document.getElementById('reasonsText');
  const evidenceContainer = document.getElementById('evidenceContainer');

  loader.style.display = 'block';
  resultCard.style.display = 'none';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const data = await res.json();

    loader.style.display = 'none';
    resultCard.style.display = 'block';

    verdictLabel.textContent = `Verdict: ${data.classification} (${Math.round(data.confidence * 100)}% Conf)`;
    scoreBadge.textContent = `Credibility: ${data.credibility_score}/10`;

    if (data.classification === 'Genuine') {
      scoreBadge.className = 'score-badge score-genuine';
    } else if (data.classification === 'Fake') {
      scoreBadge.className = 'score-badge score-fake';
    } else {
      scoreBadge.className = 'score-badge score-unverified';
    }

    reasonsText.textContent = (data.reasons && data.reasons.length > 0)
      ? data.reasons.join(' ')
      : 'Credibility assessed via Vector Database RAG search.';

    evidenceContainer.innerHTML = '';
    if (data.evidence && data.evidence.length > 0) {
      const heading = document.createElement('div');
      heading.style.fontSize = '10px';
      heading.style.fontWeight = '700';
      heading.style.color = '#6366F1';
      heading.style.marginTop = '6px';
      heading.textContent = 'Top Verified Citations:';
      evidenceContainer.appendChild(heading);

      data.evidence.forEach(e => {
        const item = document.createElement('div');
        item.className = 'evidence-item';
        item.innerHTML = `<strong>${e.source}:</strong> ${e.title}`;
        evidenceContainer.appendChild(item);
      });
    }
  } catch (err) {
    loader.style.display = 'none';
    resultCard.style.display = 'block';
    verdictLabel.textContent = 'Connection Error';
    scoreBadge.textContent = 'Offline';
    scoreBadge.className = 'score-badge score-unverified';
    reasonsText.textContent = 'Make sure the FactSight backend is running at http://127.0.0.1:8000.';
  }
}
