-- Run this in the Supabase SQL editor (Dashboard → SQL editor)

CREATE TABLE IF NOT EXISTS user_requests (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL,
  name       TEXT        NOT NULL DEFAULT '',
  projects   TEXT[]      NOT NULL,
  status     TEXT        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;

-- Users can read their own request (used by the pending page and middleware)
CREATE POLICY "Users can view own request"
  ON user_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Service role bypasses RLS automatically (used by API routes)
