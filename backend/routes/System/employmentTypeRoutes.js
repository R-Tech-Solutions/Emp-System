const express = require("express");
const router = express.Router();
const employmentTypeController = require("../../controllers/System/employmentTypeController");

router.get("/", employmentTypeController.getEmploymentTypes);
router.post("/", employmentTypeController.addEmploymentType);
router.put("/:id", employmentTypeController.updateEmploymentType);
router.delete("/:id", employmentTypeController.deleteEmploymentType);

module.exports = router;
