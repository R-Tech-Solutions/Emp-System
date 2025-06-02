const express = require("express");
const router = express.Router();
const cashbookController = require("../controllers/CashbookController");

// Get cashbook entries
router.get("/", cashbookController.getCashbookEntries);

module.exports = router; 