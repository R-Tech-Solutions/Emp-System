const EmploymentStatus = require("../../models/system/employmentStatusModel");

exports.getEmploymentStatus = async (req, res) => {
  res.json(await EmploymentStatus.getAll());
};

exports.addEmploymentStatus = async (req, res) => {
  res.json(await EmploymentStatus.create(req.body));
};

exports.updateEmploymentStatus = async (req, res) => {
  await EmploymentStatus.update(req.params.id, req.body);
  res.send("Employment Status updated");
};

exports.deleteEmploymentStatus = async (req, res) => {
  await EmploymentStatus.delete(req.params.id);
  res.send("Employment Status deleted");
};
