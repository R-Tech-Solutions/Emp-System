const express = require("express");
const router = express.Router();
const employmentStatusController = require("../../controllers/System/employmentStatusController");

router.get("/", employmentStatusController.getEmploymentStatus);
router.post("/", employmentStatusController.addEmploymentStatus);
router.put("/:id", employmentStatusController.updateEmploymentStatus);
router.delete("/:id", employmentStatusController.deleteEmploymentStatus);

module.exports = router;
