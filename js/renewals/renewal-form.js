/**
 * 🔔 RENEWALS & ALERTS - ADD / EDIT FORM CONTROLLER
 * Handles modal display, input validation, and record lifecycle persistence.
 */

const RenewalForm = {
  currentEditId: null,

  openAddModal() {
    this.currentEditId = null;
    const modal = document.getElementById('modal-renewal-form');
    const title = document.getElementById('renewal-form-title');
    const form = document.getElementById('form-renewal');
    if (!modal || !form) return;

    title.textContent = 'Add New Fleet Renewal';
    form.reset();

    // Default vehicle to current workspace vehicle if active
    const vInput = document.getElementById('renewal-input-vehicle');
    if (vInput) {
      vInput.value = appState.currentVehicle || 'TG15UE1122';
    }

    // Default reminder 30 days
    const remCheckboxes = document.querySelectorAll('input[name="renewal-reminders"]');
    remCheckboxes.forEach(cb => {
      cb.checked = (cb.value === '30');
    });

    modal.classList.remove('hidden');
  },

  openEditModal(renewalId) {
    const item = (appState.renewals || []).find(r => String(r.renewalId) === String(renewalId));
    if (!item) return;

    this.currentEditId = renewalId;
    const modal = document.getElementById('modal-renewal-form');
    const title = document.getElementById('renewal-form-title');
    if (!modal) return;

    title.textContent = `Edit Renewal: ${item.documentName} (${item.vehicleNo})`;

    document.getElementById('renewal-input-vehicle').value = item.vehicleNo || '';
    document.getElementById('renewal-input-category').value = item.category || 'Insurance';
    document.getElementById('renewal-input-docname').value = item.documentName || '';
    document.getElementById('renewal-input-duedate').value = RenewalCalculations.formatISODate(item.dueDate);
    document.getElementById('renewal-input-duration').value = (item.duration && item.duration !== '—') ? item.duration : '';
    document.getElementById('renewal-input-provider').value = (item.provider && item.provider !== '—') ? item.provider : '';
    document.getElementById('renewal-input-notes').value = item.notes || '';

    // Reminder checkboxes
    const daysArr = Array.isArray(item.reminderDays) ? item.reminderDays.map(String) : ['30'];
    const remCheckboxes = document.querySelectorAll('input[name="renewal-reminders"]');
    remCheckboxes.forEach(cb => {
      cb.checked = daysArr.includes(cb.value);
    });

    modal.classList.remove('hidden');
  },

  closeModal() {
    const modal = document.getElementById('modal-renewal-form');
    if (modal) modal.classList.add('hidden');
    this.currentEditId = null;
  },

  /**
   * Save handler (Add or Update)
   */
  async handleSave(e) {
    if (e) e.preventDefault();

    const vehicle = document.getElementById('renewal-input-vehicle')?.value?.trim().toUpperCase();
    const category = document.getElementById('renewal-input-category')?.value?.trim();
    const docName = document.getElementById('renewal-input-docname')?.value?.trim();
    const dueDateStr = document.getElementById('renewal-input-duedate')?.value?.trim();
    const duration = document.getElementById('renewal-input-duration')?.value?.trim() || '—';
    const provider = document.getElementById('renewal-input-provider')?.value?.trim() || '—';
    const notes = document.getElementById('renewal-input-notes')?.value?.trim() || '';

    // Selected reminders
    const selectedReminders = [];
    document.querySelectorAll('input[name="renewal-reminders"]:checked').forEach(cb => {
      selectedReminders.push(parseInt(cb.value, 10));
    });
    if (selectedReminders.length === 0) {
      selectedReminders.push(30); // Default to 30 days
    }
    selectedReminders.sort((a, b) => a - b);

    // Validation
    if (!vehicle) {
      alert("Please specify a Vehicle Number.");
      return;
    }
    if (!docName) {
      alert("Please specify a Document / Renewal Name.");
      return;
    }
    if (!dueDateStr) {
      alert("Please select a valid Due Date.");
      return;
    }

    const parsedDue = RenewalCalculations.parseDate(dueDateStr);
    if (!parsedDue) {
      alert("The selected Due Date is invalid.");
      return;
    }

    const todayISO = new Date().toISOString().slice(0, 10);
    const currentUser = (appState.currentUser ? appState.currentUser.username : 'admin');

    if (this.currentEditId) {
      // UPDATE EXISTING
      const idx = (appState.renewals || []).findIndex(r => String(r.renewalId) === String(this.currentEditId));
      if (idx !== -1) {
        const existing = appState.renewals[idx];
        const updated = {
          ...existing,
          vehicleNo: vehicle,
          category: category,
          documentName: docName,
          dueDate: dueDateStr,
          duration: duration,
          provider: provider,
          reminderDays: selectedReminders,
          notes: notes,
          updatedDate: todayISO
        };
        appState.renewals[idx] = updated;

        Renewals.persistState();
        this.closeModal();
        Renewals.render();
        Utils.showToast(`✅ Renewal record updated for ${vehicle}!`, 'success');

        // Cloud sync
        try {
          if (typeof Api !== 'undefined' && typeof Api.post === 'function') {
            await Api.post('updateRenewal', updated);
          }
        } catch (err) {
          console.warn("[RenewalForm] updateRenewal cloud note:", err);
        }
      }
    } else {
      // ADD NEW
      const newId = `REN-${vehicle.replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
      const newRecord = {
        renewalId: newId,
        vehicleNo: vehicle,
        category: category,
        documentName: docName,
        dueDate: dueDateStr,
        duration: duration,
        provider: provider,
        reminderDays: selectedReminders,
        notes: notes,
        createdDate: todayISO,
        updatedDate: todayISO,
        createdBy: currentUser
      };

      if (!Array.isArray(appState.renewals)) {
        appState.renewals = [];
      }
      appState.renewals.unshift(newRecord);

      Renewals.persistState();
      this.closeModal();
      Renewals.render();
      Utils.showToast(`✅ New renewal added for ${vehicle}!`, 'success');

      // Cloud sync
      try {
        if (typeof Api !== 'undefined' && typeof Api.post === 'function') {
          await Api.post('addRenewal', newRecord);
        }
      } catch (err) {
        console.warn("[RenewalForm] addRenewal cloud note:", err);
      }
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RenewalForm;
}

