const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Use the multer middleware in controller for create and update
router.post("/", productController.createProduct);
router.post("/bulk", productController.createBulkProducts);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);
router.get("/barcode/:barcode", productController.getProductByBarcode);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;