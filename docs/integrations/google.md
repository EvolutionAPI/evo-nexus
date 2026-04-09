# Google Calendar + Gmail Integration

Google Calendar and Gmail are connected via MCP servers, giving Claude Code native access to your calendar and inbox. The @clawdia agent uses these for morning briefings, email triage, scheduling, and follow-up tracking.

## MCP Setup

Both services use separate MCP servers. If you selected Google integrations during `make setup`, they are already configured in `.claude/settings.json`.

### Google Calendar MCP

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/google-calendar-mcp"],
      "env": {
        "GOOGLE_OAUTH_CREDENTIALS": "<path-to-credentials.json>",
        "GOOGLE_OAUTH_TOKEN": "<path-to-token.json>"
      }
    }
  }
}
```

### Gmail MCP

```json
{
  "mcpServers": {
    "gmail": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/gmail-mcp"],
      "env": {
        "GOOGLE_OAUTH_CREDENTIALS": "<path-to-credentials.json>",
        "GOOGLE_OAUTH_TOKEN": "<path-to-token.json>"
      }
    }
  }
}
```

## Google Cloud Setup

Both MCPs share the same OAuth credentials.

### 1. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Enable the **Google Calendar API** and **Gmail API** from the API Library

### 2. Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Application type: **Desktop app**
4. Download the JSON file and save it (e.g., `~/.config/google/credentials.json`)

### 3. Authorize on First Run

The first time Claude Code invokes a Google MCP tool, it opens a browser window for OAuth consent. Sign in with your Google account and grant the requested permissions. The token is saved to the path specified in `GOOGLE_OAUTH_TOKEN`.

## Calendar Operations

The Google Calendar MCP provides these tools:

| Tool | What it does |
|---|---|
| `gcal_list_events` | List upcoming events with date range filter |
| `gcal_get_event` | Get details of a specific event |
| `gcal_create_event` | Create a new calendar event |
| `gcal_update_event` | Update an existing event |
| `gcal_delete_event` | Delete an event |
| `gcal_find_my_free_time` | Find available time slots |
| `gcal_find_meeting_times` | Find times when multiple people are free |
| `gcal_list_calendars` | List all calendars |
| `gcal_respond_to_event` | Accept, decline, or tentatively accept |

### Example Usage in Claude Code

```
> What's on my calendar today?
> Find a 30-minute slot tomorrow afternoon
> Create a meeting with Danilo on Friday at 2pm about sprint planning
> Accept the invitation from Marcelo
```

## Gmail Operations

The Gmail MCP provides these tools:

| Tool | What it does |
|---|---|
| `gmail_search_messages` | Search inbox with Gmail query syntax |
| `gmail_read_message` | Read a specific email |
| `gmail_read_thread` | Read an entire email thread |
| `gmail_create_draft` | Create a draft reply or new email |
| `gmail_list_drafts` | List existing drafts |
| `gmail_list_labels` | List all labels/folders |
| `gmail_get_profile` | Get account info |

### Example Usage in Claude Code

```
> Show me unread emails from today
> Read the latest email from Samara
> Draft a reply to the HostGator thread
> Search for emails about "invoice" from last week
```

### Email Triage

The `gog-email-triage` skill uses Gmail MCP to:
1. Fetch unread emails from the last N hours
2. Classify each by urgency (P0-P3) and category
3. Propose actions: reply, archive, create task, schedule follow-up

Run it manually or let the scheduler handle it:

```bash
make triage    # runs daily at 07:15 BRT
```

### Sending Emails

Email sending requires explicit confirmation. The `gog-email-send` skill asks for the exact string `YES, SEND` before executing. All sends are logged to the audit trail.

## Skills That Use Google

| Skill | Service | What it does |
|---|---|---|
| `gog-calendar` | Calendar | View agenda, find slots, create events |
| `gog-email-triage` | Gmail | Triage and prioritize inbox |
| `gog-email-draft` | Gmail | Draft replies and new messages |
| `gog-email-send` | Gmail | Send with explicit confirmation |
| `gog-followups` | Gmail | Track stale threads, generate reminders |
| `gog-tasks` | Tasks | Create and manage tasks from emails |
| `prod-good-morning` | Both | Morning briefing with agenda + inbox summary |

## Troubleshooting

**"Token expired"** -- Delete the token file and restart Claude Code. It will re-prompt for OAuth consent.

**"Access denied"** -- Ensure both Calendar API and Gmail API are enabled in your Google Cloud project.

**"MCP server not found"** -- Run `npx -y @anthropic-ai/google-calendar-mcp` manually to verify it installs correctly. Requires Node.js 18+.
