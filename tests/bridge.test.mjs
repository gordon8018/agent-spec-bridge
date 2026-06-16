import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const CLI = path.resolve("cli", "bridge.mjs");

async function createChange() {
  const root = await mkdtemp(path.join(tmpdir(), "agent-spec-bridge-"));
  const change = path.join(root, "openspec", "changes", "add-todo");
  await mkdir(path.join(change, "specs", "todo"), { recursive: true });
  await writeFile(path.join(change, "proposal.md"), "# Proposal\n\n## Non-goals\n\n- No database\n");
  await writeFile(path.join(change, "design.md"), "# Design\n\n- Must use memory storage\n");
  await writeFile(path.join(change, "tasks.md"), "- [x] Add todo model\n- [x] Add list behavior\n");
  await writeFile(path.join(change, "specs", "todo", "spec.md"), "### Requirement: Todo\n");
  return { root, change };
}

test("check-shape passes for a complete OpenSpec change", async () => {
  const { root } = await createChange();
  const { stdout } = await execFileAsync(process.execPath, [CLI, "check-shape", "add-todo"], {
    cwd: root
  });
  const result = JSON.parse(stdout);
  assert.equal(result.ok, true);
  assert.deepEqual(result.problems, []);
  assert.deepEqual(result.specFiles, [path.join("specs", "todo", "spec.md")]);
});

test("archive-readiness fails when tasks are open", async () => {
  const { root, change } = await createChange();
  await writeFile(path.join(change, "tasks.md"), "- [ ] Add todo model\n");

  await assert.rejects(
    execFileAsync(process.execPath, [CLI, "archive-readiness", "add-todo"], {
      cwd: root
    }),
    (error) => {
      const result = JSON.parse(error.stdout);
      assert.equal(result.ok, false);
      assert.match(result.blockers.join("\n"), /Open task: Add todo model/);
      return true;
    }
  );
});

