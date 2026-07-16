const path = require("path");
const resumeService = require("../services/resume.service");

const getResumes = async (req, res) => {
  try {
    const resumes = await resumeService.list(req.userId);
    res.status(200).json(resumes);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "a resume file is required" });
    }
    const label = req.body.label || req.file.originalname;

    const resume = await resumeService.create(req.userId, {
      label,
      originalName: req.file.originalname,
      storedPath: req.file.path,
    });
    res.status(201).json(resume);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

const downloadResume = async (req, res) => {
  try {
    const resume = await resumeService.getById(req.userId, req.params.id);
    if (!resume) return res.status(404).json({ message: "resume not found" });
    res.download(path.resolve(resume.stored_path), resume.original_name);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

const deleteResume = async (req, res) => {
  try {
    const deleted = await resumeService.remove(req.userId, req.params.id);
    if (!deleted) return res.status(404).json({ message: "resume not found" });
    res.status(204).send();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

module.exports = { getResumes, uploadResume, downloadResume, deleteResume };
