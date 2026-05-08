// ============================================================
// AgencyOS — Complete TypeScript Types
// ============================================================

export type UserRole = 'owner' | 'manager' | 'agent' | 'recruit' | 'trainer'
export type AgentTier = 'new' | 'training' | 'parttime' | 'consistent' | 'elite' | 'inactive' | 'terminated'
export type RecruitStage = 'sourced' | 'intro_meeting' | 'intro_complete' | 'course_started' | 'exam_pending' | 'exam_passed' | 'training' | 'roleplay' | 'release_check' | 'active' | 'inactive' | 'terminated'
export type RecruitSource = 'social_media' | 'vendor' | 'agent_referral' | 'walk_in' | 'other'
export type LeadType = 'union' | 'veteran' | 'policy_owner_service' | 'new_agent_pack' | 'referral'
export type LeadStatus = 'new' | 'contacted' | 'appointment_set' | 'presented' | 'sold' | 'inactive' | 'reassigned'
export type AlertType = 'missing_report' | 'low_activity' | 'coaching_needed' | 'goal_alert' | 'recruit_update' | 'lead_waste'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  role: UserRole
  avatar_url?: string
  manager_id?: string
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  profile_id?: string
  full_name: string
  email?: string
  phone?: string
  tier: AgentTier
  manager_id?: string
  start_date: string
  license_status?: string
  license_state?: string
  license_expiry?: string
  lead_types: LeadType[]
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined
  manager?: Profile
  ytd_alp?: number
  monthly_alp?: number
  avg_close_rate?: number
  streak_days?: number
  consistency_score?: number
}

export interface DailyReport {
  id: string
  agent_id: string
  report_date: string
  dials: number
  appointments_set: number
  sits: number
  sales: number
  alp_written: number
  referral_appointments: number
  referral_sits: number
  referral_sales: number
  referral_alp: number
  win_of_day?: string
  struggles?: string
  notes?: string
  submitted_at?: string
  close_rate?: number
  show_rate?: number
  // Joined
  agent?: Agent
}

export interface DailyReportInput {
  agent_id: string
  report_date?: string
  dials: number
  appointments_set: number
  sits: number
  sales: number
  alp_written: number
  referral_appointments: number
  referral_sits: number
  referral_sales: number
  referral_alp: number
  win_of_day?: string
  struggles?: string
  notes?: string
}

export interface ProductionRecord {
  id: string
  agent_id: string
  year: number
  month: number
  total_alp: number
  total_sales: number
  total_sits: number
  total_dials: number
  total_referral_alp: number
  total_referral_sales: number
  avg_alp_per_sale?: number
  close_rate?: number
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  agent_id?: string
  lead_type: LeadType
  status: LeadStatus
  first_name?: string
  last_name?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  assigned_date?: string
  last_contact_date?: string
  contact_attempts: number
  alp_written?: number
  converted_at?: string
  created_at: string
  updated_at: string
  // Joined
  agent?: Agent
}

export interface Recruit {
  id: string
  full_name: string
  email?: string
  phone?: string
  source: RecruitSource
  stage: RecruitStage
  recruiter_id?: string
  intro_meeting_date?: string
  course_start_date?: string
  exam_date?: string
  exam_passed_date?: string
  training_start_date?: string
  release_date?: string
  first_sale_date?: string
  converted_agent_id?: string
  notes?: string
  score: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined
  recruiter?: Profile
  days_in_stage?: number
}

export interface Goal {
  id: string
  owner_id: string
  agent_id?: string
  name: string
  description?: string
  target_value: number
  current_value: number
  unit: string
  year: number
  month?: number
  is_personal: boolean
  created_at: string
  updated_at: string
  // Calculated
  percentage?: number
  is_on_pace?: boolean
}

export interface CoachingSession {
  id: string
  agent_id: string
  manager_id: string
  session_date: string
  topic: string
  notes?: string
  action_items?: string
  follow_up_date?: string
  created_at: string
  // Joined
  agent?: Agent
  manager?: Profile
}

export interface TrainingMilestone {
  id: string
  agent_id: string
  milestone: string
  completed: boolean
  completed_at?: string
  completed_by?: string
  notes?: string
  order_index: number
}

export interface Notification {
  id: string
  recipient_id: string
  type: AlertType
  title: string
  message: string
  agent_id?: string
  recruit_id?: string
  is_read: boolean
  created_at: string
}

// Dashboard aggregated types
export interface AgencyOverview {
  total_active_agents: number
  consistent_agents: number
  training_agents: number
  new_agents: number
  parttime_agents: number
}

export interface DashboardKPIs {
  team_monthly_alp: number
  personal_monthly_alp: number
  consistent_agent_count: number
  team_ytd_alp: number
  active_agent_count: number
  missing_reports_today: number
  team_close_rate: number
  referral_rate: number
  recruits_in_pipeline: number
  monthly_alp_goal: number
  personal_alp_goal: number
}

export interface LeaderboardEntry {
  id: string
  full_name: string
  tier: AgentTier
  ytd_alp: number
  monthly_alp: number
  avg_close_rate: number
  rank: number
}

export interface AIInsight {
  id: string
  type: 'warning' | 'opportunity' | 'celebration' | 'info'
  title: string
  description: string
  action?: string
  action_link?: string
  priority: 'high' | 'medium' | 'low'
}

export interface ChartDataPoint {
  label: string
  value: number
  value2?: number
}

export interface ConversionFunnel {
  dials: number
  contacts: number
  appointments: number
  sits: number
  sales: number
  dial_to_contact: number
  contact_to_appt: number
  appt_to_sit: number
  sit_to_sale: number
}

export interface RecruitingPipeline {
  stage: RecruitStage
  label: string
  count: number
  conversion_rate?: number
}
