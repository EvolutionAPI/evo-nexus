# Routines Overview

Routines are automated workflows (ADWs -- AI Developer Workflows) that run on a schedule. Each routine is a Python script that invokes a skill through an agent via the Claude Code CLI.

## Core vs Custom

```
ADWs/routines/
  good_morning.py       # Core (ships with the repo)
  end_of_day.py         # Core
  memory_sync.py        # Core
  weekly_review.py      # Core
  custom/               # User-created (gitignored)
    community_daily.py
    financial_pulse.py
    ...
```

**Core routines** ship with the repo and cover the essential daily loop: morning briefing, end of day, memory sync, and weekly review.

**Custom routines** live in `ADWs/routines/custom/` and are gitignored. You create these for your specific integrations (Discord, Stripe, YouTube, etc). The `create-routine` skill helps generate them.

## ADW Runner

All routines use `ADWs/runner.py`, which provides:

- **`run_skill(skill, log_name, timeout, agent)`** -- executes a skill via Claude Code CLI
- **`run_claude(prompt, log_name, timeout, agent)`** -- executes a raw prompt
- **`banner(title, subtitle)`** -- prints a styled header
- **`summary(results, title)`** -- prints execution summary with cost/token stats

The runner handles:
- Invoking `claude --print --dangerously-skip-permissions --output-format json`
- Passing the `--agent` flag to run as a specific agent
- Logging to JSONL files (`ADWs/logs/YYYY-MM-DD.jsonl`)
- Saving detailed logs (`ADWs/logs/detail/`)
- Accumulating metrics per routine (`ADWs/logs/metrics.json`)
- Rich terminal output with progress indicators

## How a Routine Script Works

Every routine follows the same pattern:

```python
#!/usr/bin/env python3
"""ADW: Financial Pulse -- Daily financial snapshot via Flux"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)))))
from runner import run_skill, banner, summary

def main():
    banner("Financial Pulse", "Stripe - Omie - MRR - Churn | @flux")
    results = []
    results.append(run_skill(
        "fin-daily-pulse",
        log_name="financial-pulse",
        timeout=600,
        agent="flux-finance"
    ))
    summary(results, "Financial Pulse")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nCancelled.")
```

Key elements:
1. Import the runner from `ADWs/runner.py`
2. Print a banner with the routine name
3. Call `run_skill()` with the skill name, log name, timeout, and agent
4. Print a summary

For multi-step routines, append multiple results to the list.

## config/routines.yaml

This file defines the schedule for all routines:

```yaml
daily:
  - name: "Community Pulse"
    script: community_daily.py
    time: "20:00"
    enabled: true

  - name: "Sync Meetings"
    script: sync_meetings.py
    interval: 30          # Every 30 minutes instead of fixed time
    enabled: true

weekly:
  - name: "Financial Weekly"
    script: financial_weekly.py
    day: friday
    time: "07:30"
    enabled: true

  - name: "Linear Review"
    script: linear_review.py
    days: [monday, wednesday, friday]   # Multiple days
    time: "09:00"
    enabled: true

monthly:
  - name: "Monthly Close"
    script: monthly_close.py
    day: 1                # Day of month
    time: "08:00"
    enabled: true
```

Fields:
- `name`: Display name
- `script`: Python file in `ADWs/routines/` or `ADWs/routines/custom/`
- `time`: Execution time (24h format, local timezone)
- `interval`: Run every N minutes (instead of fixed time)
- `day`: Day of week (weekly) or day of month (monthly)
- `days`: Array for multi-day weekly schedules
- `enabled`: Toggle on/off without deleting

## Scheduler

Start the scheduler with:

```bash
make scheduler
```

This runs `scheduler.py`, which reads `config/routines.yaml` and executes each routine at its scheduled time. The scheduler runs in the foreground and shows real-time progress.

The dashboard also starts/stops the scheduler from the **Services** page.

## Creating Custom Routines

### Using the skill

```
/create-routine
```

The `create-routine` skill walks you through:
1. What the routine does
2. Which agent runs it
3. Which skill it invokes
4. The schedule (daily/weekly/monthly)

It generates the Python script, adds a Makefile target, and updates `config/routines.yaml`.

### Manually

1. Create `ADWs/routines/custom/my_routine.py` following the pattern above
2. Add an entry to `config/routines.yaml`
3. Add a Makefile target (optional, for manual runs)

## Manual Execution

Run any routine directly via make:

```bash
make morning         # Morning briefing
make eod             # End of day
make community       # Community pulse
make fin-pulse       # Financial pulse
make weekly          # Weekly review
make licensing       # Licensing daily
make social          # Social analytics
```

Or run the Python script directly:

```bash
python3 ADWs/routines/custom/community_daily.py
```

## Logs and Metrics

### Log files

```
ADWs/logs/
  2026-04-08.jsonl           # Daily JSONL log (one line per run)
  metrics.json               # Accumulated metrics per routine
  detail/                    # Full stdout/stderr per run
    20260408-200000-community-daily.log
```

### Viewing logs

```bash
make logs            # Latest JSONL entries
make logs-detail     # List detailed log files
make logs-tail       # Show the latest full log
make metrics         # Per-routine metrics table
make clean-logs      # Remove logs older than 30 days
```

### Metrics format

`metrics.json` tracks per routine:
- Total runs, successes, failures, success rate
- Average duration
- Total and average cost (USD)
- Total input/output tokens
- Last run timestamp
