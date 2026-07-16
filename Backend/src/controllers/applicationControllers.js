const applicationService = require("../services/application.service");

const getApplications = async (req, res) => {
  try {
    const { status, search, sortBy, order, page, limit } = req.query;
    const result = await applicationService.list(req.userId, { status, search, sortBy, order, page, limit });
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const application = await applicationService.getById(req.userId, req.params.id);
    if (!application) return res.status(404).json({ message: "application not found" });
    res.status(200).json(application);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

const postApplication = async (req, res) => {
  try {
    const { company, role, status, dateApplied, notes, resumeId } = req.body;
    if (!company || !role) {
      return res.status(400).json({ message: "company and role are required" });
    }

    const application = await applicationService.create(req.userId, {
      company, role, status, dateApplied, notes, resumeId,
    });
    res.status(201).json(application);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

const updateApplication = async (req, res) => {
  try {
    const { company, role, status, dateApplied, notes, resumeId } = req.body;
    const fields = {};
    if (company !== undefined) fields.company = company;
    if (role !== undefined) fields.role = role;
    if (status !== undefined) fields.status = status;
    if (dateApplied !== undefined) fields.date_applied = dateApplied;
    if (notes !== undefined) fields.notes = notes;
    if (resumeId !== undefined) fields.resume_id = resumeId;

    const application = await applicationService.update(req.userId, req.params.id, fields);
    if (!application) return res.status(404).json({ message: "application not found" });
    res.status(200).json(application);
  } catch (err) {
    console.log(err);
    const status = err.status || 500;
    res.status(status).json({ message: err.status ? err.message : "internal server error" });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const deleted = await applicationService.remove(req.userId, req.params.id);
    if (!deleted) return res.status(404).json({ message: "application not found" });
    res.status(204).send();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

module.exports = { getApplications, getApplicationById, postApplication, updateApplication, deleteApplication };
