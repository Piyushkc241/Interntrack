import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ApplicationTable from "../components/ApplicationTable";
import ApplicationForm from "../components/ApplicationForm";

const STATUS_TABS = ["all", "applied", "interview", "offer", "rejected"];

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { data } = await api.get("/applications", {
          params: { page, limit: 8, status: status === "all" ? undefined : status, search: search || undefined },
        });
        setApplications(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError("Could not load applications.");
      } finally {
        setLoading(false);
      }
    },
    [status, search]
  );

  useEffect(() => {
    fetchApplications(1);
  }, [fetchApplications]);

  useEffect(() => {
    // A dropdown needs every resume, not a paginated slice — request a high
    // limit and unwrap the paginated { data, pagination } shape.
    api.get("/resumes", { params: { limit: 100 } }).then(({ data }) => setResumes(data.data)).catch(() => {});
  }, []);

  async function handleCreate(payload) {
    await api.post("/applications", payload);
    setShowForm(false);
    fetchApplications(pagination.page);
  }

  async function handleUpdate(payload) {
    await api.put(`/applications/${editing.id}`, payload);
    setEditing(null);
    fetchApplications(pagination.page);
  }

  async function handleDelete(app) {
    if (!window.confirm(`Delete the application to ${app.company}?`)) return;
    await api.delete(`/applications/${app.id}`);
    fetchApplications(pagination.page);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Applications</h1>
            <p className="mt-1 text-sm text-slate-500">Every internship and job you're tracking.</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            + Add application
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatus(tab)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  status === tab ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or role…"
            className="ml-auto w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {(showForm || editing) && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-display text-base font-semibold text-ink">
              {editing ? "Edit application" : "New application"}
            </h2>
            <ApplicationForm
              initial={editing}
              resumes={resumes}
              onSubmit={editing ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        )}

        {error && <p className="mt-4 text-sm text-status-rejected">{error}</p>}

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : (
            <ApplicationTable
              applications={applications}
              onEdit={(app) => { setEditing(app); setShowForm(false); }}
              onDelete={handleDelete}
            />
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchApplications(pagination.page - 1)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchApplications(pagination.page + 1)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
