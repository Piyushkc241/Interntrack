-- Internship & Placement Tracker (INTERNTRACK) database schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(120) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  cloudinary_url VARCHAR(500) NOT NULL,
  cloudinary_id VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Migration for databases created before the Cloudinary switch: add the new
-- columns and drop the old local-disk path column. Safe to re-run.
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS cloudinary_url VARCHAR(500);
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS cloudinary_id VARCHAR(255);
ALTER TABLE resumes DROP COLUMN IF EXISTS stored_path;

-- Migration for databases created before signed/authenticated downloads:
-- tracks which Cloudinary delivery type a resume was actually uploaded
-- under. Defaults to 'upload' (the old public type) so EXISTING rows keep
-- working exactly as before — Cloudinary ties a resource's identity to
-- (public_id, resource_type, type) together, so a signed 'authenticated'
-- URL can't retroactively secure a file that was actually uploaded public.
-- New uploads explicitly set this to 'authenticated' in resume.service.js.
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS access_type VARCHAR(20) NOT NULL DEFAULT 'upload';

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id INTEGER REFERENCES resumes(id) ON DELETE SET NULL,
  company VARCHAR(160) NOT NULL,
  role VARCHAR(160) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'applied'
    CHECK (status IN ('applied', 'interview', 'offer', 'rejected')),
  date_applied DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  remind_at TIMESTAMP NOT NULL,
  notes TEXT,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- One row per issued JWT. The JWT's own signature+expiry only prove it was
-- issued by us and hasn't hit its 7-day expiry — they say nothing about
-- whether it was revoked since (e.g. via logout). This table is what makes
-- "logout" actually invalidate a token server-side, instead of just
-- clearing a cookie the token itself doesn't care about. id is a UUID
-- generated in Node (crypto.randomUUID()), stored as the JWT's `sessionId`
-- claim — no Postgres extension needed to store a pre-generated UUID.
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_check ON reminders(notified, remind_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
