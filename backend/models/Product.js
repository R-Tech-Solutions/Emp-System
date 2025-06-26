const COLLECTION_NAME = "products";

function productData({
  name,
  description,
  salesPrice,
  salesPricePercent,
  costPrice,
  sku,
  category,
  reference,
  internalNotes,
  productType,
  imageUrl,
  barcode,
  toWeighWithScale,
  marginPrice,
  marginPricePercent,
  retailPrice,
  retailPricePercent,
  productIdentifierType,
}) {
  // Convert string "true"/"false" to boolean
  let weighWithScaleBool = false;
  if (typeof toWeighWithScale === "string") {
    weighWithScaleBool = toWeighWithScale === "true";
  } else {
    weighWithScaleBool = !!toWeighWithScale;
  }

  // Helper to round to 2 decimals
  function round2(val) {
    return Math.round((parseFloat(val) + Number.EPSILON) * 100) / 100;
  }

  return {
    name,
    description,
    salesPrice: round2(salesPrice || 0),
    salesPricePercent: salesPricePercent || 0,
    costPrice: round2(costPrice || 0),
    sku: String(sku || ""),
    category: category || "General",
    reference: reference || "",
    internalNotes: internalNotes || "",
    productType: productType || "Goods",
    imageUrl: imageUrl || "",
    barcode: String(barcode || ""),
    toWeighWithScale: weighWithScaleBool, // always boolean, default false
    marginPrice: round2(marginPrice || 0),
    marginPricePercent: marginPricePercent || 0,
    retailPrice: round2(retailPrice || 0),
    retailPricePercent: retailPricePercent || 0,
    productIdentifierType: productIdentifierType || "none", // default to none
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = { COLLECTION_NAME, productData };