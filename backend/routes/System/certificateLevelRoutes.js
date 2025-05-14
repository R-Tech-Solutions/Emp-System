const express = require("express");
const router = express.Router();
const certificateLevelController = require("../../controllers/System/certificateLevelController");

router.get("/", certificateLevelController.getCertificateLevels);
router.post("/", certificateLevelController.addCertificateLevel);
router.put("/:id", certificateLevelController.updateCertificateLevel);
router.delete("/:id", certificateLevelController.deleteCertificateLevel);

module.exports = router;
