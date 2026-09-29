/**
 * 🔔 RENEWALS & ALERTS - MASTER MODULE CONTROLLER
 * Manages fleet document lifecycles, compliance alerts, reminders, and cloud synchronization.
 */

const Renewals = {
  STORAGE_KEY: 'lorry_renewals_v1',

  CANONICAL_RENEWALS: [
    // 1. TG15G1122
    {
      renewalId: 'REN-TG15G1122-01',
      vehicleNo: 'TG15G1122',
      category: 'Insurance',
      documentName: 'Car Insurance',
      dueDate: '2028-03-16',
      duration: '2 Years',
      provider: 'TATA AIG',
      reminderDays: [30],
      notes: 'Comprehensive 2-year package',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15G1122-02',
      vehicleNo: 'TG15G1122',
      category: 'Insurance',
      documentName: 'Third Party',
      dueDate: '2028-03-16',
      duration: '—',
      provider: 'TATA AIG',
      reminderDays: [30],
      notes: 'Mandatory third party liability',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15G1122-03',
      vehicleNo: 'TG15G1122',
      category: 'Pollution',
      documentName: 'Pollution',
      dueDate: '2027-06-21',
      duration: '—',
      provider: 'RTA Certified Center',
      reminderDays: [15, 30],
      notes: 'PUC emission clearance certificate',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },

    // 2. TG15C2324
    {
      renewalId: 'REN-TG15C2324-01',
      vehicleNo: 'TG15C2324',
      category: 'Insurance',
      documentName: 'Bike Insurance',
      dueDate: '2026-09-05',
      duration: '—',
      provider: '—',
      reminderDays: [7, 15, 30],
      notes: 'not renewel - Requires immediate renewal',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15C2324-02',
      vehicleNo: 'TG15C2324',
      category: 'Insurance',
      documentName: 'Third Party',
      dueDate: '2029-09-05',
      duration: '—',
      provider: 'TATA AIG',
      reminderDays: [30],
      notes: 'Long-term policy',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15C2324-03',
      vehicleNo: 'TG15C2324',
      category: 'Pollution',
      documentName: 'Pollution',
      dueDate: '2027-09-28',
      duration: '—',
      provider: '—',
      reminderDays: [15, 30],
      notes: 'PUC emission certificate',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },

    // 3. TG15UE1122 (Also matches active fleet TS15UE1122)
    {
      renewalId: 'REN-TG15UE1122-01',
      vehicleNo: 'TG15UE1122',
      category: 'RC',
      documentName: 'RC',
      dueDate: '2027-01-30',
      duration: '—',
      provider: 'Telangana RTA',
      reminderDays: [30, 60],
      notes: 'Registration Certificate book verification',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15UE1122-02',
      vehicleNo: 'TG15UE1122',
      category: 'Permit',
      documentName: 'State Permit',
      dueDate: '2031-02-13',
      duration: '5 Years',
      provider: 'State Transport Authority',
      reminderDays: [30, 60],
      notes: 'Telangana State Heavy Freight Permit',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15UE1122-03',
      vehicleNo: 'TG15UE1122',
      category: 'Permit',
      documentName: 'National Permit',
      dueDate: '2027-02-14',
      duration: '1 Year',
      provider: 'MoRTH',
      reminderDays: [15, 30],
      notes: 'All India Tourist / Cargo Permit (NP)',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15UE1122-04',
      vehicleNo: 'TG15UE1122',
      category: 'Insurance',
      documentName: 'Insurance',
      dueDate: '2027-01-29',
      duration: '1 Year',
      provider: 'National Insurance / TATA AIG',
      reminderDays: [15, 30],
      notes: 'Commercial vehicle comprehensive cover',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15UE1122-05',
      vehicleNo: 'TG15UE1122',
      category: 'Pollution',
      documentName: 'Pollution',
      dueDate: '2027-09-28',
      duration: '1 Year',
      provider: 'Authorized Emission Testing',
      reminderDays: [15, 30],
      notes: 'PUC smoke test check',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15UE1122-06',
      vehicleNo: 'TG15UE1122',
      category: 'Tax',
      documentName: 'Quarterly Tax',
      dueDate: '2026-09-30',
      duration: 'Quarterly',
      provider: 'Telangana Motor Vehicle Tax',
      reminderDays: [1, 7, 15, 30],
      notes: 'Quarter ending Sep 2026 - Due tomorrow!',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15UE1122-07',
      vehicleNo: 'TG15UE1122',
      category: 'Tax',
      documentName: 'Next Tax',
      dueDate: '2026-12-31',
      duration: 'Quarterly',
      provider: 'Telangana Motor Vehicle Tax',
      reminderDays: [15, 30],
      notes: 'Q3 Tax installment',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15UE1122-08',
      vehicleNo: 'TG15UE1122',
      category: 'Tax',
      documentName: 'Next Tax',
      dueDate: '2027-03-31',
      duration: 'Quarterly',
      provider: 'Telangana Motor Vehicle Tax',
      reminderDays: [15, 30],
      notes: 'Q4 Tax installment',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15UE1122-09',
      vehicleNo: 'TG15UE1122',
      category: 'Tax',
      documentName: 'Next Tax',
      dueDate: '2027-06-30',
      duration: 'Quarterly',
      provider: 'Telangana Motor Vehicle Tax',
      reminderDays: [15, 30],
      notes: 'Q1 Tax installment 2027-28',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15UE1122-10',
      vehicleNo: 'TG15UE1122',
      category: 'Tax',
      documentName: 'Next Tax',
      dueDate: '2027-09-30',
      duration: 'Quarterly',
      provider: 'Telangana Motor Vehicle Tax',
      reminderDays: [15, 30],
      notes: 'Q2 Tax installment 2027-28',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15UE1122-11',
      vehicleNo: 'TG15UE1122',
      category: 'Fitness',
      documentName: 'Fitness',
      dueDate: '2027-01-16',
      duration: '1 Year',
      provider: 'RTA Inspection Ground',
      reminderDays: [30, 60],
      notes: 'Annual fitness certificate inspection',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },

    // 4. TG15T6666
    {
      renewalId: 'REN-TG15T6666-01',
      vehicleNo: 'TG15T6666',
      category: 'RC',
      documentName: 'RC',
      dueDate: '2027-01-30',
      duration: '—',
      provider: 'Telangana RTA',
      reminderDays: [30, 60],
      notes: 'Registration certificate validation',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15T6666-02',
      vehicleNo: 'TG15T6666',
      category: 'Permit',
      documentName: 'State Permit',
      dueDate: '2030-02-02',
      duration: '5 Years',
      provider: 'State Transport Authority',
      reminderDays: [30, 60],
      notes: 'State Goods Carriage Permit',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15T6666-03',
      vehicleNo: 'TG15T6666',
      category: 'Permit',
      documentName: 'National Permit',
      dueDate: '2027-02-02',
      duration: '1 Year',
      provider: 'MoRTH',
      reminderDays: [15, 30],
      notes: 'National Permit authorization',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15T6666-04',
      vehicleNo: 'TG15T6666',
      category: 'Insurance',
      documentName: 'Insurance',
      dueDate: '2027-01-08',
      duration: '1 Year',
      provider: 'Commercial Fleet Cover',
      reminderDays: [15, 30],
      notes: 'Fleet transit & third party insurance',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15T6666-05',
      vehicleNo: 'TG15T6666',
      category: 'Pollution',
      documentName: 'Pollution',
      dueDate: '2027-09-28',
      duration: '1 Year',
      provider: 'Authorized Emission Testing',
      reminderDays: [15, 30],
      notes: 'PUC emission clearance',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15T6666-06',
      vehicleNo: 'TG15T6666',
      category: 'Tax',
      documentName: 'Quarterly Tax',
      dueDate: '2026-09-30',
      duration: 'Quarterly',
      provider: 'Telangana Motor Vehicle Tax',
      reminderDays: [1, 7, 15, 30],
      notes: 'Quarterly road tax - Due tomorrow!',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15T6666-07',
      vehicleNo: 'TG15T6666',
      category: 'Tax',
      documentName: 'Next Tax',
      dueDate: '2026-12-31',
      duration: 'Quarterly',
      provider: 'Telangana Motor Vehicle Tax',
      reminderDays: [15, 30],
      notes: 'Q3 Tax installment',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15T6666-08',
      vehicleNo: 'TG15T6666',
      category: 'Tax',
      documentName: 'Next Tax',
      dueDate: '2027-03-31',
      duration: 'Quarterly',
      provider: 'Telangana Motor Vehicle Tax',
      reminderDays: [15, 30],
      notes: 'Q4 Tax installment',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15T6666-09',
      vehicleNo: 'TG15T6666',
      category: 'Tax',
      documentName: 'Next Tax',
      dueDate: '2027-06-30',
      duration: 'Quarterly',
      provider: 'Telangana Motor Vehicle Tax',
      reminderDays: [15, 30],
      notes: 'Q1 Tax installment 2027-28',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15T6666-10',
      vehicleNo: 'TG15T6666',
      category: 'Tax',
      documentName: 'Next Tax',
      dueDate: '2027-09-30',
      duration: 'Quarterly',
      provider: 'Telangana Motor Vehicle Tax',
      reminderDays: [15, 30],
      notes: 'Q2 Tax installment 2027-28',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    },
    {
      renewalId: 'REN-TG15T6666-11',
      vehicleNo: 'TG15T6666',
      category: 'Fitness',
      documentName: 'Fitness',
      dueDate: '2027-01-29',
      duration: '1 Year',
      provider: 'RTA Inspection Ground',
      reminderDays: [30, 60],
      notes: 'Annual fitness certificate inspection',
      createdDate: '2026-09-29',
      updatedDate: '2026-09-29',
      createdBy: 'admin'
    }
  ],

  /**
   * Filter and state container
   */
  filters: {
    vehicle: 'ALL',
    category: 'ALL',
    status: 'ALL',
    search: ''
  },

  /**
   * Initialize local renewals dataset
   */
  loadFromLocal() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          appState.renewals = parsed;
          return;
        }
      }
    } catch (_) {}

    // Seed canonical baseline
    appState.renewals = JSON.parse(JSON.stringify(this.CANONICAL_RENEWALS));
    this.persistState();
  },

  /**
   * Save current renewals to localStorage
   */
  persistState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(appState.renewals || []));
    } catch (_) {}
    this.updateNotificationBadges();
  },

  /**
   * Fetch latest renewals from cloud or seed if empty
   */
  async loadCloudRenewals() {
    this.loadFromLocal();
    try {
      if (typeof Api !== 'undefined' && typeof Api.getRenewals === 'function') {
        const res = await Api.getRenewals();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          appState.renewals = res.data;
          this.persistState();
        } else if (res && res.success && (!res.data || res.data.length === 0)) {
          // Cloud sheet is empty -> push local renewals to cloud
          this.seedCloudFromLocal();
        }
      }
    } catch (err) {
      console.warn("[Renewals] Cloud sync fallback to local storage:", err);
    }

    this.updateNotificationBadges();
    if (appState.currentPage === 'renewals') {
      this.render();
    }
  },

  /**
   * Push baseline records to Google Sheet if newly created
   */
  async seedCloudFromLocal() {
    if (!Array.isArray(appState.renewals) || appState.renewals.length === 0) return;
    try {
      if (typeof Api !== 'undefined' && typeof Api.post === 'function') {
        await Api.post('seedRenewals', { renewals: appState.renewals });
      }
    } catch (_) {}
  },

  /**
   * Update notification badges across Header and Sidebar Menu
   */
  updateNotificationBadges() {
    const metrics = RenewalCalculations.calculateMetrics(appState.renewals || []);
    const attentionCount = metrics.attentionCount;

    // Header Bell Badge
    const headerBell = document.getElementById('header-renewal-badge');
    const headerBellBtn = document.getElementById('header-renewal-bell-btn');
    if (headerBell) {
      if (attentionCount > 0) {
        headerBell.textContent = String(attentionCount);
        headerBell.classList.remove('hidden');
      } else {
        headerBell.classList.add('hidden');
      }
    }

    // Menu Drawer Badge
    const drawerBadge = document.getElementById('drawer-renewal-badge');
    if (drawerBadge) {
      if (attentionCount > 0) {
        drawerBadge.innerHTML = `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">🔴 ${attentionCount}</span>`;
      } else {
        drawerBadge.innerHTML = '';
      }
    }
  },

  /**
   * Main Render Method for #view-renewals
   */
  render() {
    const container = document.getElementById('view-renewals');
    if (!container) return;

    this.loadFromLocal();
    const metrics = RenewalCalculations.calculateMetrics(appState.renewals || []);
    const isAdmin = Auth.isAdmin();

    // Collect unique vehicle numbers for filter dropdown
    const allVehicles = Array.from(new Set((appState.renewals || []).map(r => r.vehicleNo))).sort();
    const allCategories = ['Insurance', 'Tax', 'Permit', 'Pollution', 'Fitness', 'RC', 'Other'];

    container.innerHTML = `
      <div class="max-w-7xl mx-auto space-y-6">

        <!-- 1. Header Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-1.5">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
              <span>🔔</span>
              <span>FLEET COMPLIANCE & EXPIRATION MONITOR</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">Renewals & Document Alerts</h2>
            <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track vehicle insurance, quarterly taxes, fitness, pollution, and national permits with automated countdowns and multi-user alerts.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onclick="RenewalForm.openAddModal()" 
              class="px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer">
              <span>➕</span>
              <span>Add Renewal</span>
            </button>
            <button 
              onclick="Renewals.loadCloudRenewals(); Utils.showToast('🔄 Synchronized renewals with cloud!');" 
              class="px-4 py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold rounded-2xl text-xs border border-white/15 transition flex items-center gap-2 cursor-pointer">
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <!-- 2. Next Renewal Hero Card (if exists) -->
        ${metrics.nextRenewal ? `
          <div class="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-md border-2 ${metrics.nextRenewal.statusMeta.isOverdue ? 'border-rose-500 bg-rose-50/20' : metrics.nextRenewal.statusMeta.isDueSoon ? 'border-amber-500 bg-amber-50/20' : 'border-indigo-500/40'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="p-3.5 rounded-2xl ${metrics.nextRenewal.statusMeta.isOverdue ? 'bg-rose-500 text-white' : metrics.nextRenewal.statusMeta.isDueSoon ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'} text-2xl font-black shadow-md">
                ${metrics.nextRenewal.statusMeta.isOverdue ? '🚨' : '🔔'}
              </div>
              <div>
                <span class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">NEXT CRITICAL RENEWAL</span>
                <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <span class="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">${metrics.nextRenewal.vehicleNo}</span>
                  <span>&bull;</span>
                  <span>${metrics.nextRenewal.documentName}</span>
                </h3>
                <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Due: <strong class="font-bold">${RenewalCalculations.formatDate(metrics.nextRenewal.dueDate)}</strong> &bull; 
                  <span class="font-bold ${metrics.nextRenewal.statusMeta.isOverdue ? 'text-rose-600' : 'text-amber-600'}">${metrics.nextRenewal.statusMeta.humanDiff}</span>
                  ${metrics.nextRenewal.provider ? ` &bull; Provider: <em>${metrics.nextRenewal.provider}</em>` : ''}
                </p>
              </div>
            </div>
            <button 
              onclick="Renewals.openViewModal('${metrics.nextRenewal.renewalId}')" 
              class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer self-stretch sm:self-auto text-center">
              View Details &rarr;
            </button>
          </div>
        ` : ''}

        <!-- 3. Key Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          <!-- Overdue Card -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-rose-200 dark:border-rose-900/40 relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">OVERDUE</span>
              <span class="text-xl">🔴</span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">${metrics.overdueCount}</div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Requires immediate renewal</p>
          </div>

          <!-- Due Today / This Week -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-amber-200 dark:border-amber-900/40 relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">DUE THIS WEEK</span>
              <span class="text-xl">🟠</span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">${metrics.dueTodayCount + metrics.dueThisWeekCount}</div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Due within 7 days</p>
          </div>

          <!-- Due Soon (Within 30 Days) -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-yellow-200 dark:border-yellow-900/40 relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-black text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">DUE IN 30 DAYS</span>
              <span class="text-xl">🟡</span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-yellow-600 dark:text-yellow-400 font-mono">${metrics.dueSoonCount}</div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Urgent reminder scope</p>
          </div>

          <!-- Upcoming (31 - 90 Days) -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-blue-200 dark:border-blue-900/40 relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">UPCOMING</span>
              <span class="text-xl">🔵</span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">${metrics.upcomingCount}</div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Within 90 days</p>
          </div>

          <!-- Active & Valid -->
          <div class="col-span-2 sm:col-span-4 lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-emerald-200 dark:border-emerald-900/40 relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">ACTIVE / COMPLIANT</span>
              <span class="text-xl">🟢</span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">${metrics.activeCount}</div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Compliant &gt; 90 days</p>
          </div>
        </div>

        <!-- 4. Interactive Filter Bar -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
            <!-- Vehicle Filter -->
            <div class="flex items-center gap-1.5 text-xs">
              <label for="filter-renewal-vehicle" class="font-bold text-slate-600 dark:text-slate-300">Vehicle:</label>
              <select 
                id="filter-renewal-vehicle" 
                onchange="Renewals.filters.vehicle = this.value; RenewalTable.render();"
                class="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option value="ALL">All Vehicles (${metrics.totalCount})</option>
                ${allVehicles.map(v => `<option value="${v}" ${this.filters.vehicle === v ? 'selected' : ''}>${v}</option>`).join('')}
              </select>
            </div>

            <!-- Category Filter -->
            <div class="flex items-center gap-1.5 text-xs">
              <label for="filter-renewal-category" class="font-bold text-slate-600 dark:text-slate-300">Category:</label>
              <select 
                id="filter-renewal-category" 
                onchange="Renewals.filters.category = this.value; RenewalTable.render();"
                class="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option value="ALL">All Categories</option>
                ${allCategories.map(c => `<option value="${c}" ${this.filters.category === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>

            <!-- Status Filter -->
            <div class="flex items-center gap-1.5 text-xs">
              <label for="filter-renewal-status" class="font-bold text-slate-600 dark:text-slate-300">Status:</label>
              <select 
                id="filter-renewal-status" 
                onchange="Renewals.filters.status = this.value; RenewalTable.render();"
                class="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option value="ALL">All Statuses</option>
                <option value="OVERDUE" ${this.filters.status === 'OVERDUE' ? 'selected' : ''}>🔴 Overdue Only (${metrics.overdueCount})</option>
                <option value="DUE_SOON" ${this.filters.status === 'DUE_SOON' ? 'selected' : ''}>🟠 / 🟡 Due Soon (${metrics.dueTodayCount + metrics.dueThisWeekCount + metrics.dueSoonCount})</option>
                <option value="UPCOMING" ${this.filters.status === 'UPCOMING' ? 'selected' : ''}>🔵 Upcoming (${metrics.upcomingCount})</option>
                <option value="ACTIVE" ${this.filters.status === 'ACTIVE' ? 'selected' : ''}>🟢 Active (${metrics.activeCount})</option>
              </select>
            </div>
          </div>

          <!-- Search Input -->
          <div class="relative w-full sm:w-64">
            <input 
              type="text" 
              id="filter-renewal-search" 
              placeholder="Search document or provider..." 
              value="${this.filters.search || ''}"
              oninput="Renewals.filters.search = this.value; RenewalTable.render();"
              class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          </div>
        </div>

        <!-- 5. Renewal Table Container -->
        <div id="renewal-table-container" class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <!-- Rendered dynamically by RenewalTable.render() -->
        </div>

      </div>
    `;

    // Trigger table rendering
    RenewalTable.render();
  },

  /**
   * Open dedicated View Modal for a renewal record
   */
  openViewModal(renewalId) {
    const item = (appState.renewals || []).find(r => String(r.renewalId) === String(renewalId));
    if (!item) return;

    const modal = document.getElementById('modal-renewal-view');
    const container = document.getElementById('renewal-view-content');
    if (!modal || !container) return;

    const status = RenewalCalculations.calculateStatus(item);

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Header Banner -->
        <div class="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-300 text-[10px] font-mono font-bold uppercase mb-2">
              <span>${item.category || 'General'}</span> &bull; <span>${item.renewalId}</span>
            </div>
            <h3 class="text-2xl font-black text-white">${item.documentName}</h3>
            <p class="text-xs text-slate-300 font-mono mt-1">Vehicle: <strong class="text-white text-sm">${item.vehicleNo}</strong></p>
          </div>
          <div>
            <span class="inline-flex px-3.5 py-1.5 rounded-xl border text-xs font-black ${status.badgeClass}">
              ${status.label}
            </span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] font-bold uppercase text-slate-400 block mb-1">Due Date</span>
            <div class="text-base font-black text-slate-900 dark:text-white font-mono">${RenewalCalculations.formatDate(item.dueDate)}</div>
            <div class="text-[11px] font-semibold text-slate-500 mt-1">${status.humanDiff}</div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] font-bold uppercase text-slate-400 block mb-1">Provider / Authority</span>
            <div class="text-sm font-bold text-slate-900 dark:text-white">${item.provider || '—'}</div>
            <div class="text-[11px] text-slate-400 mt-1">Duration: ${item.duration || '—'}</div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] font-bold uppercase text-slate-400 block mb-1">Reminder Schedule</span>
            <div class="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              ${Array.isArray(item.reminderDays) ? item.reminderDays.map(d => `${d} Days Before`).join(', ') : '30 Days Before'}
            </div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] font-bold uppercase text-slate-400 block mb-1">Audit Tracking</span>
            <div class="text-[11px] text-slate-600 dark:text-slate-300">Created: ${RenewalCalculations.formatDate(item.createdDate)} &bull; By: ${item.createdBy || 'Admin'}</div>
            <div class="text-[11px] text-slate-400 mt-0.5">Last Updated: ${RenewalCalculations.formatDate(item.updatedDate)}</div>
          </div>
        </div>

        <!-- Notes -->
        ${item.notes ? `
          <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs">
            <span class="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300 block mb-1">Notes & Instructions</span>
            <p class="text-amber-900 dark:text-amber-200 leading-relaxed font-medium">${item.notes}</p>
          </div>
        ` : ''}

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <button 
            onclick="Renewals.closeViewModal(); RenewalForm.openEditModal('${item.renewalId}')" 
            class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer">
            ✏️ Edit Record
          </button>
          <button 
            onclick="Renewals.closeViewModal()" 
            class="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs rounded-xl transition cursor-pointer">
            Close
          </button>
        </div>

      </div>
    `;

    modal.classList.remove('hidden');
  },

  closeViewModal() {
    const modal = document.getElementById('modal-renewal-view');
    if (modal) modal.classList.add('hidden');
  },

  /**
   * Delete renewal record (Admin only)
   */
  async deleteRenewal(renewalId) {
    if (typeof Auth !== 'undefined' && typeof Auth.canDelete === 'function' ? !Auth.canDelete() : !Auth.isAdmin()) {
      alert("Delete operation not permitted.\n\nRudra can add and edit records but cannot delete them.");
      return;
    }

    const item = (appState.renewals || []).find(r => String(r.renewalId) === String(renewalId));
    if (!item) return;

    if (!confirm(`Are you sure you want to permanently delete renewal record '${item.documentName}' for vehicle ${item.vehicleNo}?`)) {
      return;
    }

    appState.renewals = (appState.renewals || []).filter(r => String(r.renewalId) !== String(renewalId));
    this.persistState();
    this.render();

    Utils.showToast(`🗑️ Renewal record for ${item.vehicleNo} removed.`, 'warning');

    // Cloud sync
    try {
      if (typeof Api !== 'undefined' && typeof Api.post === 'function') {
        await Api.post('deleteRenewal', { renewalId: renewalId });
      }
    } catch (err) {
      console.warn("[Renewals] deleteRenewal cloud note:", err);
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Renewals;
}

