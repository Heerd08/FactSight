// FactSight AI Background Service Worker (Manifest V3)
const BACKEND_URL = "http://127.0.0.1:8000/api/analyze";

// Install Context Menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "factsight-verify-selection",
    title: "🔍 Verify selected claim with FactSight AI",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "factsight-verify-link",
    title: "🔗 Fact-check link / video with FactSight AI",
    contexts: ["link"]
  });

  chrome.contextMenus.create({
    id: "factsight-verify-page",
    title: "📄 Scan current page with FactSight AI",
    contexts: ["page"]
  });
});

// Helper to determine payload modality
function determineModality(input, isLink = false) {
  const trimmed = (input || "").trim();
  const isUrl = /^https?:\/\//i.test(trimmed);

  if (isLink || isUrl) {
    const isSocial = /(youtube\.com|youtu\.be|instagram\.com|tiktok\.com|twitter\.com|x\.com|reddit\.com|facebook\.com)/i.test(trimmed);
    return {
      payload: { url: trimmed, content_type: isSocial ? "social" : "url" },
      type: isSocial ? "social" : "url"
    };
  }

  return {
    payload: { text: trimmed, content_type: "text" },
    type: "text"
  };
}

// Update Extension Toolbar Badge
function updateBadge(classification, score) {
  let text = "";
  let color = "#64748B";

  if (classification === "Genuine") {
    text = `${score || 99}%`;
    color = "#10B981"; // Emerald
  } else if (classification === "Fake") {
    text = "FAKE";
    color = "#EF4444"; // Crimson
  } else if (classification === "Misleading") {
    text = "WARN";
    color = "#F59E0B"; // Amber
  } else {
    text = "?";
    color = "#64748B"; // Slate
  }

  chrome.action.setBadgeText({ text: text });
  chrome.action.setBadgeBackgroundColor({ color: color });
}

// Save Analysis to Chrome Storage History
async function saveToHistory(item) {
  try {
    const stored = await chrome.storage.local.get(["factsight_history"]);
    const list = stored.factsight_history || [];
    const updated = [item, ...list.filter(x => x.id !== item.id)].slice(0, 25);
    await chrome.storage.local.set({ factsight_history: updated });
  } catch (err) {
    console.warn("Failed saving verification to storage:", err);
  }
}

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  let targetInput = "";
  let isLink = false;

  if (info.menuItemId === "factsight-verify-selection") {
    targetInput = info.selectionText || "";
  } else if (info.menuItemId === "factsight-verify-link") {
    targetInput = info.linkUrl || "";
    isLink = true;
  } else if (info.menuItemId === "factsight-verify-page") {
    targetInput = info.pageUrl || tab.url || "";
    isLink = true;
  }

  if (!targetInput) return;

  const { payload, type } = determineModality(targetInput, isLink);

  // Notify content script to display loading state
  chrome.tabs.sendMessage(tab.id, {
    action: "show_verification_loading",
    query: targetInput
  }).catch(() => {});

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();

    // Update badge and history
    updateBadge(data.classification, data.credibility_score_pct);

    const historyRecord = {
      id: data.id || `EXT-${Date.now()}`,
      query: targetInput.slice(0, 90),
      classification: data.classification,
      score: data.credibility_score_pct,
      type: type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data: data
    };
    saveToHistory(historyRecord);

    // Send complete result to content script
    chrome.tabs.sendMessage(tab.id, {
      action: "show_verification_result",
      data: data,
      originalInput: targetInput,
      modalityType: type
    }).catch(() => {});

  } catch (e) {
    console.error("FactSight background verification failed:", e);
    chrome.tabs.sendMessage(tab.id, {
      action: "show_verification_error",
      error: "Could not reach FactSight backend at http://127.0.0.1:8000. Ensure the server is running."
    }).catch(() => {});
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "verify_from_content") {
    const { payload, type } = determineModality(message.text);
    fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        updateBadge(data.classification, data.credibility_score_pct);
        saveToHistory({
          id: data.id || `EXT-${Date.now()}`,
          query: message.text.slice(0, 90),
          classification: data.classification,
          score: data.credibility_score_pct,
          type: type,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: data
        });
        sendResponse({ success: true, data: data });
      })
      .catch(err => {
        sendResponse({ success: false, error: err.message });
      });
    return true; // Keep message channel open for async response
  }
});

