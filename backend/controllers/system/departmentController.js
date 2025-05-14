const Department = require("../../models/system/departmentModel");

exports.getDepartments = async (req, res) => {
  res.json(await Department.getAll());
};

exports.addDepartment = async (req, res) => {
  res.json(await Department.create(req.body));
};

exports.updateDepartment = async (req, res) => {
  await Department.update(req.params.id, req.body);
  res.send("Department updated");
};

exports.deleteDepartment = async (req, res) => {
  await Department.delete(req.params.id);
  res.send("Department deleted");
};
