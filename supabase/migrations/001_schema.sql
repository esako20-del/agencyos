-- ============================================================
-- AgencyOS — Complete Supabase Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'agent', 'recruit', 'trainer');
CREATE TYPE agent_tier AS ENUM ('new', 'training', 'parttime', 'consistent', 'elite', 'inactive', 'terminated');
CREATE TYPE recruit_stage AS ENUM (
  'sourced', 'intro_meeting', 'intro_complete', 'course_started',
  'exam_pending', 'exam_passed', 'training', 'roleplay', 'release_check',
  'active', 'inactive', 'terminated'
);
CREATE TYPE recruit_source AS ENUM ('social_media', 'vendor', 'agent_referral', 'walk_in', 'other');
CREATE TYPE lead_type AS ENUM ('union', 'veteran', 'policy_owner_service', 'new_agent_pack', 'referral');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'appointment_set', 'presented', 'sold', 'inactive', 'reassigned');
CREATE TYPE alert_type AS ENUM ('missing_report', 'low_activity', 'coaching_needed', 'goal_alert', 'recruit_update', 'lead_waste');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'agent',
  avatar_url TEXT,
  manager_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AGENTS
-- ============================================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  tier agent_tier NOT NULL DEFAULT 'new',
  manager_id UUID REFERENCES profiles(id),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  license_status TEXT DEFAULT 'pending',
  license_state TEXT,
  license_expiry DATE,
  lead_types lead_type[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DAILY REPORTS
-- ============================================================
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Core activity
  dials INTEGER NOT NULL DEFAULT 0,
  appointments_set INTEGER NOT NULL DEFAULT 0,
  sits INTEGER NOT NULL DEFAULT 0,
  sales INTEGER NOT NULL DEFAULT 0,
  alp_written NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Referrals
  referral_appointments INTEGER NOT NULL DEFAULT 0,
  referral_sits INTEGER NOT NULL DEFAULT 0,
  referral_sales INTEGER NOT NULL DEFAULT 0,
  referral_alp NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Notes
  win_of_day TEXT,
  struggles TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  -- Calculated fields (auto-updated via trigger)
  close_rate NUMERIC(5,2),
  show_rate NUMERIC(5,2),
  UNIQUE(agent_id, report_date)
);

-- ============================================================
-- PRODUCTION RECORDS (monthly rollups)
-- ============================================================
CREATE TABLE production_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  total_alp NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_sales INTEGER NOT NULL DEFAULT 0,
  total_sits INTEGER NOT NULL DEFAULT 0,
  total_dials INTEGER NOT NULL DEFAULT 0,
  total_referral_alp NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_referral_sales INTEGER NOT NULL DEFAULT 0,
  avg_alp_per_sale NUMERIC(10,2),
  close_rate NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_id, year, month)
);

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  lead_type lead_type NOT NULL,
  status lead_status NOT NULL DEFAULT 'new',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  assigned_date DATE DEFAULT CURRENT_DATE,
  last_contact_date DATE,
  contact_attempts INTEGER DEFAULT 0,
  alp_written NUMERIC(10,2),
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RECRUITS
-- ============================================================
CREATE TABLE recruits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source recruit_source NOT NULL DEFAULT 'social_media',
  stage recruit_stage NOT NULL DEFAULT 'sourced',
  recruiter_id UUID REFERENCES profiles(id),
  intro_meeting_date DATE,
  course_start_date DATE,
  exam_date DATE,
  exam_passed_date DATE,
  training_start_date DATE,
  release_date DATE,
  first_sale_date DATE,
  converted_agent_id UUID REFERENCES agents(id),
  notes TEXT,
  score INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RECRUIT STAGE HISTORY
-- ============================================================
CREATE TABLE recruit_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruit_id UUID NOT NULL REFERENCES recruits(id) ON DELETE CASCADE,
  from_stage recruit_stage,
  to_stage recruit_stage NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GOALS
-- ============================================================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC(12,2) NOT NULL,
  current_value NUMERIC(12,2) DEFAULT 0,
  unit TEXT DEFAULT '$',
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  month INTEGER,
  is_personal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COACHING SESSIONS
-- ============================================================
CREATE TABLE coaching_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL REFERENCES profiles(id),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  topic TEXT NOT NULL,
  notes TEXT,
  action_items TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRAINING MILESTONES
-- ============================================================
CREATE TABLE training_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  milestone TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- NOTIFICATIONS / ALERTS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type alert_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  agent_id UUID REFERENCES agents(id),
  recruit_id UUID REFERENCES recruits(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LEADERBOARD SNAPSHOTS (daily cron)
-- ============================================================
CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  rank_position INTEGER,
  ytd_alp NUMERIC(10,2) DEFAULT 0,
  monthly_alp NUMERIC(10,2) DEFAULT 0,
  consistency_score INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER recruits_updated_at BEFORE UPDATE ON recruits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER production_records_updated_at BEFORE UPDATE ON production_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-calculate close_rate and show_rate on daily reports
CREATE OR REPLACE FUNCTION calc_report_rates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sits > 0 THEN
    NEW.close_rate = ROUND((NEW.sales::NUMERIC / NEW.sits) * 100, 2);
  ELSE
    NEW.close_rate = 0;
  END IF;
  IF NEW.appointments_set > 0 THEN
    NEW.show_rate = ROUND((NEW.sits::NUMERIC / NEW.appointments_set) * 100, 2);
  ELSE
    NEW.show_rate = 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER daily_report_rates
BEFORE INSERT OR UPDATE ON daily_reports
FOR EACH ROW EXECUTE FUNCTION calc_report_rates();

-- Auto-update monthly production rollup when daily report is submitted
CREATE OR REPLACE FUNCTION rollup_monthly_production()
RETURNS TRIGGER AS $$
DECLARE
  v_year INTEGER := EXTRACT(YEAR FROM NEW.report_date);
  v_month INTEGER := EXTRACT(MONTH FROM NEW.report_date);
BEGIN
  INSERT INTO production_records (agent_id, year, month, total_alp, total_sales, total_sits, total_dials, total_referral_alp, total_referral_sales)
  SELECT
    NEW.agent_id, v_year, v_month,
    SUM(alp_written), SUM(sales), SUM(sits), SUM(dials),
    SUM(referral_alp), SUM(referral_sales)
  FROM daily_reports
  WHERE agent_id = NEW.agent_id
    AND EXTRACT(YEAR FROM report_date) = v_year
    AND EXTRACT(MONTH FROM report_date) = v_month
  ON CONFLICT (agent_id, year, month) DO UPDATE SET
    total_alp = EXCLUDED.total_alp,
    total_sales = EXCLUDED.total_sales,
    total_sits = EXCLUDED.total_sits,
    total_dials = EXCLUDED.total_dials,
    total_referral_alp = EXCLUDED.total_referral_alp,
    total_referral_sales = EXCLUDED.total_referral_sales,
    avg_alp_per_sale = CASE WHEN EXCLUDED.total_sales > 0 THEN ROUND(EXCLUDED.total_alp / EXCLUDED.total_sales, 2) ELSE 0 END,
    close_rate = CASE WHEN EXCLUDED.total_sits > 0 THEN ROUND((EXCLUDED.total_sales::NUMERIC / EXCLUDED.total_sits) * 100, 2) ELSE 0 END,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_daily_report_insert
AFTER INSERT OR UPDATE ON daily_reports
FOR EACH ROW EXECUTE FUNCTION rollup_monthly_production();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_agents_tier ON agents(tier);
CREATE INDEX idx_agents_manager ON agents(manager_id);
CREATE INDEX idx_agents_active ON agents(is_active);
CREATE INDEX idx_daily_reports_agent_date ON daily_reports(agent_id, report_date);
CREATE INDEX idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX idx_production_agent_year_month ON production_records(agent_id, year, month);
CREATE INDEX idx_leads_agent ON leads(agent_id);
CREATE INDEX idx_leads_type ON leads(lead_type);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_recruits_stage ON recruits(stage);
CREATE INDEX idx_recruits_recruiter ON recruits(recruiter_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruits ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: is owner or manager
CREATE OR REPLACE FUNCTION is_manager_or_owner()
RETURNS BOOLEAN AS $$
  SELECT role IN ('owner', 'manager') FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: users can read all, update own
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert_owner" ON profiles FOR INSERT WITH CHECK (is_manager_or_owner());

-- Agents: managers/owners see all; agents see themselves
CREATE POLICY "agents_manager_all" ON agents FOR ALL USING (is_manager_or_owner());
CREATE POLICY "agents_self_select" ON agents FOR SELECT USING (profile_id = auth.uid());

-- Daily Reports: agents insert/update own; managers see all
CREATE POLICY "reports_agent_own" ON daily_reports FOR ALL USING (
  agent_id IN (SELECT id FROM agents WHERE profile_id = auth.uid())
);
CREATE POLICY "reports_manager_all" ON daily_reports FOR ALL USING (is_manager_or_owner());

-- Production Records: managers/owners see all; agents see own
CREATE POLICY "production_manager_all" ON production_records FOR ALL USING (is_manager_or_owner());
CREATE POLICY "production_agent_own" ON production_records FOR SELECT USING (
  agent_id IN (SELECT id FROM agents WHERE profile_id = auth.uid())
);

-- Leads: managers see all; agents see assigned leads
CREATE POLICY "leads_manager_all" ON leads FOR ALL USING (is_manager_or_owner());
CREATE POLICY "leads_agent_own" ON leads FOR SELECT USING (
  agent_id IN (SELECT id FROM agents WHERE profile_id = auth.uid())
);

-- Recruits: managers/owners only
CREATE POLICY "recruits_manager_all" ON recruits FOR ALL USING (is_manager_or_owner());

-- Goals: owner sees all; agents see own
CREATE POLICY "goals_owner_all" ON goals FOR ALL USING (get_my_role() = 'owner');
CREATE POLICY "goals_manager_all" ON goals FOR SELECT USING (is_manager_or_owner());
CREATE POLICY "goals_agent_own" ON goals FOR SELECT USING (
  agent_id IN (SELECT id FROM agents WHERE profile_id = auth.uid())
);

-- Coaching: managers all; agents see own
CREATE POLICY "coaching_manager_all" ON coaching_sessions FOR ALL USING (is_manager_or_owner());
CREATE POLICY "coaching_agent_own" ON coaching_sessions FOR SELECT USING (
  agent_id IN (SELECT id FROM agents WHERE profile_id = auth.uid())
);

-- Training: managers all; agents see own
CREATE POLICY "training_manager_all" ON training_milestones FOR ALL USING (is_manager_or_owner());
CREATE POLICY "training_agent_own" ON training_milestones FOR SELECT USING (
  agent_id IN (SELECT id FROM agents WHERE profile_id = auth.uid())
);

-- Notifications: own only
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (recipient_id = auth.uid());

-- Leaderboard: everyone can read
CREATE POLICY "leaderboard_select_all" ON leaderboard_snapshots FOR SELECT USING (true);
CREATE POLICY "leaderboard_manager_write" ON leaderboard_snapshots FOR ALL USING (is_manager_or_owner());

-- ============================================================
-- VIEWS
-- ============================================================

-- Agency overview for dashboard
CREATE OR REPLACE VIEW v_agency_overview AS
SELECT
  COUNT(*) FILTER (WHERE is_active) AS total_active_agents,
  COUNT(*) FILTER (WHERE tier = 'consistent' AND is_active) AS consistent_agents,
  COUNT(*) FILTER (WHERE tier = 'training' AND is_active) AS training_agents,
  COUNT(*) FILTER (WHERE tier = 'new' AND is_active) AS new_agents,
  COUNT(*) FILTER (WHERE tier = 'parttime' AND is_active) AS parttime_agents
FROM agents;

-- Monthly team ALP
CREATE OR REPLACE VIEW v_monthly_team_alp AS
SELECT
  year, month,
  SUM(total_alp) AS team_alp,
  SUM(total_sales) AS team_sales,
  SUM(total_sits) AS team_sits,
  COUNT(DISTINCT agent_id) AS active_agent_count,
  ROUND(AVG(close_rate), 2) AS avg_close_rate
FROM production_records
GROUP BY year, month
ORDER BY year DESC, month DESC;

-- Agent leaderboard
CREATE OR REPLACE VIEW v_agent_leaderboard AS
SELECT
  a.id,
  a.full_name,
  a.tier,
  COALESCE(SUM(pr.total_alp) FILTER (WHERE pr.year = EXTRACT(YEAR FROM NOW())), 0) AS ytd_alp,
  COALESCE(SUM(pr.total_alp) FILTER (WHERE pr.year = EXTRACT(YEAR FROM NOW()) AND pr.month = EXTRACT(MONTH FROM NOW())), 0) AS monthly_alp,
  COALESCE(AVG(pr.close_rate) FILTER (WHERE pr.year = EXTRACT(YEAR FROM NOW())), 0) AS avg_close_rate,
  RANK() OVER (ORDER BY COALESCE(SUM(pr.total_alp) FILTER (WHERE pr.year = EXTRACT(YEAR FROM NOW())), 0) DESC) AS rank
FROM agents a
LEFT JOIN production_records pr ON pr.agent_id = a.id
WHERE a.is_active = TRUE
GROUP BY a.id, a.full_name, a.tier;

-- Today's missing reports
CREATE OR REPLACE VIEW v_missing_reports_today AS
SELECT
  a.id AS agent_id,
  a.full_name,
  a.tier,
  p.email,
  p.phone
FROM agents a
LEFT JOIN profiles p ON p.id = a.profile_id
LEFT JOIN daily_reports dr ON dr.agent_id = a.id AND dr.report_date = CURRENT_DATE
WHERE a.is_active = TRUE AND a.tier NOT IN ('new') AND dr.id IS NULL;

-- ============================================================
-- SEED DATA — Default onboarding checklist milestones template
-- ============================================================
-- (These get copied per agent on creation)
CREATE TABLE onboarding_checklist_template (
  id SERIAL PRIMARY KEY,
  milestone TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  typical_days INTEGER
);

INSERT INTO onboarding_checklist_template (milestone, description, order_index, typical_days) VALUES
('Online course complete', 'Complete the required pre-licensing course', 1, 7),
('State exam scheduled', 'Register and schedule the state licensing exam', 2, 10),
('State exam passed', 'Pass the state insurance licensing exam', 3, 14),
('Expectation meeting', 'Complete expectation-setting meeting with owner/manager', 4, 15),
('Week 1 training (corporate)', 'Complete the first week of corporate training program', 5, 22),
('Week 2 training (role play)', 'Complete role play and objection handling training', 6, 29),
('Release check presentation', 'Present full product presentation to manager for approval', 7, 35),
('First lead pack assigned', 'Receive and begin working first lead pack', 8, 36);
