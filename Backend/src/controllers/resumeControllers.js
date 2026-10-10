const resumeService = require("../services/resume.service");
const asyncHandler = require("../utils/asyncHandler");

const getResumes = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const resumes = await resumeService.list(req.userId, { page, limit });
  res.status(200).json(resumes);
});

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "a resume file is required" });
  }
  const label = req.body.label || req.file.originalname;

  const resume = await resumeService.create(req.userId, {
    label,
    originalName: req.file.originalname,
    buffer: req.file.buffer,
  });
  res.status(201).json(resume);
});

const downloadResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.getById(req.userId, req.params.id);
  if (!resume) return res.status(404).json({ message: "resume not found" });

  // The URL itself expires in a few minutes (see resume.service.js) — this
  // redirect just hands the browser that short-lived link, it doesn't
  // store or cache it anywhere.
  res.redirect(resumeService.getDownloadUrl(resume));
});

const deleteResume = asyncHandler(async (req, res) => {
  const deleted = await resumeService.remove(req.userId, req.params.id);
  if (!deleted) return res.status(404).json({ message: "resume not found" });
  res.status(204).send();
});

module.exports = { getResumes, uploadResume, downloadResume, deleteResume };
