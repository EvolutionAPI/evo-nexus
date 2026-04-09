# GitHub Integration

GitHub is connected via both **MCP server** (for Claude Code sessions) and **CLI** (`gh` command, for automated routines). The @atlas agent uses it for PR reviews, issue tracking, release management, and code search.

## MCP Setup

The GitHub MCP server is configured in `.claude/settings.json`. If you selected GitHub during `make setup`, it is already configured.

To verify or add it manually, ensure this entry exists in `.claude/settings.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}
```

### Creating a Personal Access Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)** or use **Fine-grained tokens**
3. Select scopes:
   - `repo` -- full repository access (PRs, issues, code)
   - `read:org` -- read org membership (for team queries)
   - `read:user` -- read user profile
4. Copy the token and add it to the MCP config above

For fine-grained tokens, grant access to the specific repositories you want to manage.

## What It Can Do

The GitHub MCP server exposes tools for:

| Category | Operations |
|---|---|
| **Pull Requests** | List, search, create, update, merge, review, comment |
| **Issues** | List, search, create, update, close, comment, assign |
| **Releases** | List, get latest, get by tag |
| **Code Search** | Search code across repositories |
| **Repositories** | Search, create, fork, get file contents |
| **Branches** | List, create |
| **Commits** | List, get details |
| **Teams** | List teams, get members |

## Using GitHub in Claude Code

Once the MCP is configured, you can interact with GitHub naturally:

```
> Show me open PRs on EvolutionAPI/evolution-api
> What issues are assigned to me?
> Search for usages of "handleWebhook" across our repos
> Create a PR from this branch with a summary of changes
```

Claude routes these requests through the GitHub MCP tools automatically.

## Automated Routines

The @atlas agent runs GitHub reviews on schedule using the `int-github-review` skill:

| Routine | Schedule | Make command |
|---|---|---|
| GitHub Review | Mon/Wed/Fri 09:15 BRT | `make github` |
| Licensing Weekly | Friday 07:45 BRT | `make licensing-weekly` |

The GitHub review checks:
- Open PRs needing review
- Community issues (bug reports, feature requests)
- Recent releases
- Stars and fork trends
- Contributor activity

## Testing

```bash
# Run the GitHub review routine
make github

# Or test MCP directly in Claude Code
# (open Claude Code in the project directory)
> List the 5 most recent PRs on EvolutionAPI/evolution-api
```

## gh CLI

Some routines also use the `gh` CLI (GitHub's official command-line tool). It authenticates separately:

```bash
gh auth login
```

The `gh` CLI is used by the runner scripts for operations that are simpler via CLI than MCP (e.g., checking PR merge status, listing workflow runs).

## Configuring Repositories

Set the repositories to monitor in `config/workspace.yaml`:

```yaml
integrations:
  github:
    repos:
      - EvolutionAPI/evolution-api
      - EvolutionAPI/evo-ai
      - EvolutionAPI/evolution-go
```

The GitHub review routine iterates over these repos and generates a consolidated report.

## Troubleshooting

**"Bad credentials"** -- Your personal access token is expired or revoked. Generate a new one and update `.claude/settings.json`.

**MCP server not starting** -- Run `npx -y @modelcontextprotocol/server-github` manually to check for errors. Ensure Node.js 18+ is installed.

**Rate limiting** -- GitHub allows 5,000 requests/hour for authenticated users. If you hit limits, the MCP returns a rate-limit error. Wait or use a token with higher limits (GitHub App installation token).
