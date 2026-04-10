# Getting Started with EvoNexus

## Prerequisites

- **Claude Code CLI** — [Install Claude Code](https://claude.ai/claude-code)
- **Python 3.11+** with [uv](https://docs.astral.sh/uv/)
- **Node.js 18+** (for the dashboard)
- **API keys** for integrations you want to use

## Installation

### 1. Quick Install (recommended)

```bash
npx @evoapi/evo-nexus
```

This downloads and runs the interactive setup wizard automatically.

### Alternative: Manual Clone

```bash
git clone https://github.com/EvolutionAPI/evo-nexus.git
cd evo-nexus

# Interactive setup wizard
make setup
# Or: python setup.py
```

The wizard asks for:
- Your name and company
- Timezone and language
- Which agents to enable
- Which integrations to configure

It generates:
- `config/workspace.yaml` — central config
- `config/routines.yaml` — routine schedules
- `.env` — API keys (fill in after setup)
- `CLAUDE.md` — context file for Claude

### 2. Configure API Keys

Edit `.env` with your keys:

```bash
nano .env
```

At minimum, you need:
- No keys required for basic operation (agents, skills work without integrations)
- `DISCORD_BOT_TOKEN` — for community monitoring
- `STRIPE_SECRET_KEY` — for financial routines
- Social OAuth keys — via the dashboard Integrations page

### 3. Start the Dashboard

```bash
make dashboard-app
```

Open http://localhost:8080 — the first run shows a setup wizard where you create your admin account and configure the workspace.

![Dashboard](imgs/doc-overview.png)

### 4. Start Automated Routines

```bash
make scheduler
```

This starts the scheduler that runs routines at their configured times (see `config/routines.yaml`).

### 5. Use Claude Code — start with `/oracle`

Open Claude Code in this directory. It reads `CLAUDE.md` automatically and has access to all agents and skills.

**First thing to run: `/oracle`.** Oracle is the official entry point — it interviews you about your business, maps workspace capabilities to your pain points, and delivers a **phased activation plan** through the `prod-activation-plan` skill (index file + folder-per-phase + file-per-item, each with suggested agent team and pending decisions). You never have to guess the next step.

```bash
/oracle        # Start here — business discovery + activation plan
```

After the plan is ready, you can invoke individual agents:

```bash
/clawdia       # Operations hub
/flux          # Financial analysis
/atlas         # Project management
/pulse         # Community pulse
/pixel         # Social media

# Or let Claude route automatically based on your request
```

## Next Steps

- Read [Architecture](architecture.md) to understand how agents, skills, and routines work together
- Browse `.claude/skills/CLAUDE.md` for the full skill index (~130 skills)
- Check `ROUTINES.md` for routine documentation
- Customize `config/routines.yaml` to adjust schedules
