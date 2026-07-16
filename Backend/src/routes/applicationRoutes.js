const express = require("express");
const router = express.Router();
const {
  getApplications,
  getApplicationById,
  postApplication,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationControllers");
const requireAuth = require("../middleware/auth");

router.use(requireAuth);

router.get("/", getApplications);
router.get("/:id", getApplicationById);
router.post("/", postApplication);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

module.exports = router;
