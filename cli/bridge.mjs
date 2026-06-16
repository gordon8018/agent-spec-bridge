#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const REQUIRED_FILES = ["proposal.md", "design.md", "tasks.md"];

function usage() {
  console.error(`Usage:
  agent-spec-bridge check-shape <change-id-or-path>
  agent-spec-bridge collect-context <change-id-or-path>
  agent-spec-bridge archive-readiness <change-id-or-path>`);
}

function resolveChangePath(input, cwd = process.cwd()) {
  if (!input) {
    throw new Error("Missing change id or path.");
  }

  const direct = path.resolve(cwd, input);
  if (existsSync(direct)) {
    return direct;
  }

  return path.resolve(cwd, "openspec", "changes", input);
}

async function readTextIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return readFile(filePath, "utf8");
}

async function walkSpecFiles(dir) {
  const specsRoot = path.join(dir, "specs");
  if (!existsSync(specsRoot)) {
    return [];
  }

  const out = [];
  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name === "spec.md") {
        out.push(fullPath);
      }
    }
  }

  await walk(specsRoot);
  return out.sort();
}

async function checkShape(input) {
  const changePath = resolveChangePath(input);
  const problems = [];

  if (!existsSync(changePath)) {
    problems.push(`Change directory does not exist: ${changePath}`);
    return { ok: false, changePath, problems, specFiles: [] };
  }

  const info = await stat(changePath);
  if (!info.isDirectory()) {
    problems.push(`Change path is not a directory: ${changePath}`);
  }

  for (const file of REQUIRED_FILES) {
    if (!existsSync(path.join(changePath, file))) {
      problems.push(`Missing required file: ${file}`);
    }
  }

  const specFiles = await walkSpecFiles(changePath);
  if (specFiles.length === 0) {
    problems.push("Missing changed spec files under specs/**/spec.md");
  }

  return {
    ok: problems.length === 0,
    changePath,
    problems,
    specFiles: specFiles.map((file) => path.relative(changePath, file))
  };
}

function parseMarkdownTasks(markdown) {
  const lines = markdown.split(/\r?\n/);
  const tasks = [];

  for (const line of lines) {
    const match = line.match(/^\s*[-*]\s+\[( |x|X)\]\s+(.+?)\s*$/);
    if (match) {
      tasks.push({
        done: match[1].toLowerCase() === "x",
        text: match[2]
      });
    }
  }

  return tasks;
}

async function collectContext(input) {
  const shape = await checkShape(input);
  const changePath = shape.changePath;
  const files = {};

  for (const file of REQUIRED_FILES) {
    files[file] = await readTextIfExists(path.join(changePath, file));
  }

  for (const specFile of shape.specFiles) {
    files[specFile] = await readTextIfExists(path.join(changePath, specFile));
  }

  const tasks = files["tasks.md"] ? parseMarkdownTasks(files["tasks.md"]) : [];

  return {
    ...shape,
    tasks: {
      total: tasks.length,
      done: tasks.filter((task) => task.done).length,
      open: tasks.filter((task) => !task.done).map((task) => task.text)
    },
    files
  };
}

async function archiveReadiness(input) {
  const context = await collectContext(input);
  const blockers = [...context.problems];

  if (context.tasks.total === 0) {
    blockers.push("tasks.md does not contain markdown checklist items.");
  }

  for (const task of context.tasks.open) {
    blockers.push(`Open task: ${task}`);
  }

  return {
    ok: blockers.length === 0,
    changePath: context.changePath,
    blockers,
    mechanicalChecks: {
      requiredFilesPresent: context.problems.length === 0,
      changedSpecsPresent: context.specFiles.length > 0,
      tasksComplete: context.tasks.total > 0 && context.tasks.open.length === 0
    },
    note: "This is a mechanical gate. Agents must still judge tests, non-goals, design constraints, and GSD verification evidence."
  };
}

async function main(argv) {
  const [command, input] = argv;

  if (!command || !input) {
    usage();
    process.exitCode = 2;
    return;
  }

  let result;
  if (command === "check-shape") {
    result = await checkShape(input);
  } else if (command === "collect-context") {
    result = await collectContext(input);
  } else if (command === "archive-readiness") {
    result = await archiveReadiness(input);
  } else {
    usage();
    process.exitCode = 2;
    return;
  }

  console.log(JSON.stringify(result, null, 2));
  if (result.ok === false) {
    process.exitCode = 1;
  }
}

main(process.argv.slice(2)).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

