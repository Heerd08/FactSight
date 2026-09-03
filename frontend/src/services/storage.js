/**
 * FactSight AI - Client State & Local Storage Service
 * Handles user verification history, saved reports, and live session state.
 * Prevents fake hard-coded numbers and allows dynamic dashboard analytics.
 */

const STORAGE_KEYS = {
  CURRENT_VERIFICATION: 'factsight_current_verification',
  HISTORY: 'factsight_verification_history',
  SAVED_REPORTS: 'factsight_saved_reports',
  DEMO_MODE: 'factsight_demo_preview_mode',
};

// Initialize empty or retrieve stored records
export function getStoredHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read history from localStorage:', err);
    return [];
  }
}

export function saveVerificationToHistory(verification) {
  try {
    const existing = getStoredHistory();
    const newRecord = {
      id: `FSA-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      ...verification
    };
    const updated = [newRecord, ...existing].slice(0, 50); // Keep last 50
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    setCurrentVerification(newRecord);
    return newRecord;
  } catch (err) {
    console.error('Failed to save verification to history:', err);
    return verification;
  }
}

export function getCurrentVerification() {
  try {
    // Check sessionStorage first for current session, fallback to localStorage
    const sessionRaw = sessionStorage.getItem(STORAGE_KEYS.CURRENT_VERIFICATION);
    if (sessionRaw) return JSON.parse(sessionRaw);
    
    const localRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_VERIFICATION);
    return localRaw ? JSON.parse(localRaw) : null;
  } catch (err) {
    console.error('Failed to read current verification:', err);
    return null;
  }
}

export function setCurrentVerification(data) {
  try {
    if (!data) {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_VERIFICATION);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_VERIFICATION);
      return;
    }
    const payload = JSON.stringify(data);
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_VERIFICATION, payload);
    localStorage.setItem(STORAGE_KEYS.CURRENT_VERIFICATION, payload);
  } catch (err) {
    console.error('Failed to set current verification:', err);
  }
}

export function getSavedReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_REPORTS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read saved reports:', err);
    return [];
  }
}

export function toggleSaveReport(report) {
  try {
    const saved = getSavedReports();
    const exists = saved.some(r => r.id === report.id || (r.content && r.content === report.content));
    let updated;
    if (exists) {
      updated = saved.filter(r => r.id !== report.id && r.content !== report.content);
    } else {
      updated = [
        {
          ...report,
          savedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
        },
        ...saved
      ];
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_REPORTS, JSON.stringify(updated));
    return !exists;
  } catch (err) {
    console.error('Failed to toggle save report:', err);
    return false;
  }
}

export function isReportSaved(idOrContent) {
  const saved = getSavedReports();
  return saved.some(r => r.id === idOrContent || r.content === idOrContent);
}

export function getDashboardMetrics() {
  const history = getStoredHistory();
  const saved = getSavedReports();
  
  if (!history || history.length === 0) {
    return {
      totalVerifications: null, // Displays "—" or "No data yet"
      savedReports: saved.length > 0 ? saved.length : null,
      claimsChecked: null,
      avgConfidence: null
    };
  }

  const totalVerifications = history.length;
  // Calculate verified claims count if individual claims exist
  const totalClaims = history.reduce((acc, curr) => acc + (curr.claims?.length || 1), 0);
  
  // Calculate average confidence score if scores exist
  const scores = history.map(h => h.confidence || h.credibilityScore).filter(s => typeof s === 'number');
  const avgConfidence = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) + '%' 
    : null;

  return {
    totalVerifications,
    savedReports: saved.length > 0 ? saved.length : 0,
    claimsChecked: totalClaims,
    avgConfidence: avgConfidence || '—'
  };
}
