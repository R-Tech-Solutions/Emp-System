const express = require("express");
const router = express.Router();
const supplierController = require('../controllers/SupplierController');

// Create a new supplier record
router.post("/", supplierController.createSupplier);

// Get all suppliers
router.get("/", supplierController.getSuppliers);

// Add payment to supplier
router.post("/payment/:purchaseId", supplierController.addPayment);

// Get supplier payment history
router.get("/payment-history/:purchaseId", supplierController.getPaymentHistory);

// Get supplier by ID (this should be last since it's a catch-all route)
router.get("/:id", supplierController.getSupplier);

module.exports = router;
