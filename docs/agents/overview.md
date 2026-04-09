# Agents Overview

Agents are the core of OpenClaude. Each agent is a specialized AI persona with its own domain, system prompt, skills, and persistent memory.

## What Is an Agent?

An agent is a markdown file in `.claude/agents/` that contains:

- **Frontmatter** with metadata (name, description, model, color, memory scope)
- **System prompt** that defines the agent's identity, responsibilities, tone, and behavior

When invoked, Claude Code loads the agent's system prompt and operates within that persona for the duration of the task.

## How to Invoke an Agent

### Slash commands

Each agent has a corresponding command in `.claude/commands/`:

```
/clawdia    — Ops hub: agenda, emails, tasks, decisions
/flux       — Finance: Stripe, ERP, cash flow, reports
/atlas      — Projects: Linear, GitHub, sprints, milestones
/pulse      — Community: Discord, WhatsApp, sentiment, FAQ
/pixel      — Social media: content, calendar, analytics
/sage       — Strategy: OKRs, roadmap, competitive analysis
/nex        — Sales: pipeline, proposals, qualification
/mentor     — Courses: learning paths, modules
/kai        — Personal: health, habits, routine
```

Usage in Claude Code:

```
/clawdia check my emails
/flux what is the company's financial status?
/pulse how is the community doing?
```

### Auto-routing

You do not need to pick the right agent manually. Just describe what you need and Claude routes to the correct agent based on the `description` field in each agent's frontmatter.

Examples:

| You say | Agent activated |
|---------|----------------|
| "good morning" | Clawdia |
| "monthly closing" | Flux |
| "check github PRs" | Atlas |
| "community sentiment" | Pulse |
| "write a LinkedIn post" | Pixel |
| "should we prioritize X or Y?" | Sage |
| "prepare a proposal for client Z" | Nex |
| "create a course module" | Mentor |
| "how is my health progress?" | Kai |

The routing logic uses example interactions in each agent's `description` field to match user intent.

## Agent Memory

Every agent has persistent, file-based memory at:

```
.claude/agent-memory/<agent-name>/
```

Memory is organized by type:

| Type | Purpose |
|------|---------|
| `user` | Who the user is, their role, preferences |
| `feedback` | Corrections and confirmed approaches |
| `project` | Ongoing work, deadlines, decisions |
| `reference` | Pointers to external systems |

Each memory file uses frontmatter (`name`, `description`, `type`) and a `MEMORY.md` index file tracks all entries. Agents read memory at the start of each session and update it as they learn.

## All 9 Agents

| Agent | File | Command | Domain | Color |
|-------|------|---------|--------|-------|
| **Clawdia** | `clawdia-assistant.md` | `/clawdia` | Ops: agenda, emails, tasks, meetings, decisions | cyan |
| **Flux** | `flux-finance.md` | `/flux` | Finance: Stripe, Omie, cash flow, monthly close | orange |
| **Atlas** | `atlas-project.md` | `/atlas` | Projects: Linear, GitHub, sprints, licensing | - |
| **Pulse** | `pulse-community.md` | `/pulse` | Community: Discord, WhatsApp, sentiment, FAQ | blue |
| **Pixel** | `pixel-social-media.md` | `/pixel` | Social: content, calendar, cross-platform analytics | - |
| **Sage** | `sage-strategy.md` | `/sage` | Strategy: OKRs, roadmap, competitive analysis | orange |
| **Nex** | `nex-sales.md` | `/nex` | Sales: pipeline, proposals, qualification | - |
| **Mentor** | `mentor-courses.md` | `/mentor` | Courses: learning paths, modules, academy | - |
| **Kai** | `kai-personal-assistant.md` | `/kai` | Personal: health, habits, routine (isolated) | blue |

### Agent Roles in Detail

**Clawdia** is the default agent and operational hub. Morning briefings, email triage, task management, meeting summaries, and end-of-day consolidation all run through Clawdia.

**Flux** acts as a virtual CFO. It queries Stripe for MRR/churn and Omie for payables/receivables, generates financial reports, and manages the monthly close process.

**Atlas** tracks development work across Linear and GitHub. Sprint status, PR reviews, issue tracking, and open source licensing telemetry are its domain.

**Pulse** monitors community health across Discord and WhatsApp. It generates daily/weekly/monthly pulse reports, tracks sentiment, identifies recurring questions, and maintains the FAQ.

**Pixel** manages social media across YouTube, Instagram, and LinkedIn. Content creation, calendar planning, cross-platform analytics, and engagement tracking.

**Sage** handles high-level strategy. OKR reviews, competitive analysis, strategy digests, and decision frameworks.

**Nex** manages the sales pipeline. Lead qualification, proposals, and commercial workflows.

**Mentor** handles the course platform (Evo Academy). Learning paths, module creation, and educational content.

**Kai** is the personal assistant with an isolated domain. Health tracking, habits, personal appointments, and routines. It does not handle professional matters.
