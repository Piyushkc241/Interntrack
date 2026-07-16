const express = require("express");
const cors = require("cors");
const logger = require("./middleware/logger");

const users = require("./routes/userRoutes");
const applications = require("./routes/applicationRoutes");
const resumes = require("./routes/resumeRoutes");
const reminders = require("./routes/reminderRoutes");
const stats = require("./routes/statsRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.send("InternTrack API running");
});

app.use("/users", users);
app.use("/applications", applications);
app.use("/resumes", resumes);
app.use("/reminders", reminders);
app.use("/stats", stats);

app.use((req, res) => {
  res.status(404).json({ message: "route not found" });
});

module.exports = app;
