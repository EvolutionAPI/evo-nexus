---
name: initial-setup
description: "Welcome and onboard new EvoNexus users — introduce agents, skills, routines, and the dashboard. Triggers when the user says 'get started', 'how do I use this', 'what can you do', 'help me get started', 'onboarding', 'show me around', 'what agents do I have', 'how does this work', 'first time here', or seems unfamiliar with the workspace. Also trigger when the user opens Claude Code in an EvoNexus workspace for the first time."
---

# EvoNexus — Welcome & Onboarding

The user already has EvoNexus installed and running. Your job is to welcome them, show what's available, and help them start using agents, skills, and routines right away.

## Welcome

Start with a warm welcome:

"Welcome to **EvoNexus** — your AI-powered business operating system. You have 16 specialized agents, 130 skills, and 30 automated routines ready to go. Let me show you what you can do."

## Your Agents

"You have a team of 16 agents, each specialized in a business domain. Talk to them using slash commands:"

| Command | Agent | What it does | Try saying... |
|---------|-------|-------------|---------------|
| `/clawdia` | **Clawdia** (Ops) | Daily briefing, email triage, tasks, decisions, agenda | "good morning" or "what do I have today?" |
| `/flux` | **Flux** (Finance) | Stripe, ERP, cash flow, reports, monthly close | "financial pulse" or "how are the finances?" |
| `/atlas` | **Atlas** (Projects) | Linear, GitHub, sprints, milestones, blockers | "check linear" or "github review" |
| `/pulse` | **Pulse** (Community) | Discord/WhatsApp pulse, FAQ, sentiment analysis | "community pulse" or "how's the community?" |
| `/pixel` | **Pixel** (Social) | Content creation, analytics, posting calendar | "social analytics" or "write a post" |
| `/sage` | **Sage** (Strategy) | OKRs, roadmap, competitive analysis, scenarios | "strategy digest" or "OKR review" |
| `/nex` | **Nex** (Sales) | Pipeline, proposals, lead qualification, follow-ups | "pipeline review" or "qualify this lead" |
| `/mentor` | **Mentor** (Courses) | Learning paths, modules, course creation | "create a course outline" |
| `/kai` | **Kai** (Personal) | Health tracking, habits, personal routine | "health check-in" |

"You don't have to use slash commands — just describe what you need and I'll route to the right agent automatically."

## Quick Wins to Try Right Now

Suggest 3 things the user can try immediately based on what's most useful:

### 1. Morning Briefing
"Say **'good morning'** and the Ops agent will check your calendar, emails, tasks, and give you a prioritized plan for the day."

### 2. Dashboard Overview
"Open **http://localhost:8080** to see the web dashboard — overview metrics, reports, services, and even a Claude Code terminal in the browser."

### 3. Run a Routine
"Try running a routine manually:
- `make morning` — morning briefing
- `make community` — community pulse report
- `make fin-pulse` — financial snapshot

Each routine generates an HTML report you can view in the dashboard under Reports."

## Skills by Domain

"You have 130 skills organized by prefix. Here are the categories:"

| Prefix | Domain | Examples |
|--------|--------|----------|
| `fin-` | Financial | P&L, journal entries, reconciliation, SOX compliance, monthly close |
| `social-` | Social Media | Post writer, carousel, thread, analytics, content strategy |
| `mkt-` | Marketing | Campaigns, SEO audit, email sequences, competitive briefs |
| `int-` | Integrations | Stripe, Omie, YouTube, Instagram, LinkedIn, Discord, Fathom |
| `prod-` | Productivity | Morning briefing, end of day, memory management, dashboard |
| `pulse-` | Community | Daily/weekly/monthly pulse reports, FAQ sync |
| `sage-` | Strategy | OKR review, strategy digest, competitive analysis |
| `gog-` | Google | Gmail triage, Calendar, email drafts, follow-ups |
| `discord-` | Discord | Messages, channels, moderation |
| `obs-` | Obsidian | Markdown, CLI, canvas, bases |
| `evo-` | Development | PRD, architecture, sprints, code review, QA, brainstorming |

"Browse all skills in the dashboard under **Skills**, or just ask me to do something and I'll use the right skill."

## Automated Routines

"EvoNexus can run routines automatically on a schedule:"

**Daily:** Morning briefing, email triage, meeting sync, community pulse, financial pulse, end of day
**Weekly:** Weekly review, strategy digest, trends analysis, financial weekly
**Monthly:** Monthly close, community monthly report

"Start the scheduler with `make scheduler` and routines run at their configured times. See them all with `make help`."

## The Web Dashboard

"Your dashboard at **http://localhost:8080** has:

- **Overview** — all metrics at a glance
- **Chat** — Claude Code terminal in the browser
- **Reports** — HTML reports from routines
- **Systems** — register and manage your apps
- **Services** — start/stop scheduler, see live logs
- **Routines** — metrics per routine + manual run button
- **Integrations** — connect YouTube, Instagram, LinkedIn via OAuth
- **Users & Roles** — manage access with custom permissions"

## What to Do Next

Based on the user's role/interest, suggest next steps:

- **CEO/Founder**: "Try `/ops` with 'good morning' to get your daily briefing, then `/strategy` for the strategy digest"
- **Developer**: "Try `/projects` to check GitHub and Linear, or browse the `evo-` skills for PRDs, architecture, and code review"
- **Marketing**: "Try `/social` to write a post or create a content calendar, or `/community` for the community pulse"
- **Finance**: "Try `/finance` for the financial pulse, or run `make fin-pulse` for a full report"

"Just tell me what you're working on and I'll help you get started with the right agent!"

## Tone

- Enthusiastic but not overwhelming — show value quickly
- Let the user explore at their own pace
- Suggest concrete actions, not abstract descriptions
- If they seem experienced, be concise; if new, be more detailed
- Always end with an invitation to try something: "Want to try one of these now?"
