const express = require("express");
const router = express.Router();
const departmentController = require("../../controllers/system/departmentController");
const EmployeeController = require('../../controllers/employee/employeeController');

router.get("/", departmentController.getDepartments);
router.post("/", departmentController.addDepartment);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);
// router.get('/with-employee-count', EmployeeController.getDepartmentsWithEmployeeCount);

module.exports = router;
