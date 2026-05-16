-- Auth-aware Row Level Security
-- Run this in Supabase SQL Editor AFTER setting up Google OAuth.
--
-- NOTE: After running this, each user only sees THEIR OWN data.
-- Any test data added before signing up used a dummy user_id and
-- will no longer be visible. Simply re-add it after logging in.

DROP POLICY IF EXISTS "allow_all_rackets"     ON rackets;
DROP POLICY IF EXISTS "allow_all_string_jobs" ON string_jobs;
DROP POLICY IF EXISTS "allow_all_sessions"    ON sessions;

ALTER TABLE rackets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE string_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_rackets" ON rackets
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_string_jobs" ON string_jobs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_sessions" ON sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
