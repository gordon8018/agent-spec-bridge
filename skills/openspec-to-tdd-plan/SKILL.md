---
name: openspec-to-tdd-plan
description: Use when converting an OpenSpec change, proposal, design, specs, or tasks into implementation work before coding starts
---

# OpenSpec To TDD Plan

## Principle

OpenSpec tasks describe requirement work. Superpowers execution needs atomic
test-first tasks.

## Inputs

Read the current change directory:

- `proposal.md`
- `design.md`
- `tasks.md`
- `specs/**/spec.md`

Run `node cli/bridge.mjs collect-context <change-id-or-path>` when available to
catch missing files and open checklist items.

## Output

Create or update the GSD phase plan. If the project has no GSD structure yet,
write a temporary plan under `docs/superpowers/plans/<change-id>.md` and mark it
as pending migration into GSD state.

Each execution task must include:

- acceptance scenario covered
- failing test to write first
- expected red failure reason
- minimal implementation scope
- target verification command
- spec compliance check

## Split Rule

One task should cover one observable behavior. If a task name contains "and",
split it unless the behaviors are inseparable.

## Common Mistakes

- Treating `tasks.md` as an implementation plan
- Using `/opsx:apply` when the user only asked for a plan
- Omitting non-goals from execution context
- Writing production code before the failing test exists

## References

Read `references/task-splitting.md` when a change has broad or ambiguous tasks.

