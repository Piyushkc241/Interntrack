import { Link } from "react-router-dom";

// Public landing page — this replaces your Day 5 placeholder Home.jsx.
// Logged-out visitors land here; "Get started" / "Log in" send them into
// the real app, which lives behind /login and /register.
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-semibold text-ink">
          Intern<span className="text-brand-500">Track</span>
        </span>
        <div className="flex gap-3">
          <Link to="/login" className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Log in
          </Link>
          <Link to="/register" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
          Every application. One dashboard.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-500">
          Track internship and placement applications, manage resumes, get
          reminders before deadlines, and see what's actually working —
          instead of losing it all in a spreadsheet.
        </p>
        <Link
          to="/register"
          className="mt-8 rounded-md bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600"
        >
          Start tracking — it's free
        </Link>

        <div className="mt-16 grid gap-6 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="font-display font-semibold text-ink">Stay organized</p>
            <p className="mt-1 text-sm text-slate-500">Every application's status, in one table.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="font-display font-semibold text-ink">Never miss a deadline</p>
            <p className="mt-1 text-sm text-slate-500">Reminders for interviews and follow-ups.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="font-display font-semibold text-ink">See what's working</p>
            <p className="mt-1 text-sm text-slate-500">A dashboard of your real success rate.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
