# Makefile Reference

All available `make` commands. Run `make help` to see this list in your terminal.

## Setup

```bash
make setup           # Interactive setup wizard
                     # Checks prerequisites (Claude Code, uv, Node.js)
                     # Creates config files, .env, CLAUDE.md, workspace folders
                     # Builds the dashboard frontend
```

## Dashboard

```bash
make dashboard-app   # Start the web dashboard (React + Flask) on localhost:8080
                     # Builds frontend, then starts the Flask backend
```

## Core Routines

These ship with the repo and run the essential daily loop:

```bash
make morning         # Morning briefing -- agenda, emails, tasks (@clawdia)
make eod             # End of day -- memory, logs, learnings (@clawdia)
make memory          # Memory sync -- consolidate agent memory (@clawdia)
make weekly          # Full weekly review (@clawdia)
```

## Custom Routines -- Daily

```bash
make sync            # Sync Fathom meetings (@clawdia)
make triage          # Email triage (@clawdia)
make review          # Organize Todoist tasks (@clawdia)
make dashboard       # Consolidated 360 dashboard (@clawdia)
make community       # Daily Discord community pulse (@pulse)
make faq             # FAQ sync -- Discord + GitHub (@pulse)
make fin-pulse       # Financial pulse -- Stripe + Omie snapshot (@flux)
make licensing       # Licensing daily -- open source telemetry (@atlas)
make social          # Social analytics -- cross-platform report (@pixel)
make youtube         # YouTube channel analytics (@pixel)
make instagram       # Instagram profile analytics (@pixel)
make linkedin        # LinkedIn profile analytics (@pixel)
```

## Custom Routines -- Weekly

```bash
make fin-weekly      # Financial weekly report (@flux)
make licensing-weekly # Licensing weekly -- open source growth (@atlas)
make trends          # Trend analysis -- community, GitHub, financial (@clawdia)
make linear          # Linear review -- issues, blockers, stale (@atlas)
make github          # GitHub review -- PRs, issues, stars (@atlas)
make community-week  # Weekly Discord community report (@pulse)
make strategy        # Strategy digest -- consolidated business view (@sage)
make health          # Weekly health check-in (@kai)
```

## Custom Routines -- Monthly

```bash
make fin-close       # Monthly close kickoff (@flux)
make community-month # Monthly community report (@pulse)
make licensing-month # Monthly licensing report (@atlas)
```

## Combos

```bash
make daily           # Runs: sync + review (sync meetings then organize tasks)
```

## Servers

```bash
make scheduler       # Start the routine scheduler (runs in foreground)
make telegram        # Start Telegram bot in background (screen session)
make telegram-stop   # Stop the Telegram bot
make telegram-attach # Attach to Telegram terminal (Ctrl+A D to detach)
```

## Observability

```bash
make logs            # Show latest JSONL log entries
make logs-detail     # List detailed log files
make logs-tail       # Show the latest full detailed log
make metrics         # Per-routine metrics table (runs, cost, tokens, success rate)
make clean-logs      # Remove logs older than 30 days
```

## Docker (VPS Deployment)

```bash
make docker-up       # Start scheduler + telegram in Docker
make docker-down     # Stop all containers
make docker-logs     # Show container logs (follow mode)
make docker-run ADW=good_morning.py  # Run a specific routine in Docker
make docker-build    # Build the Docker image
```

## Help

```bash
make help            # Show all available commands with descriptions
```
