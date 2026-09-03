// Content script to display instant floating credibility badge on any webpage
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "show_verification_toast" && request.data) {
    const data = request.data;
    
    // Remove existing badge if present
    const old = document.getElementById("factsight-floating-badge");
    if (old) old.remove();

    const toast = document.createElement("div");
    toast.id = "factsight-floating-badge";
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: white;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 14px 18px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 320px;
      animation: fsFadeIn 0.3s ease-out;
    `;

    const badgeColor = data.classification === "Genuine" ? "#059669" : data.classification === "Fake" ? "#E11D48" : "#D97706";

    toast.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
        <span style="font-weight:800; font-size:13px; color:#0F172A;">FactSight AI Verification</span>
        <button id="fs-close-btn" style="background:none; border:none; font-size:14px; cursor:pointer; color:#94A3B8;">&times;</button>
      </div>
      <div style="font-size:12px; font-weight:700; color:${badgeColor}; margin-bottom:4px;">
        Verdict: ${data.classification} (Score: ${data.credibility_score}/10)
      </div>
      <div style="font-size:11px; color:#475569; line-height:1.4;">
        ${data.reasons && data.reasons.length > 0 ? data.reasons[0] : 'Pure RAG fact verification complete.'}
      </div>
    `;

    document.body.appendChild(toast);
    document.getElementById("fs-close-btn").onclick = () => toast.remove();

    setTimeout(() => {
      if (toast && toast.parentNode) toast.remove();
    }, 8000);
  }
});
