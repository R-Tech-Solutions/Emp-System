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
  imageUrl
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = { COLLECTION_NAME, productData };