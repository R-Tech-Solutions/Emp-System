const COLLECTION_NAME = "purchases";

function purchaseData({
  purchaseId,
  customerName,
  customerEmail,
  items,
  subtotal,
  total,
  paymentMethod,
  paymentStatus,
  createdAt,
  productIds,
  numberOfProducts
}) {
  return {
    purchaseId,
    customerName,
    customerEmail,
    items,
    subtotal: subtotal || 0,
    total: total || 0,
    paymentMethod,
    paymentStatus: paymentStatus || (paymentMethod === "Cash" ? "Paid by Cash" : "Debited to Supplier Account"),
    createdAt: createdAt || new Date().toISOString(),
    productIds,
    numberOfProducts
  };
}

module.exports = { COLLECTION_NAME, purchaseData };
