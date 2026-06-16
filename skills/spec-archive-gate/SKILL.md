---
name: spec-archive-gate
description: Use when an OpenSpec change or GSD phase is claimed complete, ready to archive, ready to ship, ready to commit, or ready for pull request
---

# Spec Archive Gate

## Principle

Archive only after evidence exists. A completed checklist without verification
is not enough.

## Required Gates

- OpenSpec shape is valid
- all OpenSpec tasks are complete or explicitly deferred
- every acceptance scenario has test or manual verification evidence
- non-goals are not violated
- design constraints are satisfied
- GSD phase verification is recorded when GSD is in use
- Superpowers verification-before-completion has run for code changes
- skipped checks are named with reasons

Run `node cli/bridge.mjs archive-readiness <change-id-or-path>` when available.
This catches only mechanical blockers; still run spec compliance review.

## Output

Report:

- archive decision
- shipped scope
- verification commands and results
- known risks
- deferred work
- exact blockers, if any

## Stop Rule

If any required gate fails, do not archive, commit, ship, or open a ready PR.

