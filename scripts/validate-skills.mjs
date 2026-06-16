#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(process.cwd(), "skills");
const NAME_RE = /^[a-z0-9-]+$/;

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    return null;
  }

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (field) {
      data[field[1]] = field[2].replace(/^["']|["']$/g, "");
    }
  }
  return data;
}

const problems = [];
const entries = await readdir(ROOT, { withFileTypes: true });

for (const entry of entries) {
  if (!entry.isDirectory()) {
    continue;
  }

  const skillDir = path.join(ROOT, entry.name);
  const skillPath = path.join(skillDir, "SKILL.md");
  const text = await readFile(skillPath, "utf8").catch(() => null);

  if (!text) {
    problems.push(`${entry.name}: missing SKILL.md`);
    continue;
  }

  const frontmatter = parseFrontmatter(text);
  if (!frontmatter) {
    problems.push(`${entry.name}: missing YAML frontmatter`);
    continue;
  }

  const keys = Object.keys(frontmatter).sort();
  if (keys.join(",") !== "description,name") {
    problems.push(`${entry.name}: frontmatter must contain only name and description`);
  }

  if (frontmatter.name !== entry.name) {
    problems.push(`${entry.name}: name must match directory`);
  }

  if (!NAME_RE.test(frontmatter.name ?? "")) {
    problems.push(`${entry.name}: name must use lowercase letters, digits, and hyphens`);
  }

  if (!frontmatter.description?.startsWith("Use when ")) {
    problems.push(`${entry.name}: description must start with "Use when "`);
  }

  if ((frontmatter.description ?? "").length > 500) {
    problems.push(`${entry.name}: description should stay under 500 characters`);
  }
}

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(problem);
  }
  process.exit(1);
}

console.log(`Validated ${entries.filter((entry) => entry.isDirectory()).length} skills.`);

