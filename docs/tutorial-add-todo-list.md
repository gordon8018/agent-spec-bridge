# Tutorial: Build `add-todo-list` With OpenSpec + Superpowers

This tutorial walks through one complete demo feature using `agent-spec-bridge`.
The default path uses OpenSpec + Superpowers without GSD. A short optional GSD
section is included at the end.

Demo feature:

```text
Add an in-memory todo list.
Users can add todos, list todos, and mark a todo complete.
Do not add login, permissions, persistence, networking, tags, search, or sort.
```

## 0. Install the Skills

Install the skill pack into your active agent host:

```text
skills/openspec-to-tdd-plan
skills/spec-compliance-check
skills/spec-archive-gate
skills/gsd-spec-workflow
```

Add the adapter snippet for your host:

```text
Codex:       adapters/codex/AGENTS.md.snippet
Claude Code: adapters/claude/CLAUDE.md.snippet
```

In this tutorial, `gsd-spec-workflow` is not used during the default path. Keep
it installed so the same project can opt into GSD later.

## 1. Create the OpenSpec Change

Ask OpenSpec to create the change:

```text
/opsx:propose add-todo-list
```

The project should now contain:

```text
openspec/changes/add-todo-list/
  proposal.md
  design.md
  tasks.md
  specs/
    todo-list/
      spec.md
```

Review or ask the agent to revise the files until they are concrete.

Expected `proposal.md` shape:

```markdown
# Proposal: add-todo-list

## Background

The project needs a minimal local todo list to validate the OpenSpec and
Superpowers workflow.

## Change

- Add a Todo model
- Add todos with a title
- List todos
- Mark a todo as complete
- Show completed state in the list

## Non-goals

- No login
- No permissions
- No database or persistence
- No networking API
- No tags, search, or sort
```

Expected `design.md` shape:

```markdown
# Design

- Must use in-memory storage for this demo.
- Todo must contain id, title, and completed.
- New todos must default completed to false.
- Marking complete must only change completed.
- Must not introduce database, user, permission, or network layers.
```

Expected `spec.md` scenarios:

```markdown
### Requirement: Todo list basics

The system must support adding, listing, and completing todos.

#### Scenario: Add todo then list it

- Given the todo list is empty
- When the user adds "write docs"
- Then the list contains "write docs"
- And completed is false

#### Scenario: Mark todo complete

- Given the list contains an incomplete "write docs" todo
- When the user marks it complete
- Then completed is true
```

Expected `tasks.md`:

```markdown
- [ ] Add Todo model
- [ ] Add TodoList service
- [ ] Support adding todos
- [ ] Support listing todos
- [ ] Support marking todos complete
- [ ] Run compliance and archive checks
```

## 2. Convert OpenSpec Into a Superpowers Plan

Do not start implementation yet. Ask the agent to use
`openspec-to-tdd-plan`:

```text
Use agent-spec-bridge for openspec/changes/add-todo-list.
Use OpenSpec + Superpowers mode. Do not use GSD.
Read proposal.md, design.md, tasks.md, and specs/**/spec.md.
Use openspec-to-tdd-plan to create docs/superpowers/plans/add-todo-list.md.
Do not write production code. Stop after the plan.
```

The generated plan should live at:

```text
docs/superpowers/plans/add-todo-list.md
```

A good plan looks like this:

```markdown
# Plan: add-todo-list

Mode: OpenSpec + Superpowers

OpenSpec source:
- openspec/changes/add-todo-list/proposal.md
- openspec/changes/add-todo-list/design.md
- openspec/changes/add-todo-list/tasks.md
- openspec/changes/add-todo-list/specs/todo-list/spec.md

Rules:
- Use Superpowers TDD for each code task.
- Run spec-compliance-check after each task.
- Run spec-archive-gate before /opsx:archive add-todo-list.
- Do not use GSD in this project.

## Task 1: Add Todo model

- [ ] Write a failing test showing Todo has id, title, completed
- [ ] Run the target test and confirm the expected failure
- [ ] Implement the minimal Todo model
- [ ] Run the target test and confirm pass
- [ ] Run spec-compliance-check

## Task 2: Add todo and list it

- [ ] Write a failing test for adding "write docs" and listing it
- [ ] Confirm completed defaults to false
- [ ] Implement minimal TodoList add/list behavior
- [ ] Run the target test and confirm pass
- [ ] Run spec-compliance-check

## Task 3: Mark todo complete

- [ ] Write a failing test for marking a todo complete
- [ ] Implement minimal complete behavior
- [ ] Confirm title is unchanged and completed is true
- [ ] Run spec-compliance-check
```

Check the plan before execution. It should not include database, login,
networking, tags, search, sort, or other non-goals.

## 3. Execute With Superpowers TDD

After approving the plan, ask the agent:

```text
Execute docs/superpowers/plans/add-todo-list.md with Superpowers TDD.
Execute only Task 1.
Write the failing test first, run it, confirm the expected failure, then write
minimal implementation. After the task passes, run spec-compliance-check.
```

Repeat the same pattern for each task:

```text
Continue add-todo-list. Execute only the next unchecked task from
docs/superpowers/plans/add-todo-list.md with Superpowers TDD.
Run spec-compliance-check before continuing.
```

The task loop is:

```text
write failing test
run target test and confirm red for the expected reason
write minimal production code
run target test and confirm green
refactor only if tests stay green
run spec-compliance-check
mark task complete
```

## 4. Run `spec-compliance-check`

After each task, the agent should use `spec-compliance-check` against the
OpenSpec change and current diff.

Prompt:

```text
Run spec-compliance-check for openspec/changes/add-todo-list.
Check the current diff against proposal.md, design.md, tasks.md, and specs.
Report pass/fail, missing tests, non-goal violations, and design violations.
```

Expected checks:

- Adding a todo is covered by a test
- Listing todos is covered by a test
- Completing a todo is covered by a test
- New todos default `completed` to false
- Completing a todo does not modify the title
- No database, login, permission, network, tag, search, or sort feature appears

If compliance fails, fix the defect before moving to the next task.

## 5. Run Mechanical CLI Checks

Use the CLI for deterministic OpenSpec checks:

```bash
node cli/bridge.mjs check-shape add-todo-list
node cli/bridge.mjs collect-context add-todo-list
node cli/bridge.mjs archive-readiness add-todo-list
```

`archive-readiness` should fail until all checklist items in `tasks.md` are
complete. It does not replace model judgment about implementation quality.

## 6. Run `spec-archive-gate`

Before archiving, committing, shipping, or opening a ready PR:

```text
Run spec-archive-gate for openspec/changes/add-todo-list.
This project is using OpenSpec + Superpowers mode without GSD.
Skip GSD verification because GSD is not in use.
Block archive if tests, OpenSpec validation, or spec compliance are incomplete.
```

The gate should report:

- OpenSpec shape is valid
- all tasks are complete or explicitly deferred
- acceptance scenarios have tests or manual verification
- non-goals are not violated
- design constraints are satisfied
- Superpowers verification-before-completion has run
- skipped checks are named with reasons

When the gate passes, archive the change:

```text
/opsx:archive add-todo-list
```

## 7. Optional: Add GSD Core

Use GSD only when the project needs phase state, handoffs, or staged
verification.

In GSD mode, start with `gsd-spec-workflow`:

```text
Use agent-spec-bridge with GSD for openspec/changes/add-todo-list.
Use gsd-spec-workflow to attach this OpenSpec change to the current GSD phase.
Then use openspec-to-tdd-plan to convert tasks into a test-first phase plan.
Stop before writing production code.
```

The rest of the execution is the same, except:

- the plan belongs to the current GSD phase instead of only
  `docs/superpowers/plans/add-todo-list.md`
- GSD verification must run before `spec-archive-gate`
- `spec-archive-gate` must report GSD verification evidence

## Summary

The complete no-GSD loop is:

```text
/opsx:propose add-todo-list
  -> openspec-to-tdd-plan
  -> docs/superpowers/plans/add-todo-list.md
  -> Superpowers TDD task loop
  -> spec-compliance-check after each task
  -> spec-archive-gate
  -> /opsx:archive add-todo-list
```

