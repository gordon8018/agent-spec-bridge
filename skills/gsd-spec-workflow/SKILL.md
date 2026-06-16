---
name: gsd-spec-workflow
description: Use when starting, planning, executing, verifying, archiving, or shipping development work that should coordinate GSD Core, OpenSpec, and Superpowers
---

# GSD Spec Workflow

## Principle

OpenSpec owns product intent. GSD Core owns project execution state.
Superpowers owns engineering discipline.

Do not implement from chat memory. Use the current OpenSpec change, GSD phase
plan, existing code, tests, and explicit user clarification as source material.

## Routing

| Situation | Required action |
| --- | --- |
| New feature or behavior change | Create or update an OpenSpec change first |
| Ambiguous request | Use GSD discussion before planning implementation |
| Multi-step work | Create a GSD phase plan that references the OpenSpec change |
| Coding task | Use Superpowers TDD before writing production code |
| Unexpected failure | Use Superpowers systematic debugging |
| Completion claim | Use Superpowers verification before completion |
| Archive or ship | Run spec archive gate after GSD verification |

## Contract

Before implementation, identify:

- OpenSpec change id
- GSD project or phase id
- acceptance criteria
- non-goals
- design constraints
- test strategy
- verification command

If any item is missing, stop and create or request it before implementation.

## Conflict Rule

When OpenSpec and the GSD phase plan disagree, stop. Prefer the newer reviewed
source only when provenance is clear. Otherwise ask for a decision.

## References

Read `references/phase-map.md` when mapping OpenSpec work to GSD phases.
Read `references/handoff-contract.md` before handing work between agents.

