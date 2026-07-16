const express = require("express");
const router = express.Router();
const { getUsers, getUserById, postUsers, loginUser } = require("../controllers/userControllers");
const requireAuth = require("../middleware/auth");

router.post("/", postUsers);
router.post("/login", loginUser);
router.get("/", requireAuth, getUsers);
router.get("/:id", requireAuth, getUserById);

module.exports = router;
