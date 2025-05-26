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
  quantity,
}) {
  // Convert string "true"/"false" to boolean
  let weighWithScaleBool = false;
  if (typeof toWeighWithScale === "string") {
    weighWithScaleBool = toWeighWithScale === "true";
  } else {
    weighWithScaleBool = !!toWeighWithScale;
  }

  return {
    name,
    description,
    salesPrice: salesPrice || 0,
    salesPricePercent: salesPricePercent || 0,
    costPrice: costPrice || 0,
    sku: sku || "",
    category: category || "General",
    reference: reference || "",
    internalNotes: internalNotes || "",
    productType: productType || "Goods",
    imageUrl: imageUrl || "",
    barcode: barcode || "",
    toWeighWithScale: weighWithScaleBool, // always boolean, default false
    marginPrice: marginPrice || 0,
    marginPricePercent: marginPricePercent || 0,
    retailPrice: retailPrice || 0,
    retailPricePercent: retailPricePercent || 0,
    quantity: quantity || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = { COLLECTION_NAME, productData };