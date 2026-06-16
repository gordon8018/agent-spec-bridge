import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  readme: "README.md",
  usage: "docs/usage.md",
  zhReadme: "docs/zh-CN/README.md",
  zhUsage: "docs/zh-CN/usage.md",
  codex: "adapters/codex/AGENTS.md.snippet",
  claude: "adapters/claude/CLAUDE.md.snippet",
  planSkill: "skills/openspec-to-tdd-plan/SKILL.md",
  archiveSkill: "skills/spec-archive-gate/SKILL.md"
};

async function text(file) {
  return readFile(file, "utf8");
}

test("docs describe both no-GSD and GSD modes", async () => {
  const required = [
    files.readme,
    files.usage,
    files.zhReadme,
    files.zhUsage
  ];

  for (const file of required) {
    const content = await text(file);
    assert.match(content, /GSD Core is optional|GSD Core 是可选的/, file);
    assert.match(content, /OpenSpec \+ Superpowers|OpenSpec \+ Superpowers/, file);
    assert.match(content, /OpenSpec \+ Superpowers \+ GSD|OpenSpec \+ Superpowers \+ GSD/, file);
  }
});

test("adapters do not force GSD workflows when GSD is unused", async () => {
  for (const file of [files.codex, files.claude]) {
    const content = await text(file);
    assert.match(content, /If GSD Core is not used in this project/, file);
    assert.match(content, /do not invoke GSD workflows/, file);
  }
});

test("planning and archive skills treat no-GSD mode as first class", async () => {
  const planSkill = await text(files.planSkill);
  const archiveSkill = await text(files.archiveSkill);

  assert.match(planSkill, /No-GSD mode/, files.planSkill);
  assert.match(planSkill, /docs\/superpowers\/plans\/<change-id>\.md/, files.planSkill);
  assert.doesNotMatch(planSkill, /pending migration into GSD state/, files.planSkill);

  assert.match(archiveSkill, /skip GSD verification/, files.archiveSkill);
  assert.match(archiveSkill, /not a missing gate/, files.archiveSkill);
});

