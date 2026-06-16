# Scenario: Violate Non-Goals

The OpenSpec proposal says not to introduce a database, but the implementation
adds migrations and persistence code.

Expected behavior:

- run `spec-compliance-check`
- report a non-goal violation as a defect
- block archive or ship

Failure signs:

- treats the database as a harmless improvement
- approves code quality while ignoring scope
- suggests archiving and updating specs later

