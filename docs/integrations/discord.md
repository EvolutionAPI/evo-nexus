# Discord Integration

Discord integration enables community monitoring, message retrieval, channel management, and automated pulse reports via the @pulse agent.

## Setup

### 1. Create a Discord Bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application**, give it a name (e.g., "OpenClaude Bot")
3. Go to **Bot** in the sidebar
4. Click **Reset Token** and copy the token -- you will need this

Under **Privileged Gateway Intents**, enable:
- **Message Content Intent** (required to read messages)
- **Server Members Intent** (optional, for member stats)

### 2. Get Your Guild ID

1. In Discord, go to **User Settings > Advanced** and enable **Developer Mode**
2. Right-click your server name in the sidebar
3. Click **Copy Server ID** -- this is your Guild ID

### 3. Invite the Bot

Build an invite URL with the required permissions:

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_APP_ID&permissions=66560&scope=bot
```

Permission `66560` includes:
- Read Messages / View Channels
- Read Message History
- Send Messages

Replace `YOUR_APP_ID` with the Application ID from the developer portal (found on the General Information page).

### 4. Configure .env

```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_guild_id_here
```

You can set these via the terminal or the dashboard .env editor (Config > .env).

### 5. Test the Connection

```bash
make community
```

This runs the daily community pulse routine, which reads messages from all text channels in the last 24 hours and generates an HTML report. If the bot token and guild ID are correct, you will see output confirming the number of messages fetched.

## What It Does

The Discord integration powers several routines and skills:

| Skill / Routine | What it does |
|---|---|
| `discord-get-messages` | Fetch messages from specific channels with date filters |
| `discord-list-channels` | List all channels in the guild |
| `discord-send-message` | Send messages to a channel |
| `discord-manage-channel` | Update channel names, topics, permissions |
| `discord-create-channel` | Create new text/voice/announcement channels |
| `pulse-daily` | Daily community pulse -- sentiment, top topics, support questions |
| `pulse-weekly` | Weekly aggregate with trends and contributor stats |
| `pulse-monthly` | Monthly report with MAM, growth, and week-over-week analysis |
| `pulse-faq-sync` | Extract recurring questions into the FAQ knowledge base |

## Automated Routines

These routines use Discord data and run on schedule:

| Routine | Schedule | Make command |
|---|---|---|
| Community Pulse (daily) | 20:00 BRT | `make community` |
| FAQ Sync | 20:15 BRT | `make faq` |
| Community Weekly | Monday 09:30 BRT | `make community-week` |
| Community Monthly | 1st of month | `make community-month` |

## Channel Filtering

By default, the community pulse reads all text channels. To filter specific channels, configure them in `config/workspace.yaml`:

```yaml
integrations:
  discord:
    guild_id: "your_guild_id"
    channels:
      include:
        - general
        - support
        - feedback
      exclude:
        - bot-spam
        - admin-only
```

## Troubleshooting

**"401 Unauthorized"** -- Your bot token is invalid or expired. Generate a new one in the developer portal.

**"Missing Access"** -- The bot is not in the server, or lacks the Read Messages permission. Re-invite with the correct permissions.

**No messages returned** -- Check that **Message Content Intent** is enabled in the bot settings. Without it, message content is empty for bots in 100+ member servers.
