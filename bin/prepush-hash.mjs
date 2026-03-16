#!/usr/bin/env node

import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

function getHashFilePath() {
  const gitDir = execSync("git rev-parse --git-dir", {
    encoding: "utf-8",
  }).trim();
  return path.join(gitDir, "prepush-hash");
}

function ensureGitRepo() {
  try {
    execSync("git rev-parse --git-dir", { stdio: "ignore" });
  } catch {
    console.error("prepush-hash: not a git repository");
    process.exit(1);
  }
}

function computeHash() {
  const output = execSync("git ls-files -c -o --exclude-standard", {
    encoding: "utf-8",
  });
  const files = output
    .split("\n")
    .filter(Boolean)
    .filter((f) => !f.endsWith(".md"))
    .sort();

  const hash = createHash("sha256");
  for (const file of files) {
    try {
      const content = readFileSync(file);
      hash.update(file);
      hash.update(content);
    } catch {
      // File listed by git but unreadable (e.g. broken symlink) — skip
    }
  }
  return hash.digest("hex");
}

function isRunViaPackageManager() {
  // npm/pnpm/yarn set npm_lifecycle_event; bun >=1.3 does too
  if (process.env.npm_lifecycle_event) return true;
  // bun 1.2.x omits npm_lifecycle_event but sets npm_execpath
  if (process.env.npm_execpath) return true;
  return false;
}

function save() {
  if (!isRunViaPackageManager()) {
    console.error(
      "prepush-hash: save must be called via a package manager script (e.g., 'pnpm prepush')",
    );
    process.exit(1);
  }
  ensureGitRepo();
  const hashFile = getHashFilePath();
  const hex = computeHash();
  writeFileSync(hashFile, hex + "\n");
  console.log(`prepush-hash: saved ${hex.slice(0, 16)}`);
}

function check() {
  ensureGitRepo();
  const hashFile = getHashFilePath();
  if (!existsSync(hashFile)) {
    console.error(
      "prepush-hash: hash not found. Run 'pnpm prepush' or 'npm run prepush' or 'bun run prepush' first.",
    );
    process.exit(1);
  }
  const saved = readFileSync(hashFile, "utf-8").trim();
  const current = computeHash();
  if (saved !== current) {
    console.error(
      "prepush-hash: files changed since last prepush. Run 'pnpm prepush' or 'npm run prepush' or 'bun run prepush' to update.",
    );
    console.error(`  saved:   ${saved.slice(0, 16)}`);
    console.error(`  current: ${current.slice(0, 16)}`);
    process.exit(1);
  }
  console.log(`prepush-hash: verified ✓ (${current.slice(0, 16)})`);
}

function compute() {
  ensureGitRepo();
  process.stdout.write(computeHash() + "\n");
}

function verifyFooter(msgFile, source) {
  if (source === "merge" || source === "squash") {
    process.exit(0);
  }

  let msg = readFileSync(msgFile, "utf-8");

  // Remove existing Verified line (amend case)
  const verifiedRegex = /\n?Verified: prepush [^\n]*/g;
  const hadVerified = verifiedRegex.test(msg);
  if (hadVerified) {
    msg = msg.replace(verifiedRegex, "");
  }

  const hashFile = getHashFilePath();
  let footer;
  if (existsSync(hashFile)) {
    const saved = readFileSync(hashFile, "utf-8").trim();
    try {
      const current = computeHash();
      if (saved === current) {
        footer = `Verified: prepush ✓ (${saved.slice(0, 16)})`;
      } else {
        footer = "Verified: prepush ✕";
      }
    } catch {
      footer = "Verified: prepush ✕";
    }
  } else {
    footer = "Verified: prepush ✕";
  }

  // Ensure blank line before footer
  const trimmed = msg.trimEnd();
  writeFileSync(msgFile, trimmed + "\n\n" + footer + "\n");
}

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case "save":
    save();
    break;
  case "check":
    check();
    break;
  case "compute":
    compute();
    break;
  case "verify-footer":
    if (!args[0]) {
      console.error("Usage: prepush-hash verify-footer <msg-file> [source]");
      process.exit(1);
    }
    verifyFooter(args[0], args[1]);
    break;
  default:
    console.error("Usage: prepush-hash <save|check|compute|verify-footer>");
    process.exit(1);
}
