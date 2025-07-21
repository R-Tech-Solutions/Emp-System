const { db } = require("../firebaseConfig");
const SerialModel = require("../models/SerialModel");
const ImeiModel = require("../models/ImeiModel");
const InventoryModel = require("../models/InventoryModel");
const nodemailer = require("nodemailer");
const ReturnProcessModel = require("../models/ReturnProcessModel");

// Helper: update identifier as returned to supplier (removes damaged, sets returnedToSupplier)
async function markIdentifierReturned(type, sku, value) {
  const collection = type === "serial" ? "serial" : "imei";
  const doc = await db.collection(collection).doc(sku).get();
  if (!doc.exists) return;
  const data = doc.data();
  const updated = (data.identifiers || []).map(id => {
    const isMatch =
      (type === "serial" && (id.serial === value || id.value === value)) ||
      (type === "imei" && (id.imei === value || id.value === value));
    if (isMatch) {
      // Remove 'damaged', set 'returnedToSupplier: true'
      const { damaged, ...rest } = id;
      return { ...rest, returnedToSupplier: true };
    }
    return id;
  });
  await db.collection(collection).doc(sku).update({ identifiers: updated });
}

// Helper: log a return transaction in inventory (but do NOT update totalQuantity)
async function logReturnTransaction(sku, supplierEmail) {
  const inventoryRef = db.collection('inventory').doc(sku);
  const inventoryDoc = await inventoryRef.get();
  if (!inventoryDoc.exists) return;
  const data = inventoryDoc.data();
  const currentDate = new Date().toISOString();
  const transactions = [
    ...(data.transactions || []),
    {
      type: 'return',
      quantity: 1,
      date: currentDate,
      reference: null,
      supplierEmail: supplierEmail,
      description: `Returned 1 unit (damaged)`
    }
  ];
  await inventoryRef.update({ transactions });
}

exports.processReturns = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items to return." });
    }

    // Setup nodemailer (configure with your SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    for (const item of items) {
      // 1. Mark identifier as returned
      if (item.type === "serial" && item.serial) {
        await markIdentifierReturned("serial", item.product.sku, item.serial);
      } else if (item.type === "imei" && item.imei) {
        await markIdentifierReturned("imei", item.product.sku, item.imei);
      }

      // 2. Log a return transaction in inventory (do NOT update totalQuantity)
      await logReturnTransaction(item.product.sku, item.supplier?.email);

      // 3. Save to ReturnProcessModel
      await ReturnProcessModel.create({
        product: item.product,
        type: item.type,
        serial: item.serial,
        imei: item.imei,
        supplier: item.supplier,
        returnedAt: new Date().toISOString(),
        status: 'returned',
      });

      // 4. Send email to supplier
      if (item.supplier?.email) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: item.supplier.email,
          subject: "Product Return Notification",
          text: `Dear ${item.supplier.name || item.supplier.contactId},\n\nThe following product has been returned:\nProduct: ${item.product.name}\nSKU: ${item.product.sku}\nSerial/IMEI: ${item.serial || item.imei}\n\nThank you.`,
        });
      }
    }

    res.json({ message: "Returns processed, saved, and suppliers notified." });
  } catch (err) {
    console.error("Return processing error:", err);
    res.status(500).json({ error: err.message || "Failed to process returns." });
  }
};

exports.getAllProcessedReturns = async (req, res) => {
  try {
    const returns = await ReturnProcessModel.getAll();
    res.json(returns);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch processed returns." });
  }
};