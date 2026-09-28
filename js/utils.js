/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - SHARED UTILITIES
 * Version: 2.4.2
 */

const Utils = {
  /**
   * Safely formats any date string (ISO, DD-MM-YYYY, YYYY-MM-DD, slash formats)
   * into HTML5 date input standard (YYYY-MM-DD)
   */
  toInputDateFormat(dateStr) {
    if (!dateStr) return '';
    const s = String(dateStr).trim();
    if (!s || s === '-' || s.toLowerCase() === 'undefined' || s.toLowerCase() === 'null') return '';

    // Check for DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const d = dmyMatch[1].padStart(2, '0');
      const m = dmyMatch[2].padStart(2, '0');
      const y = dmyMatch[3];
      return `${y}-${m}-${d}`;
    }

    // Check for YYYY-MM-DD or YYYY/MM/DD
    const ymdMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (ymdMatch) {
      const y = ymdMatch[1];
      const m = ymdMatch[2].padStart(2, '0');
      const d = ymdMatch[3].padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    // Fallback: Date parse
    try {
      const parsed = new Date(s);
      if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const d = String(parsed.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    } catch (_) {}

    return '';
  },

  /**
   * Formats YYYY-MM-DD or any date string to standard display format DD-MM-YYYY
   */
  formatDisplayDate(dateStr) {
    if (!dateStr || dateStr === '-') return '-';
    const s = String(dateStr).trim();
    const dmyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      return `${dmyMatch[1].padStart(2, '0')}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[3]}`;
    }
    const ymdMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (ymdMatch) {
      return `${ymdMatch[3].padStart(2, '0')}-${ymdMatch[2].padStart(2, '0')}-${ymdMatch[1]}`;
    }
    return s;
  },

  /**
   * Currency formatter in Indian format (₹1,30,000)
   */
  formatCurrency(val, includeSymbol = true) {
    const num = Number(val) || 0;
    const formatted = num.toLocaleString('en-IN');
    return includeSymbol ? `₹${formatted}` : formatted;
  },

  /**
   * Generates a unique, standardized Trip ID
   */
  generateTripId(vehicleNo = '') {
    const vPrefix = vehicleNo ? vehicleNo.replace(/[^A-Za-z0-9]/g, '').slice(-4) : 'TRIP';
    const today = new Date();
    const ymd = today.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TRIP-${ymd}-${vPrefix}-${rand}`;
  },

  /**
   * Generates a unique Receipt ID
   */
  generateReceiptId() {
    const today = new Date();
    const ymd = today.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(100 + Math.random() * 900);
    return `REC-${ymd}-${rand}`;
  },

  /**
   * Display floating toast notifications
   */
  showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bg = type === 'error' ? '#ef4444' : (type === 'warning' ? '#f59e0b' : '#10b981');
    toast.style.cssText = `background:${bg};color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;box-shadow:0 10px 15px -3px rgba(0,0,0,0.2);display:flex;align-items:center;gap:8px;transition:opacity 0.3s,transform 0.3s;transform:translateY(10px);opacity:0;`;
    toast.innerHTML = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}

