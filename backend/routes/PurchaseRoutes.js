const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/PurchaseController");

// Create a new purchase
router.post("/", purchaseController.createPurchase);

// Get all purchases
router.get("/", purchaseController.getPurchases);

// Get a single purchase with product details
router.get("/:id", purchaseController.getPurchase);

module.exports = router;
