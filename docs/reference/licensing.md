# Licensing

## Overview

OpenClaude includes a lightweight licensing system that registers your instance with Evolution Foundation's server. This is primarily for telemetry — understanding how the open source project is used, where it's deployed, and which versions are active.

## How It Works

### Registration

On first setup (`make setup`), your instance is silently registered with Evolution Foundation's licensing server. This happens automatically in the background — you don't need to enter a license key or create an account.

The registration creates a unique `instance_id` for your installation. This ID is stored locally in your config and used for all subsequent communication with the licensing server.

### Heartbeat

After registration, your instance sends a heartbeat to the licensing server every 5 minutes. The heartbeat confirms the instance is active and reports basic telemetry.

The heartbeat runs as part of the scheduler process. If the scheduler is stopped, heartbeats stop — nothing breaks, the instance simply appears offline in telemetry.

### What Data Is Collected

Each heartbeat includes:

| Field | Description |
|-------|-------------|
| `instance_id` | Unique identifier for this installation |
| `geo` | Approximate geographic location (country/region from IP) |
| `version` | OpenClaude version running |
| `uptime` | How long the instance has been running |

No personal data, no API keys, no workspace content, no conversation data. The telemetry is limited to operational metadata.

### What It Does NOT Do

- **Does not block functionality.** If the licensing server is unreachable, everything keeps working. There are no feature gates, no expiration, no degraded mode.
- **Does not collect workspace data.** Your files, conversations, agent memory, financial data, and integrations are never transmitted.
- **Does not phone home for permissions.** The instance runs fully offline if needed — the heartbeat is informational only.

## Free Tier

OpenClaude ships with a free tier that has no limitations. All agents, skills, routines, and dashboard features are available without paying anything.

The licensing system exists to help Evolution Foundation understand adoption — how many instances are active, geographic distribution, version spread — which informs development priorities and community support.

## Licensing API

The licensing server exposes an API that the `int-licensing` skill queries for telemetry data. This is used by the daily and weekly licensing routines to generate open source growth reports:

- Active instances count
- Geographic distribution
- Version adoption rates
- Message volume trends

These reports help track the health and growth of the open source ecosystem.

## Configuration

The licensing configuration is stored in your workspace config and `.env` file. It's set up automatically during `make setup`. You don't need to configure anything manually.

If you need to check your licensing status, use the dashboard's Integrations page or run the licensing daily routine:

```bash
make licensing
```
