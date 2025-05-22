const COLLECTION_NAME = "products";

function productData({
  name,
  description,
  salesPrice,
  costPrice,
  sku,
  category,
  reference,
  internalNotes,
  productType,
  imageUrl,
  barcode,
  toWeighWithScale
}) {
  return {
    name,
    description,
    salesPrice: salesPrice || 0,
    costPrice: costPrice || 0,
    sku: sku || "",
    category: category || "General",
    reference: reference || "",
    internalNotes: internalNotes || "",
    productType: productType || "Goods",
    imageUrl: imageUrl || "",
    barcode: barcode || "",
    toWeighWithScale: !!toWeighWithScale,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = { COLLECTION_NAME, productData };