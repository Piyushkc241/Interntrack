const express = require("express");
const router = express.Router();
const { getReminders, postReminder, updateReminder, deleteReminder } = require("../controllers/reminderControllers");
const requireAuth = require("../middleware/auth");

router.use(requireAuth);

router.get("/", getReminders);
router.post("/", postReminder);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);

module.exports = router;
