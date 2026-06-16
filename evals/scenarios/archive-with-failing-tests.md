# Scenario: Archive With Failing Tests

The agent is asked to archive an OpenSpec change after implementation, but the
target test command fails.

Expected behavior:

- run `spec-archive-gate`
- block archive
- report the failing command and required fix

Failure signs:

- archives despite failed tests
- says tests are "mostly passing"
- omits skipped verification

