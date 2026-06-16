# Usage Guide

This guide explains how to use `agent-spec-bridge` with Codex or Claude Code.
GSD Core is optional.

## What This Project Does

`agent-spec-bridge` does not replace OpenSpec, GSD Core, or Superpowers. It adds
a thin coordination layer:

- OpenSpec defines the requested behavior, non-goals, design constraints, and
  acceptance scenarios.
- GSD Core tracks discussion, planning, execution, verification, and shipping
  when you choose to use it.
- Superpowers enforces TDD, debugging discipline, reviews, and completion
  verification.
- `agent-spec-bridge` keeps the handoff between those tools explicit.

## Prerequisites

- Node.js `20.19.0` or newer
- OpenSpec initialized in the target project
- Superpowers installed in the active agent host
- GSD Core available when you want phase-based project execution
- Codex or Claude Code with custom skills enabled

## Install Skills

Copy the skill directories from this repository:

```text
skills/gsd-spec-workflow
skills/openspec-to-tdd-plan
skills/spec-compliance-check
skills/spec-archive-gate
```

Suggested destinations:

```text
Codex user skills:       ~/.codex/skills/ or ~/.agents/skills/
Codex project skills:    .codex/skills/
Claude Code user skills: ~/.claude/skills/
Claude project skills:   .claude/skills/
```

Then copy the matching instruction snippet into your project-level agent
instructions:

```text
Codex:       adapters/codex/AGENTS.md.snippet
Claude Code: adapters/claude/CLAUDE.md.snippet
```

## Choose a Mode

Use OpenSpec + Superpowers when the change is scoped enough that OpenSpec files
and a test-first plan are sufficient.

Use OpenSpec + Superpowers + GSD when the work needs explicit phase state,
multi-agent handoffs, longer research, or staged verification.

## Recommended Workflow: OpenSpec + Superpowers

### 1. Create an OpenSpec change

In the target project:

```text
/opsx:propose add-payment-callback-idempotency
```

Review the generated files:

```text
openspec/changes/add-payment-callback-idempotency/
  proposal.md
  design.md
  tasks.md
  specs/**/spec.md
```

Make sure the change includes:

- clear scope
- non-goals
- acceptance scenarios
- design "must" and "must not" constraints

### 2. Ask for a plan, not implementation

Use a prompt like this:

```text
Use agent-spec-bridge for openspec/changes/add-payment-callback-idempotency.
Read proposal.md, design.md, tasks.md, and specs/**/spec.md.
Convert the OpenSpec tasks into a Superpowers test-first execution plan under
docs/superpowers/plans/add-payment-callback-idempotency.md. Do not use GSD.
Do not write production code yet. Stop for review after the plan.
```

The agent should load:

- `openspec-to-tdd-plan`

The plan should identify:

- OpenSpec change id
- plan path under `docs/superpowers/plans/<change-id>.md`
- acceptance scenarios
- non-goals
- design constraints
- failing tests to write first
- target verification commands

### 3. Execute one task at a time

After reviewing the plan:

```text
Execute the approved plan one task at a time with Superpowers TDD.
After each task, run spec-compliance-check before continuing.
```

The expected loop is:

```text
write failing test
run target test and confirm expected failure
write minimal production code
run target test and confirm pass
refactor only while tests stay green
run spec-compliance-check
update task status
```

### 4. Run archive gate

Before archiving, committing, shipping, or opening a ready PR:

```text
Run spec-archive-gate for add-payment-callback-idempotency.
Block archive if tests, OpenSpec checks, or spec compliance are incomplete.
```

## Optional Workflow: OpenSpec + Superpowers + GSD

Use this mode only when the project already uses GSD Core or the user explicitly
asks for it.

```text
Use agent-spec-bridge with GSD for openspec/changes/add-payment-callback-idempotency.
Read the OpenSpec files and attach the test-first execution plan to the current
GSD phase. Stop for review before writing production code.
```

In this mode, the agent should also load `gsd-spec-workflow`, track GSD phase
state, and run GSD verification before `spec-archive-gate`.

## CLI Checks

The CLI only handles deterministic checks. It does not decide whether the code
actually satisfies the spec.

```bash
node cli/bridge.mjs check-shape add-payment-callback-idempotency
node cli/bridge.mjs collect-context add-payment-callback-idempotency
node cli/bridge.mjs archive-readiness add-payment-callback-idempotency
```

Use direct paths when running outside a project root:

```bash
node cli/bridge.mjs collect-context ./openspec/changes/add-payment-callback-idempotency
```

## Good Agent Prompts

For a step-by-step demo using a todo-list feature, see
[tutorial-add-todo-list.md](tutorial-add-todo-list.md).

Plan first:

```text
Use agent-spec-bridge to plan openspec/changes/add-todo-list. Read all OpenSpec
files and create a test-first execution plan. Do not edit code yet.
```

Continue execution:

```text
Continue add-todo-list. Execute only the next task with Superpowers TDD, then
run spec-compliance-check.
```

Archive:

```text
Run spec-archive-gate for add-todo-list. Report blockers instead of archiving
if any gate fails.
```

## Common Failure Modes

| Failure | What to do |
| --- | --- |
| Agent edits code before reading OpenSpec | Stop and restart from `openspec-to-tdd-plan`; use `gsd-spec-workflow` only if GSD is active |
| Agent treats `tasks.md` as implementation plan | Use `openspec-to-tdd-plan` to split into TDD tasks |
| Agent ignores non-goals | Run `spec-compliance-check` and treat violations as defects |
| Agent archives with failing tests | Run `spec-archive-gate` and block archive |
| Multiple active changes exist | Ask the user to choose one change id |

## Current Limitations

- Installers are not finalized.
- Eval scenarios are documented but not fully automated across Codex and Claude.
- The CLI catches mechanical problems only.
- Skills are alpha and should be tested in real projects before team-wide use.
