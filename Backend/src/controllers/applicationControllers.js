const applicationService = require("../services/application.service");
const asyncHandler = require("../utils/asyncHandler");

const getApplications = asyncHandler(async (req, res) => {
  const { status, search, sortBy, order, page, limit } = req.query;
  const result = await applicationService.list(req.userId, { status, search, sortBy, order, page, limit });
  res.status(200).json(result);
});

const getApplicationById = asyncHandler(async (req, res) => {
  const application = await applicationService.getById(req.userId, req.params.id);
  if (!application) return res.status(404).json({ message: "application not found" });
  res.status(200).json(application);
});

const postApplication = asyncHandler(async (req, res) => {
  const { company, role, status, dateApplied, notes, resumeId } = req.body;
  if (!company || !role) {
    return res.status(400).json({ message: "company and role are required" });
  }

  const application = await applicationService.create(req.userId, {
    company, role, status, dateApplied, notes, resumeId,
  });
  res.status(201).json(application);
});

const updateApplication = asyncHandler(async (req, res) => {
  const { company, role, status, dateApplied, notes, resumeId } = req.body;
  const fields = {};
  if (company !== undefined) fields.company = company;
  if (role !== undefined) fields.role = role;
  if (status !== undefined) fields.status = status;
  if (dateApplied !== undefined) fields.date_applied = dateApplied;
  if (notes !== undefined) fields.notes = notes;
  if (resumeId !== undefined) fields.resume_id = resumeId;

  // application.service.js's update() throws an Error with `.status = 400`
  // for invalid input (no fields, bad status value) — that now flows
  // straight to the centralized error handler instead of being caught here.
  const application = await applicationService.update(req.userId, req.params.id, fields);
  if (!application) return res.status(404).json({ message: "application not found" });
  res.status(200).json(application);
});

const deleteApplication = asyncHandler(async (req, res) => {
  const deleted = await applicationService.remove(req.userId, req.params.id);
  if (!deleted) return res.status(404).json({ message: "application not found" });
  res.status(204).send();
});

module.exports = { getApplications, getApplicationById, postApplication, updateApplication, deleteApplication };
