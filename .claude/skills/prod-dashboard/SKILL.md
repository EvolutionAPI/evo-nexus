---
name: prod-dashboard
description: "Daily consolidation dashboard — reads outputs from all routines (morning, linear, github, community, strategy, meetings, metrics) and generates a unified HTML dashboard. Trigger when user says 'dashboard', 'generate dashboard', 'overview', 'consolidation', or 'general panel'."
---

# Consolidated Dashboard — 360 View

Consolidation routine that reads outputs from other routines and generates a unified HTML dashboard with an overview of all business areas.

**Always respond in English.**

**IMPORTANTE:** Esta rotina NÃO busca dados novos. Ela lê os outputs já gerados pelas outras routines do dia/semana e consolida tudo numa view única.

## Step 1 — Collect data das fontes (silenciosamente)

Ler todas as fontes disponíveis sem narrar cada passo. Se alguma fonte não existir (rotina não rodou ainda), usar "—" ou "sem dados" como fallback.

### 1a. Tarefas
Rodar `todoist list --filter "today | overdue"` para contar tarefas pendentes.

### 1b. Linear / Sprint
Read the latest report de Linear em `workspace/projects/linear-reviews/` (most recent file `[C] *-linear-review.html`). Extract:
- Progresso do sprint (% e contagem)
- Blockers
- Issues em review
- Issues concluídas

### 1c. GitHub
Read the latest report de GitHub em `workspace/projects/github-reviews/` (most recent file `[C] *-github-review.html`). Extract:
- PRs abertos
- Issues da community
- Stars da semana
- Último release

### 1d. Comunidade
Ler o último community pulse em `workspace/community/reports/daily/` ou weekly em `workspace/community/reports/weekly/`. Extract:
- WAM (Weekly Active Members)
- Sentimento geral
- Tickets de suporte
- Docs gaps

### 1e. Financeiro
Ler o último strategy digest em `workspace/strategy/digests/` (most recent file). Extract:
- MRR
- Assinaturas
- Runway
- Pipeline comercial

### 1f. Agenda
Usar /gog-calendar para listar eventos de hoje.

### 1g. Reuniões
Ler `workspace/meetings/summaries/` ou `workspace/meetings/summaries/` — últimas 5 reuniões. Extract:
- Data, título, participantes, action items

### 1h. Métricas de routines
Ler `ADWs/logs/metrics.json` para status de cada rotina automatizada:
- Nome, agente, última execução, duração média, taxa de sucesso

### 1i. Morning Briefing
Ler o briefing matinal de hoje em `workspace/daily-logs/[C] YYYY-MM-DD-morning.html` se existir, para complementar dados de agenda e tarefas prioritárias.

## Step 2 — Calcular health badges

Para cada área, definir o status (classe CSS):
- **saudavel** (verde): tudo ok, métricas dentro do esperado
- **misto** (amarelo): algum ponto de atenção
- **risco** (vermelho): problemas sérios precisam de ação

Critérios:
- **Produto:** blockers > 0 = misto; blockers > 3 = risco; progresso sprint < 50% com >60% do tempo = risco
- **Comunidade:** sentimento negativo = risco; docs gaps > 5 = misto
- **Financeiro:** MRR caindo = misto; runway < 6 meses = risco
- **Rotinas:** qualquer rotina com taxa < 80% = misto; taxa < 50% = risco

## Step 3 — Gerar dashboard HTML

Read the template at `.claude/templates/html/custom/dashboard-consolidation.html` e substituir TODOS os `{{PLACEHOLDER}}` com os dados coletados.

Para rows dinâmicas (marcadas com `<!-- TEMPLATE -->`), gerar o HTML correto:

### Agenda rows
```html
<div class="metric-row">
  <div class="mr-label">HH:MM</div>
  <div class="mr-value">Nome do evento</div>
</div>
```

### Tarefas prioritárias rows
```html
<div class="list-item">Tarefa descrição</div>
```

### Reuniões rows
```html
<tr>
  <td>DD/MM</td>
  <td>Nome da reunião</td>
  <td>Pessoa 1, Pessoa 2</td>
  <td>N action items</td>
</tr>
```

### Rotinas rows
```html
<tr>
  <td>Nome da Rotina</td>
  <td>@agente</td>
  <td>DD/MM HH:MM</td>
  <td>XXs</td>
  <td><span class="rotina-rate high/medium/low">XX%</span></td>
  <td><div class="rotina-status"><div class="rotina-dot ok/falha"></div></div></td>
</tr>
```

### Pontos de atenção
Consolidar em bullets os itens que requerem atenção imediata. Exemplos:
- Blockers no sprint
- PRs sem review há mais de 2 dias
- Sentimento negativo na community
- Rotinas falhando
- MRR em queda

Se não houver pontos de atenção, escrever "Nenhum ponto de atenção no momento."

## Step 4 — Save

Save o HTML preenchido em:
```
workspace/daily-logs/[C] YYYY-MM-DD-dashboard.html
```

## Step 5 — Confirm

Present a short summary:

```
## Dashboard gerado

**Arquivo:** workspace/daily-logs/[C] YYYY-MM-DD-dashboard.html
**Health:** Produto {status} | Comunidade {status} | Financeiro {status} | Rotinas {status}
**Alertas:** {N} pontos de atenção
```

### Notify via Telegram

Upon completion, send a short summary via Telegram to the user:
- Use the Telegram MCP: `reply(chat_id="YOUR_CHAT_ID", text="...")`
- Format: emoji + routine name + health status of each area (1-3 lines)
- If there were no updates, send anyway with "no updates"
