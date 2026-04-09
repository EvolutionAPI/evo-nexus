# Integrations Overview

OpenClaude connects to external services through three mechanisms: **MCP servers**, **API clients**, and **OAuth flows**. Each integration provides data to one or more agents and routines.

## Integration Types

### MCP Servers

Model Context Protocol servers run as sidecar processes alongside Claude Code. They expose tools that Claude can call natively during a session.

| Integration | MCP Server | Used By |
|---|---|---|
| Google Calendar | `google-calendar` | @clawdia (agenda, scheduling) |
| Gmail | `gmail` | @clawdia (triage, drafts, send) |
| GitHub | `github` | @atlas (PRs, issues, releases) |
| Linear | `linear-server` | @atlas (issues, sprints) |
| Telegram | `plugin:telegram` | @clawdia (notifications, bot) |
| Canva | `canva` | @pixel (designs, presentations) |
| Notion | `claude_ai_Notion` | Knowledge base |

MCP servers are configured in `.claude/settings.json`. Claude Code starts them automatically when their tools are needed.

### API Clients

Direct HTTP calls to service APIs, executed by skills and routines via Python scripts.

| Integration | Used By | Skills |
|---|---|---|
| Stripe | @flux | `int-stripe`, `fin-daily-pulse`, `fin-weekly-report` |
| Omie | @flux | `int-omie`, `fin-monthly-close-kickoff` |
| Discord | @pulse | `discord-get-messages`, `pulse-daily`, `pulse-weekly` |
| Fathom | @clawdia | `int-fathom`, `int-sync-meetings` |
| YouTube | @pixel | `int-youtube`, `social-youtube-report` |
| Instagram | @pixel | `int-instagram`, `social-instagram-report` |
| LinkedIn | @pixel | `int-linkedin`, `social-linkedin-report` |
| WhatsApp | @pulse | `int-whatsapp`, `pulse-daily` |
| Licensing | @atlas | `int-licensing`, `prod-licensing-daily` |

API clients read credentials from `.env` at runtime.

### OAuth Flows

Social media accounts (YouTube, Instagram, LinkedIn) use OAuth for authentication. The dashboard provides a built-in OAuth flow:

1. Go to **Integrations** in the dashboard
2. Click **Connect** on the platform you want
3. Complete the OAuth consent screen
4. Tokens are saved to `.env` automatically

OAuth requires client credentials configured in `.env`:

```env
# YouTube
YOUTUBE_OAUTH_CLIENT_ID=...
YOUTUBE_OAUTH_CLIENT_SECRET=...

# Instagram / Meta
META_APP_ID=...
META_APP_SECRET=...

# LinkedIn
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
```

## Checking Integration Status

### Dashboard

The **Integrations** page shows a status card for each service:
- **Green** -- connected and working
- **Yellow** -- credentials present but not verified
- **Red** -- missing credentials

### CLI

```bash
# Test a specific integration
make community     # tests Discord
make fin-pulse     # tests Stripe + Omie
make github        # tests GitHub
make social        # tests YouTube + Instagram + LinkedIn
```

## Configuration

All integration credentials live in `.env`. The setup wizard (`make setup`) generates this file with empty placeholders for each enabled integration.

You can edit credentials through:
- The dashboard **.env editor** (Config > .env)
- Directly in the terminal: `nano .env`

See individual integration guides for setup steps:
- [Discord](discord.md)
- [Stripe](stripe.md)
- [GitHub](github.md)
- [Google Calendar + Gmail](google.md)

## Multi-Account Support

Social media integrations support multiple accounts per platform using a numbered pattern:

```env
SOCIAL_YOUTUBE_1_LABEL=Main Channel
SOCIAL_YOUTUBE_1_ACCESS_TOKEN=ya29...
SOCIAL_YOUTUBE_1_CHANNEL_ID=UC...

SOCIAL_YOUTUBE_2_LABEL=Second Channel
SOCIAL_YOUTUBE_2_ACCESS_TOKEN=ya29...
SOCIAL_YOUTUBE_2_CHANNEL_ID=UC...
```

Analytics skills automatically aggregate across all connected accounts.
