-- ============================================================
-- Intern/Job Tracker — Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- 1. Create custom enum types
CREATE TYPE application_type AS ENUM ('internship', 'full_time', 'contract', 'part_time');
CREATE TYPE application_status AS ENUM ('kiv', 'applied', 'interview', 'offer', 'accepted', 'rejected', 'ghosted', 'withdrawn');
CREATE TYPE applied_via_type AS ENUM ('email', 'jobstreet', 'linkedin', 'company_website', 'referral', 'other');

-- 2. Create the applications table
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_role TEXT NOT NULL,
  application_type application_type NOT NULL DEFAULT 'internship',
  current_status application_status NOT NULL DEFAULT 'applied',
  applied_via applied_via_type NOT NULL DEFAULT 'other',
  date_applied DATE NOT NULL DEFAULT CURRENT_DATE,
  latitude DOUBLE PRECISION NOT NULL DEFAULT 3.1390,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 101.6869,
  location_label TEXT DEFAULT '',
  job_posting_url TEXT,
  notes TEXT,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create the status_history table
CREATE TABLE status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status application_status NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT
);

-- 4. Indexes for performance
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_archived ON applications(user_id, archived);
CREATE INDEX idx_status_history_application_id ON status_history(application_id);
CREATE INDEX idx_status_history_changed_at ON status_history(application_id, changed_at DESC);

-- 5. Auto-update the updated_at timestamp on applications
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Auto-insert a StatusHistory row when current_status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (OLD.current_status IS DISTINCT FROM NEW.current_status) THEN
    INSERT INTO status_history (application_id, status, changed_at)
    VALUES (NEW.id, NEW.current_status, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_status_change
  AFTER INSERT OR UPDATE OF current_status ON applications
  FOR EACH ROW
  EXECUTE FUNCTION log_status_change();

-- 7. Row Level Security (RLS) — REQUIRED from day one
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Applications: users can only see/modify their own rows
CREATE POLICY "Users can view their own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications"
  ON applications FOR DELETE
  USING (auth.uid() = user_id);

-- StatusHistory: users can access history for their own applications only
CREATE POLICY "Users can view status history of their own applications"
  ON status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = status_history.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert status history for their own applications"
  ON status_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = status_history.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete status history of their own applications"
  ON status_history FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = status_history.application_id
      AND applications.user_id = auth.uid()
    )
  );
