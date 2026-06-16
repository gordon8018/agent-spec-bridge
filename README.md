# agent-spec-bridge

Agent skills and lightweight tooling for connecting OpenSpec, GSD Core, and
Superpowers into one spec-driven development loop for Codex and Claude Code.

Status: `0.1.0-alpha.0`. The project contains an initial interoperable skill
pack and deterministic checks. Treat the skills as draft process automation
until the eval scenarios pass across both target agents.

## Goal

OpenSpec owns product intent. GSD Core owns project execution state.
Superpowers owns engineering discipline. This project provides the thin bridge
between them:

- convert OpenSpec changes into test-driven execution plans
- keep GSD phase state aligned with OpenSpec scope
- run spec compliance checks after implementation work
- block archive or ship when tests, specs, or verification are incomplete

## Skill Pack

```text
skills/
  gsd-spec-workflow/      project-level routing and source-of-truth contract
  openspec-to-tdd-plan/   OpenSpec task to TDD plan conversion
  spec-compliance-check/  review implementation against OpenSpec intent
  spec-archive-gate/      final archive and ship gate
```

The skills use only portable `SKILL.md` frontmatter fields: `name` and
`description`. Host-specific setup lives under `adapters/`.

## CLI

The CLI is intentionally small and deterministic. It does not replace agent
judgment; it prepares structured context and catches mechanical errors.

```bash
npm test
npm run validate
node cli/bridge.mjs check-shape <change-id-or-path>
node cli/bridge.mjs collect-context <change-id-or-path>
node cli/bridge.mjs archive-readiness <change-id-or-path>
```

`<change-id-or-path>` may be either an OpenSpec change id, resolved under
`openspec/changes/`, or a direct path to a change directory.

## Install

Until packaged installers are finalized, copy `skills/*` to the target host:

```text
Codex user skills:       ~/.codex/skills/ or ~/.agents/skills/
Codex project skills:    .codex/skills/
Claude Code user skills: ~/.claude/skills/
Claude project skills:   .claude/skills/
```

Then add the relevant project instruction snippet:

```text
adapters/codex/AGENTS.md.snippet
adapters/claude/CLAUDE.md.snippet
```

## Development Rules

- Do not duplicate OpenSpec, GSD Core, or Superpowers documentation.
- Put routing and contracts in skills; put deterministic checks in scripts.
- Use eval scenarios before claiming a skill is production-ready.
- Treat spec violations as defects, not suggestions.

## License

MIT.

