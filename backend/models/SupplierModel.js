const COLLECTION_NAME = "suppliers";

function supplierData({
  contactId,
  purchaseId,
  totalAmount,
  paidAmountTotal,
  paidAmountHistory,
  pendingAmount,
  status,
  createdAt,
  updatedAt
}) {
  return {
    contactId,
    purchaseId,
    totalAmount: totalAmount || 0,
    paidAmountTotal: paidAmountTotal || 0,
    paidAmountHistory: paidAmountHistory || [],
    pendingAmount: pendingAmount || totalAmount,
    status: status || (pendingAmount === 0 ? "Paid" : "Pending"),
    createdAt: createdAt || new Date().toISOString(),
    updatedAt: updatedAt || new Date().toISOString()
  };
}

// Helper function to calculate pending amount
function calculatePendingAmount(totalAmount, paidAmountTotal) {
  return Math.max(0, totalAmount - paidAmountTotal);
}

// Helper function to update payment history
function updatePaymentHistory(existingHistory, newPayment) {
  const payment = {
    id: newPayment.id || Date.now().toString(),
    amount: Number(newPayment.amount) || 0,
    method: newPayment.method || "cash",
    date: newPayment.date || new Date().toISOString(),
    purchaseId: newPayment.purchaseId,
    cardLast4: newPayment.cardLast4 || null
  };

  return [...(existingHistory || []), payment];
}

// Helper function to calculate total paid amount
function calculateTotalPaidAmount(paymentHistory) {
  if (!paymentHistory || !Array.isArray(paymentHistory)) return 0;
  return paymentHistory.reduce((sum, payment) => {
    const amount = Number(payment.amount) || 0;
    return amount > 0 ? sum + amount : sum;
  }, 0);
}

module.exports = {
  COLLECTION_NAME,
  supplierData,
  calculatePendingAmount,
  updatePaymentHistory,
  calculateTotalPaidAmount
};
