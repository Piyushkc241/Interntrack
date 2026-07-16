import { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar,
} from "recharts";
import api from "../services/api";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/stats/overview").then(({ data }) => setStats(data)).catch(() => {
      setError("Could not load your stats right now.");
    });
  }, []);

  const byStatusData = stats ? Object.entries(stats.byStatus).map(([status, count]) => ({ status, count })) : [];
  const timelineData = (stats?.timeline || []).map((row) => ({
    date: new Date(row.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    count: row.count,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">A snapshot of your placement journey.</p>

        {error && <p className="mt-4 text-sm text-status-rejected">{error}</p>}

        {stats && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatsCard label="Total applications" value={stats.total} />
              <StatsCard label="Applied" value={stats.byStatus.applied} statusKey="applied" />
              <StatsCard label="Interviewing" value={stats.byStatus.interview} statusKey="interview" />
              <StatsCard label="Offers" value={stats.byStatus.offer} statusKey="offer" />
            </div>

            <div className="mt-4">
              <StatsCard label="Reminders in the next 7 days" value={stats.upcomingReminders} />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-display text-base font-semibold text-ink">Applications over time</h2>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#3366ff" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-display text-base font-semibold text-ink">Applications by status</h2>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byStatusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="status" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3366ff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
