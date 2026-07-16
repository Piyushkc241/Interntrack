const badgeStyles = {
  applied: "bg-status-applied/10 text-status-applied",
  interview: "bg-status-interview/10 text-status-interview",
  offer: "bg-status-offer/10 text-status-offer",
  rejected: "bg-status-rejected/10 text-status-rejected",
};

export default function ApplicationTable({ applications, onEdit, onDelete }) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
        No applications yet. Add your first one to start tracking.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date applied</th>
            <th className="px-4 py-3">Resume</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-ink">{app.company}</td>
              <td className="px-4 py-3 text-slate-600">{app.role}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${badgeStyles[app.status]}`}>
                  {app.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">{new Date(app.date_applied).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-slate-500">{app.resume_label || "—"}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-3">
                  <button onClick={() => onEdit(app)} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                    Edit
                  </button>
                  <button onClick={() => onDelete(app)} className="text-sm font-medium text-status-rejected hover:opacity-80">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
