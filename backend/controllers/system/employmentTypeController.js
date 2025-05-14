const EmploymentType = require("../../models/system/employmentTypeModel");

exports.getEmploymentTypes = async (req, res) => {
  res.json(await EmploymentType.getAll());
};

exports.addEmploymentType = async (req, res) => {
  try {
    const created = await EmploymentType.create(req.body);
    res.json(created); // Return created data
  } catch (error) {
    res.status(500).send("Error adding Employment Type");
  }
};

exports.updateEmploymentType = async (req, res) => {
  try {
    const updated = await EmploymentType.update(req.params.id, req.body);
    res.json(updated); // Return updated data
  } catch (error) {
    res.status(500).send("Error updating Employment Type");
  }
};

exports.deleteEmploymentType = async (req, res) => {
  await EmploymentType.delete(req.params.id);
  res.send("Employment Type deleted");
};
