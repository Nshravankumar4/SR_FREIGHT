/**
 * 🔔 RENEWALS & ALERTS - STATUS & TIME CALCULATIONS ENGINE
 * Centralized business logic for automatic fleet document status determination.
 * NEVER hardcode statuses; always calculate dynamically against current date.
 */

const RenewalCalculations = {
  /**
   * Parse a date string into a Date object at 00:00:00 local time
   * Supports: 'YYYY-MM-DD', 'DD-MM-YYYY', 'DD/MM/YYYY', ISO strings
   */
  parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr instanceof Date) {
      return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate());
    }

    const s = String(dateStr).trim();

    // Check DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      return new Date(year, month, day);
    }

    // Check YYYY-MM-DD
    const ymdMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      return new Date(year, month, day);
    }

    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    return null;
  },

  /**
   * Format date into DD-MM-YYYY
   */
  formatDate(dateStr) {
    const d = this.parseDate(dateStr);
    if (!d) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  },

  /**
   * Format date into ISO YYYY-MM-DD for date inputs
   */
  formatISODate(dateStr) {
    const d = this.parseDate(dateStr);
    if (!d) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  },

  /**
   * Calculate automatic status and urgency metadata for a renewal item
   * @param {Object} renewal Record with at least { dueDate }
   * @param {Date} [referenceDate] Optional override for testing
   */
  calculateStatus(renewal, referenceDate = null) {
    const targetDate = this.parseDate(renewal.dueDate || renewal.due_date);
    if (!targetDate) {
      return {
        statusCode: 'UNKNOWN',
        label: 'No Due Date',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
        diffDays: 0,
        humanDiff: 'No date specified',
        isOverdue: false,
        isDueSoon: false,
        requiresAttention: false,
        urgencyWeight: 9999
      };
    }

    const now = referenceDate ? new Date(referenceDate) : new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const msPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.round((targetDate.getTime() - today.getTime()) / msPerDay);

    // Rule 1: Due date < today -> OVERDUE
    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return {
        statusCode: 'OVERDUE',
        label: '🔴 OVERDUE',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800 font-black',
        diffDays: diffDays,
        humanDiff: overdueDays === 1 ? 'Expired yesterday' : `Expired ${overdueDays} days ago`,
        isOverdue: true,
        isDueSoon: true,
        requiresAttention: true,
        urgencyWeight: -1000 + diffDays // More negative = higher priority
      };
    }

    // Rule 2: Due date = today -> DUE TODAY
    if (diffDays === 0) {
      return {
        statusCode: 'DUE_TODAY',
        label: '🔴 DUE TODAY',
        badgeClass: 'bg-rose-500 text-white border-rose-600 font-black animate-pulse shadow-xs',
        diffDays: 0,
        humanDiff: 'Due today! Immediate action required',
        isOverdue: false,
        isDueSoon: true,
        requiresAttention: true,
        urgencyWeight: 0
      };
    }

    // Rule 3: Tomorrow (1 day)
    if (diffDays === 1) {
      return {
        statusCode: 'DUE_TOMORROW',
        label: '🟠 DUE TOMORROW',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800 font-bold',
        diffDays: 1,
        humanDiff: 'Due tomorrow',
        isOverdue: false,
        isDueSoon: true,
        requiresAttention: true,
        urgencyWeight: 1
      };
    }

    // Rule 4: Within 7 days -> DUE THIS WEEK
    if (diffDays <= 7) {
      return {
        statusCode: 'DUE_THIS_WEEK',
        label: '🟠 DUE THIS WEEK',
        badgeClass: 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/80 dark:text-orange-200 dark:border-orange-800 font-bold',
        diffDays: diffDays,
        humanDiff: `Due in ${diffDays} days`,
        isOverdue: false,
        isDueSoon: true,
        requiresAttention: true,
        urgencyWeight: diffDays
      };
    }

    // Rule 5: Within 30 days -> DUE SOON
    if (diffDays <= 30) {
      return {
        statusCode: 'DUE_SOON',
        label: '🟡 DUE SOON',
        badgeClass: 'bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-950/80 dark:text-yellow-200 dark:border-yellow-800 font-bold',
        diffDays: diffDays,
        humanDiff: `Due in ${diffDays} days`,
        isOverdue: false,
        isDueSoon: true,
        requiresAttention: true,
        urgencyWeight: diffDays
      };
    }

    // Rule 6: Within 90 days -> UPCOMING
    if (diffDays <= 90) {
      return {
        statusCode: 'UPCOMING',
        label: '🔵 UPCOMING',
        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800 font-medium',
        diffDays: diffDays,
        humanDiff: `Due in ${Math.round(diffDays / 30)} months (${diffDays} days)`,
        isOverdue: false,
        isDueSoon: false,
        requiresAttention: false,
        urgencyWeight: diffDays
      };
    }

    // Rule 7: Greater than 90 days -> ACTIVE
    return {
      statusCode: 'ACTIVE',
      label: '🟢 ACTIVE',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800 font-medium',
      diffDays: diffDays,
      humanDiff: diffDays > 365 ? `Valid for ${Math.round(diffDays / 365)} years` : `Valid for ${Math.round(diffDays / 30)} months`,
      isOverdue: false,
      isDueSoon: false,
      requiresAttention: false,
      urgencyWeight: diffDays
    };
  },

  /**
   * Calculate aggregated metrics and summary counters for a set of renewals
   */
  calculateMetrics(renewalsList = []) {
    let overdueCount = 0;
    let dueTodayCount = 0;
    let dueThisWeekCount = 0;
    let dueSoonCount = 0;
    let upcomingCount = 0;
    let activeCount = 0;
    let attentionCount = 0;

    const enriched = renewalsList.map(item => {
      const status = this.calculateStatus(item);
      return { ...item, statusMeta: status };
    });

    // Sort by urgency: overdue first, then earliest due
    enriched.sort((a, b) => a.statusMeta.urgencyWeight - b.statusMeta.urgencyWeight);

    enriched.forEach(item => {
      const code = item.statusMeta.statusCode;
      if (code === 'OVERDUE') overdueCount++;
      else if (code === 'DUE_TODAY') dueTodayCount++;
      else if (code === 'DUE_TOMORROW' || code === 'DUE_THIS_WEEK') dueThisWeekCount++;
      else if (code === 'DUE_SOON') dueSoonCount++;
      else if (code === 'UPCOMING') upcomingCount++;
      else if (code === 'ACTIVE') activeCount++;

      if (item.statusMeta.requiresAttention) {
        attentionCount++;
      }
    });

    // Next renewal is the first non-overdue upcoming item (or first overdue if all overdue)
    const nextRenewal = enriched.find(item => item.statusMeta.diffDays >= 0) || enriched[0] || null;

    return {
      totalCount: enriched.length,
      overdueCount,
      dueTodayCount,
      dueThisWeekCount,
      dueSoonCount,
      upcomingCount,
      activeCount,
      attentionCount,
      nextRenewal,
      items: enriched
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RenewalCalculations;
}

