---
name: prod-activation-plan
description: "Create a phased activation plan using the EvoNexus standard structure — single index file + folder-per-phase + file-per-item, each item detailed with owner, dependencies, decisions pending, suggested agent team. Use when the user asks for an activation plan, implementation plan, rollout plan, or any phased plan for business/engineering initiatives. Also triggered by Oracle's Step 6 (implementation plan delivery) instead of writing an ad-hoc plan."
---

# Activation Plan — Standard Structure

This skill creates a **phased activation plan** using the EvoNexus standard structure that has been battle-tested: a single index file at the top, folders per phase, one file per item with a rich template. Every file declares its owner agent, decisions pending, dependencies, and suggested implementation team. Oracle uses this skill instead of inventing a plan structure.

**Always respond in the user's language (default: pt-BR if the workspace is pt-BR).**

## When to use

- Oracle's Step 6 (implementation plan delivery) — the canonical trigger
- User asks for an "activation plan", "implementation plan", "rollout plan", "plano de ativação"
- Expanding an existing plan with new axes/pillars (extend, don't duplicate)
- Any multi-phase initiative that needs per-item isolation and discussion

## What this skill does NOT do

- It does NOT do business discovery — that's Oracle's Step 2
- It does NOT pick features out of thin air — you must already have the phases and items decided (ideally from Compass)
- It does NOT execute the plan — it only creates the structured artifacts
- It does NOT overwrite existing plans without explicit confirmation

## Inputs required

Before invoking this skill, you must have:

1. **Plan name** — short slug (ex: `oracle-implementation-plan-expanded`)
2. **Plan date** — `YYYY-MM-DD`
3. **Context** — 2-3 lines about the business and the strategy base (e.g., "Evolution API, 7 axes, Cycle 52 as strategy base")
4. **Phases** — 2-4 phases, each with: name, timeline window, one-line purpose
5. **Items per phase** — for each item:
   - ID (ex: `1.1`, `1.4a`, `2.5`)
   - Short name (kebab-case slug for filename)
   - Full title
   - Type: `[ATIVAR]` | `[CONSTRUIR NOVO]` | `[DECIDIR]` | `[EVOLUIR]`
   - Axis/pillar name
   - Brief description (what is it)
   - Concrete steps (3-6 bullets)
   - Agent/skill/routine involved
   - What the user needs to decide/provide
   - Expected impact
   - Dependencies
   - Risks (if any)
   - Suggested agent team for implementation

If you don't have all of this, **ask the user or delegate to Compass first to produce the structured plan**, then call this skill to materialize it.

## Standard structure

```
workspace/development/plans/
├── [C]{plan-name}-{YYYY-MM-DD}.md       ← INDEX (single entry point)
├── {phase-1-slug}/                       ← e.g., fase-1-quick-wins/
│   ├── [C]1.1-{item-slug}.md
│   ├── [C]1.2-{item-slug}.md
│   └── ...
├── {phase-2-slug}/
│   └── ...
└── {phase-3-slug}/
    └── ...
```

## Step 1 — Create the folder structure

```bash
cd workspace/development/plans/
mkdir -p {phase-1-slug} {phase-2-slug} {phase-3-slug}
```

**Phase slug convention:** `fase-{N}-{purpose-slug}`. Examples:
- `fase-1-quick-wins`
- `fase-2-conexoes`
- `fase-3-ciclo-completo`

Use the purpose of the phase, not just the number.

## Step 2 — Write the INDEX file

Write `[C]{plan-name}-{YYYY-MM-DD}.md` at the root of `workspace/development/plans/`. The index is **a pure navigation file** — no duplication of item content. Template:

```markdown
---
author: claude
agent: {invoking-agent}
type: work-plan-index
date: {YYYY-MM-DD}
plan-name: {plan-name}
status: draft
mode: index
---

# {Plan Title} — {Business/Scope}

**Tipo:** índice. Cada item tem arquivo próprio na pasta da respectiva fase. Este arquivo não duplica o detalhamento — aponta pros arquivos-filhos.

**Estratégia-base:** {link to strategy doc, if any}

---

## Contexto

{2-4 lines: what the plan is, which axes it covers, what it connects.}

## Objetivos

- {Objective 1}
- {Objective 2}
- {Objective 3}

## Guardrails

**Must Have**
- {Constraint 1}
- {Constraint 2}

**Must NOT Have**
- {Anti-constraint 1}
- {Anti-constraint 2}

---

## Visão geral das fases

```
{Phase 1 name} ({timeline})     →    {Phase 2 name} ({timeline})     →    {Phase 3 name} ({timeline})
{one-line purpose}                    {one-line purpose}                    {one-line purpose}
```

---

## Fase 1 — {Name} ({timeline})

Pasta: [`{phase-1-slug}/`]({phase-1-slug}/)

| # | Item | Tipo |
|---|---|---|
| 1.1 | [{Item title}]({phase-1-slug}/[C]1.1-{item-slug}.md) | [ATIVAR] |
| 1.2 | [{Item title}]({phase-1-slug}/[C]1.2-{item-slug}.md) | [ATIVAR] |
| ... | ... | ... |

---

## Fase 2 — {Name} ({timeline})

Pasta: [`{phase-2-slug}/`]({phase-2-slug}/)

| # | Item | Tipo |
|---|---|---|
| 2.1 | [{Item title}]({phase-2-slug}/[C]2.1-{item-slug}.md) | [ATIVAR] |
| ... | ... | ... |

---

## Fase 3 — {Name} ({timeline})

Pasta: [`{phase-3-slug}/`]({phase-3-slug}/)

| # | Item | Tipo |
|---|---|---|
| 3.1 | [{Item title}]({phase-3-slug}/[C]3.1-{item-slug}.md) | [ATIVAR] |
| ... | ... | ... |

---

## Decisões críticas pendentes

1. **{Decision 1}** (item X.Y) — {what needs to be decided}
2. **{Decision 2}** (item X.Y) — {what needs to be decided}
3. **{Decision 3}** (item X.Y) — {what needs to be decided}

---

## Histórico de mudanças

- **v1 ({date}):** versão inicial.
```

**Rules for the index:**
- Never put item bodies in the index — just titles and links
- Always include the "Decisões críticas pendentes" section — it's the fastest path for the user to spot blockers
- Always include the "Histórico de mudanças" section — future-you will thank present-you
- Link every item to its own file using relative paths

## Step 3 — Write one file per item

For each item across all phases, write `{phase-slug}/[C]{item-id}-{item-slug}.md` using this template:

```markdown
---
author: claude
agent: {invoking-agent}
type: work-plan-item
date: {YYYY-MM-DD}
phase: {1|2|3}
item-id: {1.1, 1.4a, 2.5, etc}
status: pending
---

# {Item ID}. {Full Title}

**Fase:** {phase name}
**Eixo:** {axis/pillar slug — ex: comunidade, cursos, youtube-lives, redes-sociais, github-open-source, discord-bot, forum-linear}
**Tipo:** {[ATIVAR] | [CONSTRUIR NOVO] | [DECIDIR] | [EVOLUIR]}
**Prazo sugerido:** {window inside the phase — ex: "sem 1" or "13-17/abr"}

## O que é

{2-4 lines describing the objective, no fluff.}

## O que fazer

- {Concrete step 1}
- {Concrete step 2}
- {Concrete step 3}
- {Concrete step 4}

## Agente / Skill / Rotina

{Which agents, skills, or routines from the workspace are involved. Example: "@pixel + skill social-content-calendar + new daily routine in scheduler at 18:15"}

## O que o usuário precisa decidir/fornecer

{List of human-input dependencies. If none, write "Nada além da aprovação pra começar."}

## Impacto esperado

{2-3 lines about the concrete gain when this is running.}

## Dependências

{List of items that must be ready first. Example: "1.4a (calibração)" or "nenhuma".}

## Riscos

{Short list, only if relevant. Example: "régua pode errar em repos novos com pouco contexto"}

## Agente sugerido pra implementação

**Time:** {agent chain — e.g., @compass → @apex → @bolt → @oath}

| Fase | Agente | Papel |
|---|---|---|
| 1. Spec | @compass | Plano 3-6 passos |
| 2. Arquitetura | @apex | ADR + design |
| 3. Build | @bolt | Implementação |
| 4. Verify | @oath | Verificação evidence-based |

**Por quê esse time:** {one-line justification specific to this item}

## Status

- [x] Pendente
- [ ] Em progresso
- [ ] Concluído
```

### Rules for item files

- **Every section is mandatory**, even if brief
- **"Agente sugerido pra implementação" MUST be present** — use the routing rules below
- If the team has only 1 agent, use the enxuto format:
  ```markdown
  ## Agente sugerido pra implementação

  **Agente:** @pixel

  **Por quê:** item [ATIVAR] direto — skill já existe, só precisa do agente-dono do domínio.
  ```
- **Status checklist** always starts with "Pendente" checked
- Never invent features or dependencies — use only what the caller provided

## Step 4 — Agent routing rules (for the "Agente sugerido" section)

Use this table to pick the right team per item type. These rules are the canonical EvoNexus routing for activation plans:

| Item type | Team | Notes |
|---|---|---|
| **[ATIVAR]** — already exists, just wire it up | **Domain owner agent** (@pixel, @pulse, @atlas, @mentor, @clawdia, @flux, @dex, @nex, @mako, @aria, @zara, @lex, @nova) | No planning layer — just execute. |
| **[DECIDIR]** — research, benchmark, calibration | **@oracle** (conduct) + **@scout** (data) or **@scroll** (web research) | Decision must stay interactive with the user. |
| **[CONSTRUIR NOVO]** — small/medium | **@compass** (plan) → domain-owner agent (execute) | Compass ensures 3-6 actionable steps. |
| **[CONSTRUIR NOVO]** — large/critical | **@oracle** (framing) → **@compass** (plan) → **@apex** (ADR) → **@bolt** (execute) → **@oath** (verify) | Serious items need consensus before code. |
| **[CONSTRUIR NOVO]** — with UI | Add **@canvas** after @apex | UI/UX needs dedicated designer. |
| **[CONSTRUIR NOVO]** — with security impact | Add **@vault** and **@grid** | Auth, secrets, auditability. |
| **[EVOLUIR]** — refine what's running | **@compass** direct + domain owner | Already has a baseline. |

**Decision pending items** always include **@oracle** somewhere in the chain — the user needs interactive framing before anyone executes.

## Step 5 — Report back

After creating all files, report to the user with:

```
Plano criado. Estrutura:

workspace/development/plans/
├── [C]{plan-name}-{date}.md       ← índice
├── {phase-1}/  ({N} itens)
├── {phase-2}/  ({N} itens)
└── {phase-3}/  ({N} itens)

Total: {X} itens distribuídos em {Y} fases.

Decisões pendentes ({count}):
- {item-id}: {one-line description}
- ...

Próximo passo sugerido: {item to start with, usually a [DECIDIR] that unblocks the rest}
```

## Expanding an existing plan

If a plan with the same `plan-name` already exists at that location:

1. **Never overwrite without asking.** Show the user what exists and what would change.
2. If the user confirms expansion, **add** phases/items rather than replacing. Update the index's "Histórico de mudanças" with a new version entry (`v2`, `v3`…) describing what was added/changed.
3. Preserve existing item files — only create new files for new items. If an existing item needs to be modified, edit it in place and note the change in the index history.

## Materializing a Compass plan

When Oracle delegates the plan creation to @compass-planner and receives a structured output, **do not write the plan yourself** — pass Compass's output to this skill, which materializes it in the standard structure. This is the canonical flow:

```
Oracle (interview) → Compass (plan) → prod-activation-plan (materialize)
```

Compass produces the content; this skill produces the structure.

## Example — minimal invocation

```
User (to Oracle): "me monta o plano pra ativar comunidade e redes sociais em 6 semanas"

Oracle:
1. Runs Steps 2-5 (business discovery, capability mapping, wow report)
2. Delegates to @compass-planner to produce the structured plan content
3. Invokes prod-activation-plan skill with Compass's output
4. Reports the created structure back to the user with 3 autonomy paths (Step 7)
```

The user always sees a single, consistent structure — regardless of which agent produced the plan.
