# Contributing

This project treats skill authoring like process TDD.

Before changing a skill:

1. Add or update an eval scenario that exposes the failure mode.
2. Keep `SKILL.md` concise and portable across Codex and Claude Code.
3. Put deterministic checks in scripts instead of prose.
4. Run `npm test` and `npm run validate`.

Do not add host-specific behavior to core skills. Put host-specific setup under
`adapters/`.

