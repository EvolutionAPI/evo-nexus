# Routine Examples

Walkthrough of two real routines showing how all the pieces fit together.

## Example 1: Community Pulse

**What it does**: Reads Discord and WhatsApp messages from the last 24 hours, analyzes activity, sentiment, and support questions, then generates an HTML report.

**Agent**: Pulse (`pulse-community`)
**Skill**: `pulse-daily`
**Schedule**: Daily at 20:00

### The script

`ADWs/routines/custom/community_daily.py`:

```python
#!/usr/bin/env python3
"""ADW: Community Daily Pulse -- Daily community report via Pulse"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)))))
from runner import run_skill, banner, summary

def main():
    banner("Community Pulse", "Discord - Activity - Sentiment - Support | @pulse")
    results = []
    results.append(run_skill(
        "pulse-daily",
        log_name="community-daily",
        timeout=600,
        agent="pulse-community"
    ))
    summary(results, "Community Daily Pulse")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nCancelled.")
```

### How it flows

1. **Runner** calls `claude --print --agent pulse-community` with a prompt to execute `/pulse-daily`
2. **Claude** loads the Pulse agent system prompt
3. **Pulse** reads the `pulse-daily` SKILL.md instructions
4. The skill tells Pulse to:
   - Fetch Discord messages via the Discord API
   - Fetch WhatsApp messages via the Evolution API
   - Analyze activity, sentiment, top topics, support questions
   - Read the HTML template from `.claude/templates/html/`
   - Fill the template with collected data
   - Save to `workspace/community/reports/daily/`
   - Send a Telegram notification with the summary
5. **Runner** logs the result and updates metrics

### The schedule entry

In `config/routines.yaml`:

```yaml
daily:
  - name: "Community Pulse"
    script: community_daily.py
    time: "20:00"
    enabled: true
```

### Output

An HTML report saved to:
```
workspace/community/reports/daily/[C] 2026-04-08-community-pulse.html
```

Plus a Telegram message with a brief summary.

---

## Example 2: Financial Pulse

**What it does**: Queries Stripe for MRR, charges, churn, and failures. Queries Omie for payables, receivables, and invoices. Generates an HTML financial snapshot.

**Agent**: Flux (`flux-finance`)
**Skill**: `fin-daily-pulse`
**Schedule**: Daily at 19:00

### The script

`ADWs/routines/custom/financial_pulse.py`:

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

### What the skill does (step by step)

The `fin-daily-pulse` SKILL.md instructs Flux to:

1. **Collect Stripe data** -- MRR from active subscriptions, today's charges (succeeded vs failed), 30-day churn rate, 7-day refunds, new customers
2. **Collect Omie data** -- overdue receivables, payables due in 7 days, pending invoices
3. **Consolidate transactions** -- all financial movements for the day
4. **Classify health** -- green (healthy), yellow (warning), or red (risk) based on churn rate, overdue amounts, and MRR trend
5. **Generate alerts** -- payment failures, overdue accounts, missing invoices, anomalies
6. **Fill HTML template** -- reads `.claude/templates/html/custom/financial-pulse.html` and replaces placeholders
7. **Save** to `workspace/finance/reports/daily/[C] YYYY-MM-DD-financial-pulse.html`
8. **Notify via Telegram** -- sends a short summary with MRR and alert count

---

## Adapting an Example for Your Use Case

To create a routine similar to these:

### 1. Identify the components

| Component | Your version |
|-----------|-------------|
| **Agent** | Which agent should run this? (or create a new one) |
| **Skill** | Does a skill exist, or do you need to create one? |
| **Data source** | What API or integration provides the data? |
| **Output** | HTML report? Markdown file? Telegram notification? |

### 2. Create or reuse a skill

If an existing skill covers your use case, reuse it. Otherwise create a new SKILL.md in `.claude/skills/my-skill/SKILL.md` with step-by-step instructions.

### 3. Create the routine script

Copy one of the examples above and change:
- The skill name in `run_skill()`
- The agent name
- The log name
- The banner text

### 4. Register the schedule

Add an entry to `config/routines.yaml` and optionally add a Makefile target:

```makefile
my-routine:         ## Description of my routine (@agent)
	$(PYTHON) $(ADW_DIR)/custom/my_routine.py
```

### 5. Test manually

```bash
make my-routine
# or
python3 ADWs/routines/custom/my_routine.py
```

Check `make logs` and `make metrics` to verify it ran correctly.

### Using the create-routine skill

Instead of doing this manually, run `/create-routine` in Claude Code. It generates the script, Makefile target, and schedule entry for you.
