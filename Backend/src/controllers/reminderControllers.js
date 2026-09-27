const reminderService = require("../services/reminder.service");
const asyncHandler = require("../utils/asyncHandler");

const getReminders = asyncHandler(async (req, res) => {
  const { upcoming, page, limit } = req.query;
  const reminders = await reminderService.list(req.userId, { upcomingOnly: upcoming, page, limit });
  res.status(200).json(reminders);
});

const postReminder = asyncHandler(async (req, res) => {
  const { title, remindAt, notes, applicationId } = req.body;
  if (!title || !remindAt) {
    return res.status(400).json({ message: "title and remindAt are required" });
  }
  const reminder = await reminderService.create(req.userId, { title, remindAt, notes, applicationId });
  res.status(201).json(reminder);
});

const updateReminder = asyncHandler(async (req, res) => {
  const { title, remindAt, notes, applicationId } = req.body;
  const fields = {};
  if (title !== undefined) fields.title = title;
  if (remindAt !== undefined) fields.remind_at = remindAt;
  if (notes !== undefined) fields.notes = notes;
  if (applicationId !== undefined) fields.application_id = applicationId;

  const reminder = await reminderService.update(req.userId, req.params.id, fields);
  if (!reminder) return res.status(404).json({ message: "reminder not found" });
  res.status(200).json(reminder);
});

const deleteReminder = asyncHandler(async (req, res) => {
  const deleted = await reminderService.remove(req.userId, req.params.id);
  if (!deleted) return res.status(404).json({ message: "reminder not found" });
  res.status(204).send();
});

module.exports = { getReminders, postReminder, updateReminder, deleteReminder };
