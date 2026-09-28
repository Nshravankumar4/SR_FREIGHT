/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - SHARED UTILITIES
 * Version: 2.4.2
 */

const Utils = {
  /**
   * Safely formats any date string (ISO, DD-MM-YYYY, YYYY-MM-DD, slash formats, or Excel serial numbers)
   * into HTML5 date input standard (YYYY-MM-DD)
   */
  toInputDateFormat(dateStr) {
    if (dateStr === null || dateStr === undefined) return '';
    const s = String(dateStr).trim();
    if (!s || s === '-' || s.toLowerCase() === 'undefined' || s.toLowerCase() === 'null') return '';

    // Check for Excel serial number (e.g. 46262)
    if (/^\d{5}$/.test(s)) {
      const serial = parseInt(s, 10);
      const utcDays = serial - 25569;
      const date = new Date(utcDays * 86400 * 1000);
      if (!isNaN(date.getTime())) {
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, '0');
        const d = String(date.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }

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
        if (y < 1980) return ''; // ignore 1970 epoch bugs
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
    if (!dateStr || dateStr === '-') return '—';
    const iso = this.toInputDateFormat(dateStr);
    if (!iso) return '—';
    const parts = iso.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  },

  /**
   * Centralized Display Helpers: Distinguish Empty vs Real Zero
   */
  displayNumber(value) {
    if (value === null || value === undefined || String(value).trim() === '' || String(value).trim() === '-') {
      return '—';
    }
    const n = Number(value);
    if (!Number.isFinite(n)) {
      return '—';
    }
    return n.toLocaleString('en-IN');
  },

  displayCurrency(value) {
    if (value === null || value === undefined || String(value).trim() === '' || String(value).trim() === '-') {
      return '—';
    }
    const n = Number(value);
    if (!Number.isFinite(n)) {
      return '—';
    }
    return `₹${n.toLocaleString('en-IN')}`;
  },

  displayDate(value) {
    if (value === null || value === undefined || String(value).trim() === '' || String(value).trim() === '-') {
      return '—';
    }
    const d = this.formatDisplayDate(value);
    return (d && d !== '-' && !d.includes('1970')) ? d : '—';
  },

  displayText(value) {
    if (value === null || value === undefined || String(value).trim() === '' || String(value).trim() === '-') {
      return '—';
    }
    return String(value).trim();
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

