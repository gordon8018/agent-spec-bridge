# agent-spec-bridge

Agent skills and lightweight tooling for connecting OpenSpec and Superpowers,
with optional GSD Core phase coordination, into one spec-driven development
loop for Codex and Claude Code.

[中文文档](docs/zh-CN/README.md)

Status: `0.1.0-alpha.0`. The project contains an initial interoperable skill
pack and deterministic checks. Treat the skills as draft process automation
until the eval scenarios pass across both target agents.

GSD Core is optional.

## Goal

OpenSpec owns product intent. Superpowers owns engineering discipline. GSD Core
is optional; when used, it owns project execution state. This project provides
the thin bridge between them:

- convert OpenSpec changes into test-driven execution plans
- keep GSD phase state aligned with OpenSpec scope when GSD is in use
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

## Quick Start

1. Install OpenSpec and Superpowers in the host where your agent runs.
   Install GSD Core only when you want phase-based project execution.
2. Copy this repository's `skills/*` directories into your Codex or Claude Code
   skills directory.
3. Add the matching project instruction snippet:

   ```text
   adapters/codex/AGENTS.md.snippet
   adapters/claude/CLAUDE.md.snippet
   ```

4. In your project, create or select an OpenSpec change.
5. Ask the agent to convert that change into a Superpowers execution plan before
   writing production code. If the project uses GSD Core, ask it to attach the
   plan to the current GSD phase.

Example prompt:

```text
Use agent-spec-bridge for openspec/changes/add-payment-callback-idempotency.
Read the proposal, design, tasks, and specs first. Create a test-first execution
plan and stop for review before writing production code.
```

See [docs/usage.md](docs/usage.md) for the full workflow.

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

## Typical Workflows

OpenSpec + Superpowers:

```text
OpenSpec change
  -> openspec-to-tdd-plan
  -> Superpowers TDD execution
  -> spec-compliance-check after each task
  -> spec-archive-gate
  -> OpenSpec archive / PR / ship
```

OpenSpec + Superpowers + GSD:

```text
OpenSpec change
  -> gsd-spec-workflow
  -> openspec-to-tdd-plan
  -> Superpowers TDD execution
  -> spec-compliance-check after each task
  -> GSD verification
  -> spec-archive-gate
  -> OpenSpec archive / PR / ship
```

## Development Rules

- Do not duplicate OpenSpec, GSD Core, or Superpowers documentation.
- Put routing and contracts in skills; put deterministic checks in scripts.
- Use eval scenarios before claiming a skill is production-ready.
- Treat spec violations as defects, not suggestions.

## License

MIT.
