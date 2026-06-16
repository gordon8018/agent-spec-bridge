import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const englishTutorial = "docs/tutorial-add-todo-list.md";
const chineseTutorial = "docs/zh-CN/tutorial-add-todo-list.md";

async function text(file) {
  return readFile(file, "utf8");
}

test("demo tutorials cover the complete OpenSpec and Superpowers workflow", async () => {
  for (const file of [englishTutorial, chineseTutorial]) {
    const content = await text(file);
    assert.match(content, /add-todo-list/, file);
    assert.match(content, /OpenSpec \+ Superpowers/, file);
    assert.match(content, /openspec-to-tdd-plan/, file);
    assert.match(content, /spec-compliance-check/, file);
    assert.match(content, /spec-archive-gate/, file);
    assert.match(content, /gsd-spec-workflow/, file);
    assert.match(content, /docs\/superpowers\/plans\/add-todo-list\.md/, file);
    assert.match(content, /\/opsx:propose add-todo-list/, file);
    assert.match(content, /\/opsx:archive add-todo-list/, file);
  }
});

test("main docs link to demo tutorials", async () => {
  const links = [
    ["README.md", "docs/tutorial-add-todo-list.md"],
    ["docs/usage.md", "tutorial-add-todo-list.md"],
    ["docs/zh-CN/README.md", "tutorial-add-todo-list.md"],
    ["docs/zh-CN/usage.md", "tutorial-add-todo-list.md"]
  ];

  for (const [file, link] of links) {
    const content = await text(file);
    assert.match(content, new RegExp(link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), file);
  }
});

