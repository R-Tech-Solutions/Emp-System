const CertificateLevel = require("../../models/system/certificateLevelModel");

exports.getCertificateLevels = async (req, res) => {
  res.json(await CertificateLevel.getAll());
};

exports.addCertificateLevel = async (req, res) => {
  res.json(await CertificateLevel.create(req.body));
};

exports.updateCertificateLevel = async (req, res) => {
  await CertificateLevel.update(req.params.id, req.body);
  res.send("Certificate Level updated");
};

exports.deleteCertificateLevel = async (req, res) => {
  await CertificateLevel.delete(req.params.id);
  res.send("Certificate Level deleted");
};
