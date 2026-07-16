const express = require("express");
const router = express.Router();
const { getResumes, uploadResume, downloadResume, deleteResume } = require("../controllers/resumeControllers");
const requireAuth = require("../middleware/auth");
const upload = require("../config/multer");

router.use(requireAuth);

router.get("/", getResumes);
router.post("/", upload.single("resume"), uploadResume);
router.get("/:id/download", downloadResume);
router.delete("/:id", deleteResume);

module.exports = router;
