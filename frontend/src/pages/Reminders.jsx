import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ReminderForm from "../components/ReminderForm";

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");

  function fetchReminders() {
    api.get("/reminders").then(({ data }) => setReminders(data)).catch(() => setError("Could not load reminders."));
  }

  useEffect(fetchReminders, []);

  useEffect(() => {
    api.get("/applications", { params: { limit: 100 } }).then(({ data }) => setApplications(data.data)).catch(() => {});
  }, []);

  async function handleCreate(payload) {
    await api.post("/reminders", payload);
    fetchReminders();
  }

  async function handleDelete(reminder) {
    if (!window.confirm(`Delete "${reminder.title}"?`)) return;
    await api.delete(`/reminders/${reminder.id}`);
    fetchReminders();
  }

  const now = new Date();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Reminders</h1>
        <p className="mt-1 text-sm text-slate-500">Never miss an interview or a follow-up.</p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-display text-base font-semibold text-ink">New reminder</h2>
          <ReminderForm applications={applications} onSubmit={handleCreate} />
        </div>

        {error && <p className="mt-4 text-sm text-status-rejected">{error}</p>}

        <div className="mt-6 space-y-3">
          {reminders.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
              No reminders yet. Add one above.
            </div>
          )}
          {reminders.map((reminder) => {
            const isPast = new Date(reminder.remind_at) < now;
            return (
              <div key={reminder.id} className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <p className="font-medium text-ink">{reminder.title}</p>
                  <p className={`text-sm ${isPast ? "text-slate-400" : "text-brand-600"}`}>
                    {new Date(reminder.remind_at).toLocaleString()}
                  </p>
                  {reminder.company && (
                    <p className="mt-1 text-sm text-slate-500">Linked to {reminder.company} — {reminder.role}</p>
                  )}
                  {reminder.notes && <p className="mt-1 text-sm text-slate-500">{reminder.notes}</p>}
                </div>
                <button onClick={() => handleDelete(reminder)} className="text-sm font-medium text-status-rejected hover:opacity-80">
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
