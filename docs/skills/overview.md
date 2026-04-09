# Skills Overview

Skills teach Claude new capabilities through markdown instructions. They are not plugins or code — they are structured prompts that Claude follows when a skill is triggered.

## What Is a Skill?

A skill is a directory in `.claude/skills/` containing a `SKILL.md` file with:

- **Frontmatter** (`name`, `description`) that controls when the skill triggers
- **Instructions** that tell Claude exactly what to do, step by step

```
.claude/skills/
  fin-daily-pulse/
    SKILL.md          # The skill definition
  social-post-writer/
    SKILL.md
  int-stripe/
    SKILL.md
```

## Skill Categories

Skills are organized by prefix:

| Prefix | Category | Count | Examples |
|--------|----------|-------|----------|
| `evo-` | Evo Method (dev, architect, QA, PM) | ~45 | `evo-dev`, `evo-create-prd`, `evo-code-review` |
| `social-` | Social media | ~17 | `social-post-writer`, `social-analytics-report` |
| `int-` | Integrations | ~13 | `int-stripe`, `int-discord`, `int-youtube` |
| `fin-` | Finance | ~11 | `fin-daily-pulse`, `fin-weekly-report`, `fin-reconciliation` |
| `prod-` | Productivity | ~9 | `prod-good-morning`, `prod-end-of-day`, `prod-dashboard` |
| `mkt-` | Marketing | ~8 | `mkt-campaign-plan`, `mkt-seo-audit`, `mkt-content-creation` |
| `gog-` | Google (Gmail, Calendar) | ~6 | `gog-email-triage`, `gog-calendar`, `gog-tasks` |
| `obs-` | Obsidian | ~5 | `obs-obsidian-cli`, `obs-obsidian-markdown` |
| `discord-` | Discord | ~5 | `discord-get-messages`, `discord-send-message` |
| `pulse-` | Community | ~4 | `pulse-daily`, `pulse-weekly`, `pulse-monthly` |
| `sage-` | Strategy | ~3 | `sage-okr-review`, `sage-strategy-digest` |

## How Triggering Works

The `description` field in SKILL.md frontmatter tells Claude when to activate the skill. Claude matches user intent against all skill descriptions and picks the best match.

Example from `fin-daily-pulse`:

```yaml
---
name: fin-daily-pulse
description: "Daily financial pulse -- queries Stripe (MRR, charges, churn, failures) and Omie (accounts payable/receivable, invoices) to generate an HTML snapshot of the company's financial health. Trigger when user says 'financial pulse', 'financial snapshot', or 'financial metrics'."
---
```

Key tips for good descriptions:
- State what the skill does concretely
- List trigger phrases the user might say
- Be specific enough to avoid overlapping with other skills

## SKILL.md Structure

```markdown
---
name: my-skill-name
description: "What it does and when to trigger it."
---

# Skill Title

Brief description of what the skill produces.

## Step 1 -- Gather Data

Instructions for the first step...

## Step 2 -- Process

Instructions for processing...

## Step 3 -- Generate Output

Where and how to save the output...

## Step 4 -- Confirm

What to show the user when done...
```

## Creating a New Skill

### 1. Create the directory and file

```bash
mkdir -p .claude/skills/my-new-skill
```

### 2. Write SKILL.md

```markdown
---
name: my-new-skill
description: "Generate a weekly team standup summary from Linear issues and GitHub PRs. Trigger when user says 'standup summary', 'team update', or 'what did the team do'."
---

# Team Standup Summary

Generates a weekly summary of team activity.

## Step 1 -- Collect Linear Data

Use the `/int-linear-review` skill to fetch:
- Issues completed this week
- Issues in progress
- Blockers

## Step 2 -- Collect GitHub Data

Use the `/int-github-review` skill to fetch:
- PRs merged this week
- PRs in review

## Step 3 -- Generate Summary

Format as a markdown report with sections:
- Completed
- In Progress
- Blocked
- Highlights

## Step 4 -- Save

Save to `workspace/projects/reports/[C] YYYY-MM-DD-standup.md`
```

### 3. Test it

Open Claude Code and say: "generate a standup summary" -- Claude should match your skill's description and follow the instructions.

## Skills vs Agents

| | Agent | Skill |
|---|---|---|
| **What** | Persona with identity and memory | Step-by-step instructions |
| **Scope** | Broad domain (finance, community) | Specific task (daily pulse, post writer) |
| **Memory** | Persistent across sessions | None (stateless) |
| **Invoked by** | Slash command or auto-routing | Description matching or agent delegation |

Skills are often used *by* agents. For example, the Flux agent uses `fin-daily-pulse`, `fin-weekly-report`, and `int-stripe` skills to do its work. Routines invoke skills through agents via the runner.
