# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-04-08

### Added
- **Silent Licensing** — automatic registration via Evolution Foundation licensing server (`POST /v1/register/direct`)
- **Systems CRUD** — register and manage apps/services from the dashboard (Docker, external URLs, iframe)
- **Roles & Permissions** — custom roles with granular permission matrix, editable via dashboard
- **Onboarding Skill** (`initial-setup`) — guides new users through agents, skills, routines, and dashboard
- **Screenshots** in README (overview, chat, integrations, costs)
- **Integrations table** in README with 16 services documented

### Changed
- **English-first codebase** — translated all agents, skills, templates, routines, and config from Portuguese to English
- **Workspace folders** renamed from PT (`01 Daily Logs`, `05 Financeiro`) to EN (`workspace/daily-logs`, `workspace/finance`)
- **ROTINAS.md** renamed to **ROUTINES.md**
- **Setup wizard** simplified — only asks name, company, timezone, language, port (all agents enabled by default)
- **Dashboard setup** skips workspace config if CLI setup was already done
- **HTML templates** standardized — Evolution Foundation logo + "OpenClaude" branding in all 16 templates
- **Makefile** auto-detects `uv` or falls back to `python3`
- **Dashboard port** now reads from `workspace.yaml` or `OPENCLAUDE_PORT` env
- All Python dependencies consolidated in `pyproject.toml` (removed separate `requirements.txt`)
- Positioned as Claude Code alternative to OpenClaw in README

### Removed
- **Evo Method** (`_evo/`) — removed from tracking (separate project)
- **Proprietary skills** — licensing and whatsapp skills excluded from open source
- **CLAUDE.template.md** — setup generates CLAUDE.md inline
- **Portuguese folder names** (01-09) — replaced with `workspace/` EN structure
- **Social auth standalone** — OAuth now only via dashboard Integrations page

### Fixed
- Scheduler logs now show real process output (not random routine detail)
- SQLite WAL files (.db-shm, .db-wal) properly gitignored
- Users page `active` → `is_active` field alignment
- Audit log dates (ISO format with T separator)
- Routine run button shows visual feedback (loading → success → error)
- `flask-sock` added to dependencies (WebSocket terminal)
- Auth permissions shape mismatch between backend and frontend
- Self-demotion guard on user role changes
- Secret key persisted across restarts

## [0.1.0] - 2026-04-08

### Added
- Initial open source release
- **9 Specialized Agents** — Ops, Finance, Projects, Community, Social, Strategy, Sales, Courses, Personal
- **126 Skills** organized by domain prefix
- **27 Automated Routines** — daily, weekly, monthly ADWs with scheduler
- **16 HTML Report Templates** — dark-themed dashboards with Evolution Foundation branding
- **Web Dashboard (OpenClaude)** — React + Flask with auth, roles, web terminal, service management
- **Integration Clients** — Stripe, Omie ERP, YouTube, Instagram, LinkedIn, Discord
- **ADW Runner** — execution engine with token/cost tracking, JSONL logs
- **Persistent Memory** — two-tier system (CLAUDE.md + memory/) with per-agent memory
- **Setup Wizard** — interactive CLI (`make setup`) + web-based first-run
- **Docker Support** — Dockerfile + docker-compose for VPS deployment
