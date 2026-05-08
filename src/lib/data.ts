import { supabaseServer } from './supabase'
import { Agent, DailyReport, Goal, LeaderboardEntry, Recruit, Lead, DashboardKPIs, ProductionRecord } from '@/types'

// ── Dashboard KPIs ─────────────────────────────────────────
export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const supabase = supabaseServer()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const [overview, monthlyProduction, missingReports, recruits] = await Promise.all([
    supabase.from('v_agency_overview').select('*').single(),
    supabase.from('v_monthly_team_alp').select('*').eq('year', year).eq('month', month).single(),
    supabase.from('v_missing_reports_today').select('*'),
    supabase.from('recruits').select('id').eq('is_active', true).not('stage', 'in', '(active,inactive,terminated)'),
  ])

  return {
    team_monthly_alp: monthlyProduction.data?.team_alp ?? 0,
    personal_monthly_alp: 14800, // TODO: pull from personal agent record
    consistent_agent_count: overview.data?.consistent_agents ?? 0,
    team_ytd_alp: 0, // sum from production_records for year
    active_agent_count: overview.data?.total_active_agents ?? 0,
    missing_reports_today: missingReports.data?.length ?? 0,
    team_close_rate: monthlyProduction.data?.avg_close_rate ?? 0,
    referral_rate: 1.8,
    recruits_in_pipeline: recruits.data?.length ?? 0,
    monthly_alp_goal: 50000,
    personal_alp_goal: 200000,
  }
}

// ── Agents ──────────────────────────────────────────────────
export async function getAgents(tier?: string): Promise<Agent[]> {
  const supabase = supabaseServer()
  let query = supabase
    .from('agents')
    .select('*, manager:profiles!manager_id(full_name, email)')
    .eq('is_active', true)
    .order('full_name')

  if (tier) query = query.eq('tier', tier)
  const { data } = await query
  return (data ?? []) as Agent[]
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const supabase = supabaseServer()
  const { data } = await supabase
    .from('agents')
    .select('*, manager:profiles!manager_id(*)')
    .eq('id', id)
    .single()
  return data as Agent | null
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = supabaseServer()
  const { data } = await supabase
    .from('v_agent_leaderboard')
    .select('*')
    .order('rank')
    .limit(15)
  return (data ?? []) as LeaderboardEntry[]
}

// ── Daily Reports ────────────────────────────────────────────
export async function getTodayReports(): Promise<DailyReport[]> {
  const supabase = supabaseServer()
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('daily_reports')
    .select('*, agent:agents(full_name, tier)')
    .eq('report_date', today)
    .order('submitted_at', { ascending: false })
  return (data ?? []) as DailyReport[]
}

export async function getMissingReportsToday() {
  const supabase = supabaseServer()
  const { data } = await supabase.from('v_missing_reports_today').select('*')
  return data ?? []
}

export async function getAgentReportHistory(agentId: string, days = 30): Promise<DailyReport[]> {
  const supabase = supabaseServer()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('agent_id', agentId)
    .gte('report_date', since)
    .order('report_date', { ascending: false })
  return (data ?? []) as DailyReport[]
}

export async function submitDailyReport(report: Omit<DailyReport, 'id' | 'submitted_at' | 'close_rate' | 'show_rate'>) {
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('daily_reports')
    .upsert({ ...report, submitted_at: new Date().toISOString() }, { onConflict: 'agent_id,report_date' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Production Records ──────────────────────────────────────
export async function getMonthlyProduction(months = 6): Promise<any[]> {
  const supabase = supabaseServer()
  const { data } = await supabase
    .from('v_monthly_team_alp')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(months)
  return (data ?? []).reverse()
}

export async function getAgentProduction(agentId: string): Promise<ProductionRecord[]> {
  const supabase = supabaseServer()
  const { data } = await supabase
    .from('production_records')
    .select('*')
    .eq('agent_id', agentId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(12)
  return (data ?? []) as ProductionRecord[]
}

// ── Recruits ─────────────────────────────────────────────────
export async function getRecruits(active = true): Promise<Recruit[]> {
  const supabase = supabaseServer()
  const { data } = await supabase
    .from('recruits')
    .select('*, recruiter:profiles!recruiter_id(full_name)')
    .eq('is_active', active)
    .order('created_at', { ascending: false })
  return (data ?? []) as Recruit[]
}

export async function createRecruit(recruit: Partial<Recruit>) {
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('recruits').insert(recruit).select().single()
  if (error) throw error
  return data
}

export async function updateRecruitStage(id: string, stage: string, notes?: string) {
  const supabase = supabaseServer()
  const { error } = await supabase
    .from('recruits')
    .update({ stage, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ── Leads ────────────────────────────────────────────────────
export async function getLeads(agentId?: string): Promise<Lead[]> {
  const supabase = supabaseServer()
  let query = supabase
    .from('leads')
    .select('*, agent:agents(full_name)')
    .order('assigned_date', { ascending: false })

  if (agentId) query = query.eq('agent_id', agentId)
  const { data } = await query
  return (data ?? []) as Lead[]
}

export async function getLeadsByType() {
  const supabase = supabaseServer()
  const { data } = await supabase
    .from('leads')
    .select('lead_type, status, alp_written')
  return data ?? []
}

// ── Goals ────────────────────────────────────────────────────
export async function getGoals(isPersonal?: boolean): Promise<Goal[]> {
  const supabase = supabaseServer()
  let query = supabase
    .from('goals')
    .select('*')
    .order('created_at')

  if (isPersonal !== undefined) query = query.eq('is_personal', isPersonal)
  const { data } = await query
  return (data ?? []) as Goal[]
}

export async function upsertGoal(goal: Partial<Goal>) {
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('goals')
    .upsert(goal)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Notifications ─────────────────────────────────────────────
export async function getNotifications(recipientId: string, unreadOnly = false) {
  const supabase = supabaseServer()
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (unreadOnly) query = query.eq('is_read', false)
  const { data } = await query
  return data ?? []
}

export async function markNotificationRead(id: string) {
  const supabase = supabaseServer()
  await supabase.from('notifications').update({ is_read: true }).eq('id', id)
}

// ── Training Milestones ──────────────────────────────────────
export async function getAgentMilestones(agentId: string) {
  const supabase = supabaseServer()
  const { data } = await supabase
    .from('training_milestones')
    .select('*')
    .eq('agent_id', agentId)
    .order('order_index')
  return data ?? []
}

export async function toggleMilestone(id: string, completed: boolean) {
  const supabase = supabaseServer()
  await supabase
    .from('training_milestones')
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq('id', id)
}
