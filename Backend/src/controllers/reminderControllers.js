const reminderService = require("../services/reminder.service");

const getReminders = async (req, res) => {
  try {
    const reminders = await reminderService.list(req.userId, { upcomingOnly: req.query.upcoming });
    res.status(200).json(reminders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

const postReminder = async (req, res) => {
  try {
    const { title, remindAt, notes, applicationId } = req.body;
    if (!title || !remindAt) {
      return res.status(400).json({ message: "title and remindAt are required" });
    }
    const reminder = await reminderService.create(req.userId, { title, remindAt, notes, applicationId });
    res.status(201).json(reminder);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

const updateReminder = async (req, res) => {
  try {
    const { title, remindAt, notes, applicationId } = req.body;
    const fields = {};
    if (title !== undefined) fields.title = title;
    if (remindAt !== undefined) fields.remind_at = remindAt;
    if (notes !== undefined) fields.notes = notes;
    if (applicationId !== undefined) fields.application_id = applicationId;

    const reminder = await reminderService.update(req.userId, req.params.id, fields);
    if (!reminder) return res.status(404).json({ message: "reminder not found" });
    res.status(200).json(reminder);
  } catch (err) {
    console.log(err);
    const status = err.status || 500;
    res.status(status).json({ message: err.status ? err.message : "internal server error" });
  }
};

const deleteReminder = async (req, res) => {
  try {
    const deleted = await reminderService.remove(req.userId, req.params.id);
    if (!deleted) return res.status(404).json({ message: "reminder not found" });
    res.status(204).send();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

module.exports = { getReminders, postReminder, updateReminder, deleteReminder };
