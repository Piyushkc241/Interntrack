const dotColors = {
  applied: "bg-status-applied",
  interview: "bg-status-interview",
  offer: "bg-status-offer",
  rejected: "bg-status-rejected",
};

export default function StatsCard({ label, value, statusKey }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {statusKey && <span className={`h-2 w-2 rounded-full ${dotColors[statusKey]}`} />}
        {label}
      </div>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}
