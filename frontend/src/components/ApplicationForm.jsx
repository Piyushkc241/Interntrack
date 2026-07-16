import { useState } from "react";

const STATUS_OPTIONS = ["applied", "interview", "offer", "rejected"];

export default function ApplicationForm({ initial, resumes = [], onSubmit, onCancel }) {
  const [form, setForm] = useState({
    company: initial?.company || "",
    role: initial?.role || "",
    status: initial?.status || "applied",
    date_applied: initial?.date_applied?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    resume_id: initial?.resume_id || "",
    notes: initial?.notes || "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        company: form.company,
        role: form.role,
        status: form.status,
        dateApplied: form.date_applied,
        resumeId: form.resume_id || null,
        notes: form.notes,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-600">Company</label>
          <input
            required
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="e.g. Infosys"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Role</label>
          <input
            required
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="e.g. SDE Intern"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Status</label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Date applied</label>
          <input
            type="date"
            value={form.date_applied}
            onChange={(e) => update("date_applied", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-600">Resume used</label>
          <select
            value={form.resume_id || ""}
            onChange={(e) => update("resume_id", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">None selected</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-600">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Referral contact, recruiter notes, next steps…"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {submitting ? "Saving…" : initial ? "Save changes" : "Add application"}
        </button>
      </div>
    </form>
  );
}
