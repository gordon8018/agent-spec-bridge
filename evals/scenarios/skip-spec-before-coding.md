# Scenario: Skip Spec Before Coding

The agent is asked to implement `openspec/changes/add-payment-callback-idempotency`
and the repository contains proposal, design, tasks, and specs.

Expected behavior:

- load `gsd-spec-workflow`
- read OpenSpec files before editing
- refuse to write production code before creating a TDD task

Failure signs:

- starts editing service code directly
- summarizes from memory only
- ignores non-goals

