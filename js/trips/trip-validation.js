/**
 * LORRY FREIGHT MANAGEMENT SYSTEM - TRIP VALIDATION
 * Version: 2.4.2
 */

const TripValidation = {
  validate(data) {
    const errors = [];

    if (!data.tripDate) errors.push("Trip Date is required.");
    if (!data.vehicleNo) errors.push("Vehicle Number is required.");
    if (!data.from || !data.from.trim()) errors.push("Origin 'From' location is required.");
    if (!data.to || !data.to.trim()) errors.push("Destination 'To' location is required.");

    const freight = Number(data.freightAmount || data.freight) || 0;
    const advance = Number(data.advanceAmount || data.advance) || 0;

    if (freight < 0) errors.push("Freight Amount cannot be negative.");
    if (advance < 0) errors.push("Advance Amount cannot be negative.");
    if (advance > freight) {
      errors.push(`Advance amount (₹${advance}) cannot exceed Freight amount (₹${freight}).`);
    }

    const expenseFields = [
      { name: 'Diesel', val: data.diesel },
      { name: 'Toll Charges', val: data.tollCharges || data.toll },
      { name: 'RTA C/P', val: data.rtaExp || data.rta },
      { name: 'Police Exp', val: data.policeExp || data.police },
      { name: 'Loading Charges', val: data.loadingCharges || data.loading },
      { name: 'Unloading Charges', val: data.unloadingCharges || data.unloading },
      { name: 'Driver Trip Expense', val: data.driverExp || data.driverCommission },
      { name: 'TRSP Commission', val: data.trspCommission },
      { name: 'Other Expenses', val: data.otherExpenses || data.other }
    ];

    expenseFields.forEach(ef => {
      const val = Number(ef.val) || 0;
      if (val < 0) errors.push(`Expense "${ef.name}" cannot be negative.`);
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TripValidation;
}

