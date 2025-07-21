const express = require("express");
const router = express.Router();
const ReturnProcessController = require("../controllers/ReturnProcessController");

router.post("/process", ReturnProcessController.processReturns);
router.get("/processes", ReturnProcessController.getAllProcessedReturns);

module.exports = router;