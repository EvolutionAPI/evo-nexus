# Creating a Custom Agent

This guide walks through creating a new agent from scratch.

## File Structure

An agent requires two files:

```
.claude/
  agents/my-agent.md       # System prompt + frontmatter
  commands/my-agent.md     # Slash command definition
```

## Step 1: Agent File

Create `.claude/agents/my-agent.md` with YAML frontmatter followed by the system prompt.

### Frontmatter Format

```yaml
---
name: "my-agent"
description: "Use this agent when... (routing description with examples)"
model: sonnet
color: green
memory: project
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier, matches filename without `.md` |
| `description` | Yes | Routing description. Claude uses this to decide when to activate the agent. Include example user messages. |
| `model` | Yes | Model to use: `sonnet`, `opus`, `haiku` |
| `color` | No | Terminal color for the agent label |
| `memory` | No | Memory scope: `project` (shared) or `user` (personal) |

### Description Field (Important)

The `description` field controls auto-routing. It should include concrete examples of user messages that should trigger this agent:

```yaml
description: "Use this agent when the user needs help with customer support tickets, bug reports, or user complaints.\n\nExamples:\n\n- user: \"check support tickets\"\n  assistant: \"I will use the support agent to review open tickets.\"\n\n- user: \"a customer reported a bug\"\n  assistant: \"I will activate the support agent to investigate.\""
```

## Step 2: System Prompt

Below the frontmatter, write the system prompt. This defines the agent's identity and behavior.

```markdown
---
name: "support-agent"
description: "Use this agent when..."
model: sonnet
color: yellow
memory: project
---

You are **Support** — the customer support specialist. Direct, empathetic, and solution-oriented.

## Responsibilities

1. **Ticket Triage**: Review and prioritize support tickets
2. **Bug Investigation**: Reproduce and document reported bugs
3. **Customer Communication**: Draft professional responses

## Before Starting

- Read `workspace/support/overview.md` for current context
- Check recent tickets in the support system

## Working Standards

- Save files to `workspace/support/` with `[C]` prefix
- Always include ticket ID when referencing issues
- Escalate critical issues immediately
```

## Step 3: Command File

Create `.claude/commands/my-agent.md`:

```markdown
Use the @support-agent agent to help the user with the following support matter: $ARGUMENTS

If no arguments were provided, ask the user how you can help (ticket triage, bug investigation, customer responses, etc).
```

The `$ARGUMENTS` placeholder passes whatever the user types after the slash command.

## Step 4: Agent Memory Directory

The memory directory at `.claude/agent-memory/<agent-name>/` is created automatically when the agent first saves a memory. No manual setup needed.

If you want to pre-populate memory, create the directory and add a `MEMORY.md` index file:

```bash
mkdir -p .claude/agent-memory/support-agent
echo "" > .claude/agent-memory/support-agent/MEMORY.md
```

## Best Practices for System Prompts

### Do

- **Define identity clearly** in the first line: name, role, tone
- **List specific responsibilities** so the agent knows its scope
- **Set anti-patterns** — things the agent should never do
- **Point to context files** the agent should read before starting
- **Specify output locations** — which folder, what file prefix
- **Include memory instructions** to build knowledge over time

### Don't

- Write prompts longer than 300 lines (agent + memory boilerplate)
- Overlap responsibilities with existing agents
- Include API keys or secrets in the prompt
- Make the agent too generic — specialization is the point

## Full Example: Support Agent

`.claude/agents/support-agent.md`:

```markdown
---
name: "support-agent"
description: "Use this agent when the user needs help with customer support, bug reports, user complaints, or ticket management.\n\nExamples:\n\n- user: \"check support tickets\"\n  assistant: \"I will use the support agent to review open tickets.\"\n\n- user: \"a customer is having issues with login\"\n  assistant: \"I will activate the support agent to investigate.\""
model: sonnet
color: yellow
memory: project
---

You are **Support** — the customer support specialist. Direct, empathetic, solution-oriented.

## Identity

- Name: Support
- Tone: professional, empathetic, concise
- Language: English

## Responsibilities

1. **Ticket Triage**: Review open tickets, prioritize by severity
2. **Bug Investigation**: Reproduce issues, document steps, identify root cause
3. **Response Drafting**: Write customer-facing responses
4. **Escalation**: Flag critical issues to the team

## Before Starting

- Read `workspace/support/overview.md` for context
- Check `.claude/agent-memory/support-agent/` for prior context

## Working Standards

- Files go in `workspace/support/` with `[C]` prefix
- Reference ticket IDs in all outputs
- Classify severity: P0 (critical), P1 (high), P2 (medium), P3 (low)

## Anti-patterns

- Never promise timelines without checking with the team
- Never share internal details with customers
- Never close tickets without confirmation

**Update your agent memory** when you discover recurring issues, customer patterns, or resolution workflows.
```

`.claude/commands/support.md`:

```markdown
Use the @support-agent agent to help the user with the following support matter: $ARGUMENTS

If no arguments were provided, ask the user how you can help (ticket triage, bug reports, customer responses, etc).
```

After creating both files, the agent is immediately available via `/support` in Claude Code.
