const API_URL = 'http://127.0.0.1:8000/api/analyze';
const HEALTH_URL = 'http://127.0.0.1:8000/api/health';

let currentTabInfo = { title: '', url: '' };

document.addEventListener('DOMContentLoaded', async () => {
  setupTabs();
  checkBackendHealth();
  await loadCurrentTab();
  loadHistory();

  // Button Listeners
  document.getElementById('scanPageBtn').addEventListener('click', async () => {
    if (!currentTabInfo.url) return;
    await executeVerification(currentTabInfo.url, true);
  });

  document.getElementById('verifyClaimBtn').addEventListener('click', async () => {
    const text = document.getElementById('claimInput').value.trim();
    if (!text) return;
    await executeVerification(text, false);
  });

  document.getElementById('clearHistoryBtn').addEventListener('click', async () => {
    await chrome.storage.local.set({ factsight_history: [] });
    loadHistory();
  });
});

// 1. Setup Tab Switching
function setupTabs() {
  const tabs = [
    { btn: document.getElementById('tabActivePage'), view: document.getElementById('viewActivePage') },
    { btn: document.getElementById('tabQuickVerify'), view: document.getElementById('viewQuickVerify') },
    { btn: document.getElementById('tabHistory'), view: document.getElementById('viewHistory') }
  ];

  tabs.forEach(t => {
    t.btn.addEventListener('click', () => {
      tabs.forEach(x => {
        x.btn.classList.remove('active');
        x.view.style.display = 'none';
      });
      t.btn.classList.add('active');
      t.view.style.display = 'block';

      if (t.btn.id === 'tabHistory') {
        loadHistory();
      }
    });
  });
}

// 2. Check Backend Health
async function checkBackendHealth() {
  const statusPill = document.getElementById('systemStatus');
  try {
    const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      statusPill.innerHTML = '<span class="status-dot"></span><span>AI Online</span>';
      statusPill.style.color = '#34D399';
    } else {
      throw new Error();
    }
  } catch {
    statusPill.innerHTML = '<span style="width:6px; height:6px; border-radius:50%; background:#EF4444; display:inline-block; margin-right:4px;"></span><span>Offline</span>';
    statusPill.style.color = '#F87171';
    statusPill.style.borderColor = 'rgba(239, 68, 68, 0.4)';
  }
}

// 3. Load Current Browser Tab Info
async function loadCurrentTab() {
  try {
    if (chrome && chrome.tabs) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        currentTabInfo = {
          title: tab.title || 'Untitled Webpage',
          url: tab.url || ''
        };
        document.getElementById('activePageTitle').textContent = currentTabInfo.title;
        document.getElementById('activePageUrl').textContent = currentTabInfo.url;
        return;
      }
    }
  } catch (err) {
    console.warn('Tab query error:', err);
  }

  document.getElementById('activePageTitle').textContent = 'Webpage Target';
  document.getElementById('activePageUrl').textContent = window.location.href;
  currentTabInfo = { title: 'Webpage Target', url: window.location.href };
}

// 4. Modality Router & Verification Trigger
async function executeVerification(input, isPageScan = false) {
  const loader = document.getElementById('loader');
  const resultCard = document.getElementById('resultCard');

  loader.style.display = 'block';
  resultCard.style.display = 'none';

  // Determine Modality
  let payload = {};
  let detectedType = 'text';
  const trimmed = input.trim();
  const isUrl = isPageScan || /^https?:\/\//i.test(trimmed);

  if (isUrl) {
    const isSocial = /(youtube\.com|youtu\.be|instagram\.com|tiktok\.com|twitter\.com|x\.com|reddit\.com|facebook\.com)/i.test(trimmed);
    payload = { url: trimmed, content_type: isSocial ? 'social' : 'url' };
    detectedType = isSocial ? 'social' : 'url';
  } else {
    payload = { text: trimmed, content_type: 'text' };
    detectedType = 'text';
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    loader.style.display = 'none';
    renderResult(data, trimmed);

    // Save to local storage history
    saveHistoryItem({
      id: data.id || `EXT-${Date.now()}`,
      query: trimmed.slice(0, 90),
      classification: data.classification || 'Unverified',
      score: data.credibility_score_pct !== undefined ? data.credibility_score_pct : Math.round((data.credibility_score || 5) * 10),
      type: detectedType,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data: data
    });

  } catch (err) {
    loader.style.display = 'none';
    resultCard.style.display = 'block';
    document.getElementById('verdictBanner').className = 'verdict-banner verdict-unverified';
    document.getElementById('verdictLabel').textContent = 'Offline / Error';
    document.getElementById('scoreCircle').textContent = '--';
    document.getElementById('evaluatedClaimText').textContent = trimmed.slice(0, 80);
    document.getElementById('explanationText').textContent = 'Unable to connect to FactSight backend at http://127.0.0.1:8000. Please ensure the server is running.';
    document.getElementById('manipulationSection').style.display = 'none';
    document.getElementById('evidenceSection').style.display = 'none';
  }
}

// 5. Render Result Card
function renderResult(data, originalInput) {
  const resultCard = document.getElementById('resultCard');
  const verdictBanner = document.getElementById('verdictBanner');
  const verdictLabel = document.getElementById('verdictLabel');
  const scoreCircle = document.getElementById('scoreCircle');
  const evaluatedClaimText = document.getElementById('evaluatedClaimText');
  const explanationText = document.getElementById('explanationText');
  const manipulationSection = document.getElementById('manipulationSection');
  const manipulationContainer = document.getElementById('manipulationContainer');
  const evidenceSection = document.getElementById('evidenceSection');
  const evidenceContainer = document.getElementById('evidenceContainer');

  resultCard.style.display = 'block';

  const classification = data.classification || 'Unverified';
  const score = data.credibility_score_pct !== undefined ? data.credibility_score_pct : Math.round((data.credibility_score || 5) * 10);
  const claim = data.main_claim || originalInput;
  const explanation = data.detailed_explanation || (data.reasons ? data.reasons.join(' ') : 'Credibility assessed.');

  // Set Class / Banner
  verdictBanner.className = `verdict-banner verdict-${classification.toLowerCase()}`;
  verdictLabel.textContent = classification;
  scoreCircle.textContent = `${score}%`;
  evaluatedClaimText.textContent = claim.slice(0, 140) + (claim.length > 140 ? '...' : '');
  explanationText.textContent = explanation;

  // Render Manipulations
  const manips = data.manipulation_indicators || [];
  if (manips.length > 0) {
    manipulationSection.style.display = 'block';
    manipulationContainer.innerHTML = manips.map(m => `
      <span class="badge-pill badge-manip">⚠️ ${m}</span>
    `).join('');
  } else {
    manipulationSection.style.display = 'none';
  }

  // Render Citations
  const evidence = data.evidence || [];
  if (evidence.length > 0) {
    evidenceSection.style.display = 'block';
    evidenceContainer.innerHTML = evidence.slice(0, 2).map(ev => `
      <div class="evidence-item">
        <strong style="color: #F8FAFC;">${ev.source || ev.sourceName || 'Source'}:</strong>
        <span style="color: #94A3B8;">${(ev.title || ev.description || '').slice(0, 80)}...</span>
      </div>
    `).join('');
  } else {
    evidenceSection.style.display = 'none';
  }
}

// 6. History Management
async function saveHistoryItem(item) {
  try {
    const res = await chrome.storage.local.get(['factsight_history']);
    const list = res.factsight_history || [];
    const updated = [item, ...list.filter(x => x.id !== item.id)].slice(0, 20);
    await chrome.storage.local.set({ factsight_history: updated });
  } catch (err) {
    console.warn('Error saving history item:', err);
  }
}

async function loadHistory() {
  const container = document.getElementById('historyListContainer');
  try {
    const res = await chrome.storage.local.get(['factsight_history']);
    const list = res.factsight_history || [];

    if (list.length === 0) {
      container.innerHTML = '<div style="font-size: 11px; color: #64748B; text-align: center; padding: 20px 0;">No recent scans saved.</div>';
      return;
    }

    container.innerHTML = list.map(item => {
      let badgeColor = '#94A3B8';
      if (item.classification === 'Genuine') badgeColor = '#34D399';
      else if (item.classification === 'Fake') badgeColor = '#F87171';
      else if (item.classification === 'Misleading') badgeColor = '#FBBF24';

      return `
        <div class="history-item" data-id="${item.id}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 700; color: ${badgeColor};">${item.classification} (${item.score}%)</span>
            <span style="font-size: 9px; color: #64748B;">${item.timestamp}</span>
          </div>
          <div style="font-size: 11px; color: #CBD5E1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${item.query}
          </div>
        </div>
      `;
    }).join('');

    // Clicking an item opens its result
    container.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const match = list.find(x => x.id === id);
        if (match && match.data) {
          renderResult(match.data, match.query);
        }
      });
    });

  } catch (err) {
    container.innerHTML = '<div style="font-size: 11px; color: #64748B; text-align: center; padding: 20px 0;">Error loading history.</div>';
  }
}

