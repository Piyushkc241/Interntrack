import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [label, setLabel] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function fetchResumes() {
    api.get("/resumes").then(({ data }) => setResumes(data)).catch(() => setError("Could not load resumes."));
  }

  useEffect(fetchResumes, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("label", label || file.name);
      await api.post("/resumes", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setLabel("");
      setFile(null);
      e.target.reset();
      fetchResumes();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(resume) {
    if (!window.confirm(`Delete "${resume.label}"?`)) return;
    await api.delete(`/resumes/${resume.id}`);
    fetchResumes();
  }

  function handleDownload(resume) {
    api
      .get(`/resumes/${resume.id}/download`, { responseType: "blob" })
      .then(({ data }) => {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        link.download = resume.original_name;
        link.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => setError("Could not download that file."));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Resumes</h1>
        <p className="mt-1 text-sm text-slate-500">Keep every version on hand and link it to applications.</p>

        <form onSubmit={handleUpload} className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-600">Label</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Backend-focused resume"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-600">File (PDF or Word)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700"
            />
          </div>
          <button
            type="submit"
            disabled={uploading || !file}
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-status-rejected">{error}</p>}

        <div className="mt-6 space-y-3">
          {resumes.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
              No resumes uploaded yet.
            </div>
          )}
          {resumes.map((resume) => (
            <div key={resume.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <p className="font-medium text-ink">{resume.label}</p>
                <p className="text-sm text-slate-500">
                  {resume.original_name} · Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleDownload(resume)} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  Download
                </button>
                <button onClick={() => handleDelete(resume)} className="text-sm font-medium text-status-rejected hover:opacity-80">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
