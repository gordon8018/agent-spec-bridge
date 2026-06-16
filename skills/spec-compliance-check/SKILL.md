---
name: spec-compliance-check
description: Use when reviewing implemented code, completed tasks, test coverage, or diffs for an OpenSpec change before continuing, archiving, or shipping
---

# Spec Compliance Check

## Principle

Violating the spec is a defect, not a suggestion.

## Inputs

- current OpenSpec change directory
- changed files or diff
- test results, if already run
- GSD phase status, if present

Run `node cli/bridge.mjs collect-context <change-id-or-path>` when available.

## Check

1. Map each acceptance scenario to tests, implementation paths, and observed
   behavior.
2. Check every non-goal in `proposal.md` against the changed files.
3. Check every hard rule in `design.md`, especially "must", "must not",
   "required", "forbidden", and equivalent wording.
4. Check `tasks.md` state against actual implementation evidence.
5. Report missing tests and unverifiable scenarios.

## Output

Return:

- pass or fail
- acceptance coverage table
- non-goal violations
- design constraint violations
- missing or weak tests
- blockers before archive or ship

## Stop Rule

If implementation violates OpenSpec, stop downstream execution until the defect
is fixed or the spec is explicitly revised.

