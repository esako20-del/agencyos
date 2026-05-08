# AgencyOS — Life Insurance Agency Operating System
### AO Globe Life · American Income Life · Owner Command Center

---

## 🚀 Deployment Guide

### Prerequisites
- Node.js 18+
- Supabase project (free tier works)
- Vercel account

---

## Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) and open your project
2. Navigate to **SQL Editor**
3. Run the file: `supabase/migrations/001_schema.sql`
   - This creates all tables, triggers, RLS policies, indexes, and views
4. Go to **Settings > API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

5. Go to **Authentication > Settings** and:
   - Set Site URL to your Vercel URL (e.g., `https://agencyos.vercel.app`)
   - Add redirect URLs: `https://agencyos.vercel.app/auth/callback`

6. Create your owner account:
   - Go to **Authentication > Users > Invite User**
   - Enter your email
   - After confirming, run in SQL Editor:
     ```sql
     INSERT INTO profiles (id, email, full_name, role)
     SELECT id, email, 'Your Name', 'owner'
     FROM auth.users WHERE email = 'your@email.com';
     ```

---

## Step 2 — Local Development

```bash
# Clone or download the project
cd agencyos

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
nano .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 3 — Deploy to Vercel

### Option A: Vercel CLI (fastest)
```bash
npm install -g vercel
vercel

# Follow prompts, then add environment variables:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy to production
vercel --prod
```

### Option B: Vercel Dashboard
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Add environment variables in Project Settings > Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

---

## Step 4 — Seed Your Data

After deployment, add your real agents via the **Team** page in the dashboard, or run in Supabase SQL Editor:

```sql
-- Add your top producer
INSERT INTO agents (full_name, email, tier, start_date, lead_types, is_active)
VALUES ('Marcus W.', 'marcus@email.com', 'consistent', '2022-01-15', '{union,veteran}', true);

-- Add your goals
INSERT INTO goals (owner_id, name, target_value, current_value, unit, year, is_personal)
SELECT id, 'Personal ALP', 200000, 74000, '$', 2026, true
FROM profiles WHERE role = 'owner' LIMIT 1;
```

---

## Step 5 — Connect Agent Reporting

### Option A: JotForm → Supabase (Recommended)
1. Create a JotForm with all daily report fields
2. Add a Webhook integration pointing to: `https://yourapp.vercel.app/api/reports`
3. Agents fill out the form on their phone — data flows automatically

### Option B: Direct App Access
- Create agent accounts in Supabase Auth
- Insert their profiles with `role = 'agent'`
- They log in and submit reports via the Daily Report page

---

## 📁 Project Structure

```
agencyos/
├── src/
│   ├── app/
│   │   ├── auth/login/          # Login page
│   │   ├── dashboard/           # All dashboard pages
│   │   │   ├── page.tsx         # Command Dashboard
│   │   │   ├── production/      # Personal ALP tracking
│   │   │   ├── team/            # Agent roster
│   │   │   ├── recruiting/      # Recruiting CRM
│   │   │   ├── leads/           # Lead management
│   │   │   ├── training/        # Training & onboarding
│   │   │   ├── insights/        # AI insights
│   │   │   ├── goals/           # Goal tracking
│   │   │   └── report/          # Daily report form
│   │   └── api/
│   │       ├── agents/          # Agent CRUD
│   │       ├── reports/         # Daily report submission
│   │       ├── recruits/        # Recruiting pipeline
│   │       ├── leads/           # Lead management
│   │       └── goals/           # Goal tracking
│   ├── components/
│   │   ├── layout/              # Sidebar, Topbar
│   │   ├── dashboard/           # KPI grid, alerts, feed
│   │   ├── charts/              # Recharts components
│   │   └── forms/               # Modal forms
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client setup
│   │   ├── data.ts              # All data fetching functions
│   │   └── utils.ts             # Helpers, formatters, AI insights
│   └── types/
│       └── index.ts             # All TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_schema.sql       # Complete database schema
├── .env.local.example           # Environment variables template
└── README.md                    # This file
```

---

## 🔐 Role-Based Access

| Role | Access |
|------|--------|
| `owner` | Full access — all pages, all agents, all income data |
| `manager` | Team roster, recruiting, daily reports, training |
| `agent` | Own stats, daily report submission, own leads |

---

## 📱 Mobile Experience

The app is fully responsive. Agents can submit daily reports from any phone browser. For a native app feel, add to homescreen (PWA-ready).

---

## 🔔 Automations (Optional)

### SMS Alerts via Twilio
Add to `.env.local`:
```
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

Triggers:
- Missing report after 8 PM
- 0-sales streak alerts
- Recruiting pipeline reminders

### Email via Resend
```
RESEND_API_KEY=xxx
```

---

## 🛣️ Roadmap — Phase 3

- [ ] Real-time dashboard via Supabase Realtime subscriptions
- [ ] SMS agent reporting (text stats directly)
- [ ] AI-powered coaching recommendations (Claude API integration)
- [ ] Predictive retention scoring
- [ ] Manager mobile app
- [ ] Leaderboard TV display mode
- [ ] WhatsApp/iMessage daily report integration
- [ ] Automated weekly performance summaries via email

---

Built for AO Globe Life · American Income Life  
AgencyOS v1.0 — Owner Command Center
