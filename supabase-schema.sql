-- ═══════════════════════════════════════════════════════════════════════════
-- StringTracker — Supabase Database Schema
-- ═══════════════════════════════════════════════════════════════════════════
-- HOW TO RUN:
--   1. Open your Supabase project dashboard
--   2. Click "SQL Editor" in the left sidebar
--   3. Click "New query"
--   4. Paste this entire file and click "Run"
-- ═══════════════════════════════════════════════════════════════════════════


-- ── Table: rackets ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rackets (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  name         TEXT        NOT NULL,
  brand        TEXT,
  model        TEXT,
  weight_class TEXT        CHECK (weight_class IN ('U', '3U', '4U', '5U', 'F')),
  notes        TEXT,
  status       TEXT        NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'inactive')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── Table: string_jobs ──────────────────────────────────────────────────────
-- Each row = one restring on one racket.
CREATE TABLE IF NOT EXISTS string_jobs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  racket_id       UUID        NOT NULL REFERENCES rackets(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  string_model    TEXT        NOT NULL,
  string_brand    TEXT,
  string_color    TEXT,
  tension_main    INTEGER     CHECK (tension_main BETWEEN 10 AND 40),
  tension_cross   INTEGER     CHECK (tension_cross BETWEEN 10 AND 40),
  stringing_date  DATE        NOT NULL,
  cost            NUMERIC(8,2),
  session_count   INTEGER     NOT NULL DEFAULT 0,
  playing_hours   NUMERIC(8,1) NOT NULL DEFAULT 0,
  status          TEXT        NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'broken', 'cut', 'restrung')),
  break_location  TEXT        CHECK (break_location IN ('vertical', 'horizontal', 'sweet_spot', 'edge')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── Table: sessions ─────────────────────────────────────────────────────────
-- Each row = one playing session.
CREATE TABLE IF NOT EXISTS sessions (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  racket_id          UUID        NOT NULL REFERENCES rackets(id) ON DELETE CASCADE,
  string_job_id      UUID        REFERENCES string_jobs(id) ON DELETE SET NULL,
  session_date       DATE        NOT NULL,
  duration_minutes   INTEGER     NOT NULL CHECK (duration_minutes > 0),
  notes              TEXT,
  -- Feel ratings: 1 (poor) to 5 (excellent)
  repulsion_rating   INTEGER     CHECK (repulsion_rating  BETWEEN 1 AND 5),
  control_rating     INTEGER     CHECK (control_rating    BETWEEN 1 AND 5),
  sound_rating       INTEGER     CHECK (sound_rating      BETWEEN 1 AND 5),
  durability_feeling INTEGER     CHECK (durability_feeling BETWEEN 1 AND 5),
  overall_feeling    INTEGER     CHECK (overall_feeling   BETWEEN 1 AND 5),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── Indexes (speed up lookups) ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_string_jobs_racket_id   ON string_jobs(racket_id);
CREATE INDEX IF NOT EXISTS idx_sessions_racket_id      ON sessions(racket_id);
CREATE INDEX IF NOT EXISTS idx_sessions_string_job_id  ON sessions(string_job_id);


-- ── Auto-update updated_at trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rackets_updated_at    ON rackets;
DROP TRIGGER IF EXISTS string_jobs_updated_at ON string_jobs;

CREATE TRIGGER rackets_updated_at
  BEFORE UPDATE ON rackets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER string_jobs_updated_at
  BEFORE UPDATE ON string_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── Row Level Security ──────────────────────────────────────────────────────
-- Disabled for now (single-user, no auth).
-- When you add Supabase Auth, re-enable RLS and add policies here.
ALTER TABLE rackets     DISABLE ROW LEVEL SECURITY;
ALTER TABLE string_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions    DISABLE ROW LEVEL SECURITY;
