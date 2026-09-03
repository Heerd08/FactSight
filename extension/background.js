// Background Service Worker for Chrome/Edge Manifest V3
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "factsight-verify",
    title: "Verify with FactSight AI",
    contexts: ["selection", "link"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "factsight-verify") {
    const selectedText = info.selectionText || info.linkUrl;
    if (!selectedText) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedText,
          content_type: info.linkUrl ? "url" : "text"
        })
      });
      const data = await response.json();
      
      chrome.tabs.sendMessage(tab.id, {
        action: "show_verification_toast",
        data: data
      });
    } catch (e) {
      console.error("FactSight background verification failed:", e);
    }
  }
});
