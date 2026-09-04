// FactSight AI In-Page Verification Agent (Manifest V3)
(function () {
  let floatingPill = null;
  let activeModal = null;
  let selectedTextCache = "";

  // 1. Text Selection Listener for Quick Action Pill
  document.addEventListener("mouseup", (e) => {
    // If clicking inside our modal or pill, do not dismiss
    if (e.target.closest && (e.target.closest("#factsight-inpage-modal") || e.target.closest("#factsight-selection-pill"))) {
      return;
    }

    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";

    if (text.length >= 10 && text.length <= 1500) {
      selectedTextCache = text;
      showFloatingPill(e.pageX, e.pageY);
    } else {
      hideFloatingPill();
    }
  });

  function hideFloatingPill() {
    if (floatingPill) {
      floatingPill.remove();
      floatingPill = null;
    }
  }

  function showFloatingPill(x, y) {
    hideFloatingPill();

    floatingPill = document.createElement("div");
    floatingPill.id = "factsight-selection-pill";
    floatingPill.style.cssText = `
      position: absolute;
      left: ${Math.max(10, x - 60)}px;
      top: ${Math.max(10, y - 48)}px;
      z-index: 2147483645;
      background: #0B132B;
      color: #F8FAFC;
      border: 1px solid #38BDF8;
      border-radius: 9999px;
      padding: 6px 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 8px 24px -4px rgba(56, 189, 248, 0.35), 0 2px 6px rgba(0,0,0,0.5);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: transform 0.15s ease, background 0.15s ease;
      user-select: none;
    `;

    floatingPill.innerHTML = `
      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#38BDF8; box-shadow:0 0 8px #38BDF8;"></span>
      <span>Fact-check with FactSight</span>
    `;

    floatingPill.onmouseenter = () => {
      floatingPill.style.transform = "scale(1.05)";
      floatingPill.style.background = "#1C273B";
    };
    floatingPill.onmouseleave = () => {
      floatingPill.style.transform = "scale(1)";
      floatingPill.style.background = "#0B132B";
    };

    floatingPill.onclick = (ev) => {
      ev.stopPropagation();
      const claimToVerify = selectedTextCache;
      hideFloatingPill();
      if (!claimToVerify) return;

      showInPageModalLoading(claimToVerify);

      // Send to background service worker
      chrome.runtime.sendMessage({
        action: "verify_from_content",
        text: claimToVerify
      }, (res) => {
        if (res && res.success && res.data) {
          renderInPageModalResult(res.data, claimToVerify);
        } else {
          renderInPageModalError(res ? res.error : "Connection error to FactSight backend.");
        }
      });
    };

    document.body.appendChild(floatingPill);
  }

  // 2. Create or Reset Modal Container
  function getOrCreateModal() {
    if (activeModal) activeModal.remove();

    activeModal = document.createElement("div");
    activeModal.id = "factsight-inpage-modal";
    activeModal.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 48px);
      max-height: calc(100vh - 48px);
      overflow-y: auto;
      z-index: 2147483647;
      background: rgba(11, 19, 43, 0.96);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 16px;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.15);
      animation: fsSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      padding: 18px;
      box-sizing: border-box;
    `;

    document.body.appendChild(activeModal);
    return activeModal;
  }

  // 3. Render Modal Loading State
  function showInPageModalLoading(query) {
    const modal = getOrCreateModal();
    const safeSnippet = (query || "").slice(0, 100);

    modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:20px; height:20px; border-radius:6px; background:#38BDF8; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:11px; color:#0B132B;">FS</div>
          <span style="font-weight:700; font-size:13px; color:#F8FAFC;">FactSight AI Verification</span>
        </div>
        <button id="fs-modal-close" style="background:none; border:none; color:#94A3B8; font-size:16px; cursor:pointer;">&times;</button>
      </div>

      <div style="padding:16px 0; text-align:center;">
        <div style="width:36px; height:36px; border:3px solid rgba(56,189,248,0.2); border-top-color:#38BDF8; border-radius:50%; margin:0 auto 12px; animation:fsSpin 0.8s linear infinite;"></div>
        <div style="font-size:13px; font-weight:700; color:#38BDF8; margin-bottom:4px;">Cross-referencing evidence...</div>
        <div style="font-size:11px; color:#94A3B8; line-height:1.4;">Extracting claims, evaluating sources, and verifying timeline...</div>
        <div style="margin-top:10px; font-size:11px; color:#64748B; font-style:italic; background:rgba(255,255,255,0.04); padding:6px 10px; border-radius:8px;">"${safeSnippet}..."</div>
      </div>
    `;

    document.getElementById("fs-modal-close").onclick = () => modal.remove();
  }

  // 4. Render Modal Result State
  function renderInPageModalResult(data, originalInput) {
    const modal = getOrCreateModal();

    const classification = data.classification || "Unverified";
    const score = data.credibility_score_pct !== undefined ? data.credibility_score_pct : Math.round((data.credibility_score || 5) * 10);
    const explanation = data.detailed_explanation || (data.reasons ? data.reasons.join(" ") : "Credibility assessed via Senior Arbiter.");
    const claim = data.main_claim || originalInput || "";
    const manipulations = data.manipulation_indicators || [];
    const evidence = data.evidence || [];

    let badgeBg = "rgba(100, 116, 139, 0.2)";
    let badgeBorder = "#64748B";
    let badgeColor = "#94A3B8";

    if (classification === "Genuine") {
      badgeBg = "rgba(16, 185, 129, 0.15)";
      badgeBorder = "#10B981";
      badgeColor = "#34D399";
    } else if (classification === "Fake") {
      badgeBg = "rgba(239, 68, 68, 0.15)";
      badgeBorder = "#EF4444";
      badgeColor = "#F87171";
    } else if (classification === "Misleading") {
      badgeBg = "rgba(245, 158, 11, 0.15)";
      badgeBorder = "#F59E0B";
      badgeColor = "#FBBF24";
    }

    let manipHtml = "";
    if (manipulations.length > 0) {
      manipHtml = `
        <div style="margin: 10px 0;">
          <div style="font-size:10px; font-weight:700; color:#94A3B8; text-transform:uppercase; margin-bottom:4px;">Manipulation Signals</div>
          <div style="display:flex; flex-wrap:wrap; gap:4px;">
            ${manipulations.slice(0, 3).map(m => `
              <span style="font-size:10px; background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239,68,68,0.3); color:#FCA5A5; padding:2px 8px; border-radius:6px;">⚠️ ${m}</span>
            `).join("")}
          </div>
        </div>
      `;
    }

    let evidenceHtml = "";
    if (evidence.length > 0) {
      evidenceHtml = `
        <div style="margin-top: 10px; border-top:1px solid rgba(255,255,255,0.08); padding-top:8px;">
          <div style="font-size:10px; font-weight:700; color:#38BDF8; text-transform:uppercase; margin-bottom:4px;">Top Citations</div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            ${evidence.slice(0, 2).map(ev => `
              <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:6px; font-size:11px;">
                <div style="font-weight:700; color:#E2E8F0;">${ev.source || ev.sourceName || "Verified Source"}:</div>
                <div style="color:#94A3B8; font-size:10px; line-height:1.3;">${(ev.title || ev.description || "").slice(0, 80)}...</div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:20px; height:20px; border-radius:6px; background:#38BDF8; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:11px; color:#0B132B;">FS</div>
          <span style="font-weight:700; font-size:13px; color:#F8FAFC;">FactSight AI Report</span>
        </div>
        <button id="fs-modal-close" style="background:none; border:none; color:#94A3B8; font-size:16px; cursor:pointer;">&times;</button>
      </div>

      <!-- Verdict Banner -->
      <div style="background:${badgeBg}; border:1px solid ${badgeBorder}; border-radius:10px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div>
          <div style="font-size:10px; text-transform:uppercase; color:#94A3B8; font-weight:700;">Credibility Verdict</div>
          <div style="font-size:16px; font-weight:900; color:${badgeColor};">${classification}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:18px; font-weight:900; color:#F8FAFC;">${score}%</div>
          <div style="font-size:9px; color:#94A3B8;">Confidence</div>
        </div>
      </div>

      <!-- Evaluated Claim -->
      <div style="font-size:11px; color:#CBD5E1; line-height:1.4; background:rgba(255,255,255,0.03); padding:8px 10px; border-radius:8px; margin-bottom:8px; border-left:3px solid #38BDF8;">
        <strong>Claim:</strong> "${claim.slice(0, 160)}${claim.length > 160 ? '...' : ''}"
      </div>

      <!-- Explanation -->
      <div style="font-size:11px; color:#94A3B8; line-height:1.4; max-height:110px; overflow-y:auto; margin-bottom:8px;">
        ${explanation.slice(0, 300)}${explanation.length > 300 ? '...' : ''}
      </div>

      ${manipHtml}
      ${evidenceHtml}

      <!-- Action Footer -->
      <div style="margin-top:12px; display:flex; gap:8px;">
        <a href="http://127.0.0.1:5173/verify" target="_blank" style="flex:1; text-align:center; background:#38BDF8; color:#0B132B; font-weight:800; font-size:11px; padding:8px 10px; border-radius:8px; text-decoration:none;">
          Open in FactSight App →
        </a>
      </div>
    `;

    document.getElementById("fs-modal-close").onclick = () => modal.remove();
  }

  // 5. Render Modal Error State
  function renderInPageModalError(errMsg) {
    const modal = getOrCreateModal();
    modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">
        <div style="font-weight:700; font-size:13px; color:#EF4444;">FactSight Connection Alert</div>
        <button id="fs-modal-close" style="background:none; border:none; color:#94A3B8; font-size:16px; cursor:pointer;">&times;</button>
      </div>
      <div style="font-size:12px; color:#CBD5E1; line-height:1.4; padding:8px 0;">
        ${errMsg}
      </div>
      <div style="margin-top:10px; font-size:11px; color:#64748B;">
        Make sure the backend is active on <code style="color:#38BDF8;">http://127.0.0.1:8000</code>.
      </div>
    `;
    document.getElementById("fs-modal-close").onclick = () => modal.remove();
  }

  // 6. Listen for Chrome Runtime Messages from Context Menus
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "show_verification_loading") {
      showInPageModalLoading(request.query);
    } else if (request.action === "show_verification_result") {
      renderInPageModalResult(request.data, request.originalInput);
    } else if (request.action === "show_verification_error") {
      renderInPageModalError(request.error);
    } else if (request.action === "show_verification_toast" && request.data) {
      renderInPageModalResult(request.data, "");
    }
  });

  // 7. Inject Keyframe animations into document head
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    @keyframes fsSlideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fsSpin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleEl);
})();

