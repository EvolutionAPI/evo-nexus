---
name: int-sync-meetings
description: "Sync meetings from Fathom — fetch new recordings, save JSON, generate transcripts and summaries, update indexes. Use when user says 'sync meetings', 'sync fathom', 'update meetings', 'sync calls', or similar."
---

# Sync Meetings

Complete pipeline to sync Fathom meetings and organize them in `workspace/meetings/`.

## Prerequisites

- `FATHOM_API_KEY` configurada (ver skill `fathom`)
- `jq` instalado
- Script `fathom.sh` disponível em `.claude/skills/fathom/fathom.sh`

## Full Workflow

Ao ser acionado, execute os passos abaixo **em ordem**:

### Step 1 — Fetch today's meetings

By default, fetch only **today's** meetings:

```bash
# Buscar meetings de hoje com summary e action items
{project-root}/.claude/skills/fathom/fathom.sh meetings --after "$(date +%Y-%m-%d)" --include-summary --include-actions
```

If the user specifies a different period (ex: "sync da semana", "sync de ontem"), ajustar o `--after` e adicionar `--before` conforme necessário:
- "sync de ontem": `--after "$(date -v-1d +%Y-%m-%d)" --before "$(date +%Y-%m-%d)"`
- "sync da semana": `--after "$(date -v-7d +%Y-%m-%d)"`
- "sync do mês": `--after "$(date -v-1m +%Y-%m-%d)"`

The API already returns `default_summary.markdown_formatted` e `action_items` completos — não precisa de chamadas extras.

### Step 2 — Filter unprocessed (CRITICAL — anti-duplication)

Read the file of already processed IDs:
```
{project-root}/workspace/meetings/.state/fathom-processed-recording-ids.txt
```

Compare with the returned `recording_id`. Process only IDs that **do not exist** in this file.

**IMPORTANT:** This step is mandatory and cannot be skipped. If the ID already exists in the file, the meeting **MUST NOT be reprocessed** under any circumstances — no summary, no tasks, no notification.

If there are no new meetings, send via Telegram "🎙️ Sync Meetings — No new meetings." and **stop immediately**. Do not continue to the following steps.

### Step 3 — Save raw JSON

For each new meeting, save the complete JSON to:
```
{project-root}/workspace/meetings/fathom/YYYY-MM-DD/YYYY-MM-DD__{recording_id}__{slug-do-titulo}.json
```

Onde:
- `YYYY-MM-DD` = data do `created_at`
- `slug-do-titulo` = título em lowercase, espaços→hifens, sem caracteres especiais

### Step 4 — Classify project

Determine the project based on the meeting title:

| Padrão no título | Projeto |
|---|---|
| Main API, API | `main-api` |
| CRM, Product | `crm-product` |
| Academy, Course | `academy` |
| Partner, Partnership | `partner` |
| Financeiro, NF, Fatura | `foundation` |
| Planning, Sprint, Grooming | inferir do contexto |
| Comercial, Parceria | `comercial` |
| Operação, Interno, Daily | `interno` |
| (default) | `outros` |

### Step 5 — Save summary

Use the `default_summary.markdown_formatted` that already came in the API response (Step 1).

Read the template at `.claude/templates/meeting-summary.md` e and fill with the meeting data.

Save em:
```
{project-root}/workspace/meetings/summaries/{projeto}/YYYY-MM-DD__{projeto}__meeting__{slug}__{recording_id}.summary.md
```

File format (based on the template):
```markdown
---
date: YYYY-MM-DD
title: {título original}
project: {projeto}
type: meeting
status: summary
tags: [fathom, meeting]
recording_id: {recording_id}
recording_url: {url ou share_url}
people: [{nomes dos calendar_invitees}]
---

{conteúdo do default_summary.markdown_formatted}

## Action Items

{lista de action_items formatada como checklist:}
- [ ] **{assignee.name}** — {description} ([{recording_timestamp}]({recording_playback_url}))
```

### Step 6 — Todoist triage (action items to tasks)

For each processed meeting, extract the `action_items` and create tasks in Todoist.

**BEFORE CREATING ANY TASK — mandatory anti-duplication check:**

1. Verificar no arquivo de estado local:
   ```
   {project-root}/workspace/meetings/.state/fathom-todoist-sync.json
   ```
   If the `recording_id` already has synced tasks, **DO NOT create new tasks**. Skip to Step 7.

2. Search Todoist for existing tasks com o meeting title ou recording_id no comentário:
   ```bash
   todoist list --filter "search: {meeting title}"
   ```
   If you find tasks that clearly correspond to the same action items, **DO NOT duplicate**. Registrar os IDs existentes no `fathom-todoist-sync.json` e pular.

**Triage rules (only if passed the check above):**

1. **Translate to PT-BR** — all action items must be translated to Brazilian Portuguese
2. **Default project: `Evolution`** — all tasks go to the Evolution project in Todoist, unless explicitly instructed otherwise
3. **Actionable context** — each task must have:
   - Clear and translated title (do not copy raw English from Fathom)
   - Comment with concrete context: origin (meeting + date), objective, next step, and recording link
4. **Group by meeting** — use sections/labels to identify which meeting it came from
5. **Filter by assignee** — create tasks only for action items assigned to the user (or without assignee). Items assigned to others are recorded only in the summary as reference

**Todoist task format:**

```
Título: {ação traduzida e clara em PT-BR}
Projeto: Evolution
Prioridade: p3 (default) — subir para p2 se for blocker ou deadline próximo
Comentário: 
  📋 Origem: {meeting title} ({data})
  🎯 Objetivo: {o que essa ação resolve}
  ➡️ Próximo passo: {ação concreta}
  🔗 Referência: {link do recording_playback_url}
```

**Execute directly, without intermediate report.** Do not list tasks before creating — create and confirm at the end.

### Step 7 — Mark as processed (IMMEDIATELY after each meeting)

**CRITICAL:** This step must be executed **immediately after processing EACH meeting individually**, NOT at the end of all. This prevents a crash mid-processing from causing reprocessing.

Add the `recording_id` to the state file:
```
{project-root}/workspace/meetings/.state/fathom-processed-recording-ids.txt
```

One ID per line. Append, do not overwrite.

Also update `fathom-todoist-sync.json` with the created task IDs.

**Order per meeting:** Passo 3 → 4 → 5 → 6 → **7 (gravar state)** → next meeting.

### Step 8 — Final report

When finished, present a short summary:

```
## Sync Fathom — Concluído

**Período:** {data mais antiga} → {data mais recente}
**Novos:** {N} reuniões processadas
**Já processados:** {M} ignorados
**Tarefas criadas:** {T} no Todoist (projeto Evolution)

### Reuniões sincronizadas:
| Data | Título | Projeto | Tarefas |
|------|--------|---------|---------|
| ... | ... | ... | {N tarefas} |
```

Without listing tasks one by one — just counts. If the user wants details, they ask.

### Step 9 — Notify via Telegram

Send the Step 8 summary via Telegram to the user using the `/int-telegram` skill:
- Chat ID: `YOUR_CHAT_ID`
- Usar `reply(chat_id="YOUR_CHAT_ID", text="...")` via MCP
- Formato curto: emoji + título + contagem de reuniões e tarefas

If there are no new meetings (stopped at Step 2), send: "🎙️ Sync Meetings — No new meetings."

## Notes

- **Do not reprocess** meetings that already exist in `fathom-processed-recording-ids.txt`
- If the transcript is not available in the API (empty return), save the summary anyway and mark the transcript as `status: pending`
- Create directories automatically if they do not exist (`fathom/YYYY-MM-DD/`, `raw/{projeto}/`, `summaries/{projeto}/`)
- Maintain the existing naming convention — check examples in `raw/` e `summaries/` antes de salvar
- **Todoist triage:** translate to PT-BR, Evolution project, actionable context, execute without intermediate report
- **User's tasks only** — other people's action items stay only in the summary
- Always use pt-BR in status messages
