import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(__dirname, "../../bin/prepush-hash.mjs");

const baseEnv = { ...process.env, NODE_NO_WARNINGS: "1", npm_lifecycle_event: "prepush" };

/** Run the CLI with the given command in the given cwd. */
function run(command: string, cwd: string, env: Record<string, string | undefined> = {}): string {
  return execSync(`node ${CLI} ${command}`, {
    cwd,
    encoding: "utf-8",
    env: { ...baseEnv, ...env },
  });
}

/** Run the CLI expecting a non-zero exit. Returns stderr + stdout merged. */
function runFail(command: string, cwd: string, env: Record<string, string | undefined> = {}): string {
  try {
    execSync(`node ${CLI} ${command}`, {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...baseEnv, ...env },
    });
    throw new Error("Expected command to fail but it succeeded");
  } catch (e: unknown) {
    const err = e as { status: number; stderr: string; stdout: string };
    expect(err.status).toBe(1);
    return (err.stderr ?? "") + (err.stdout ?? "");
  }
}

/** Create a temp directory and initialize a git repo inside it. */
function createTmpGitRepo(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "prepush-hash-test-"));
  execSync("git init", { cwd: dir, stdio: "ignore" });
  execSync('git config user.email "test@test.com"', { cwd: dir, stdio: "ignore" });
  execSync('git config user.name "Test"', { cwd: dir, stdio: "ignore" });
  return dir;
}

describe("prepush-hash CLI", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpGitRepo();
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // ─── compute ─────────────────────────────────────────────────────────

  describe("compute", () => {
    it("returns consistent hash for same files", () => {
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 1;\n");
      execSync("git add a.ts", { cwd: tmpDir, stdio: "ignore" });

      const hash1 = run("compute", tmpDir).trim();
      const hash2 = run("compute", tmpDir).trim();

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[0-9a-f]{64}$/);
    });

    it("excludes .md files from hash", () => {
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 1;\n");
      execSync("git add a.ts", { cwd: tmpDir, stdio: "ignore" });

      const hashBefore = run("compute", tmpDir).trim();

      writeFileSync(path.join(tmpDir, "README.md"), "# Hello\n");
      execSync("git add README.md", { cwd: tmpDir, stdio: "ignore" });

      const hashAfter = run("compute", tmpDir).trim();
      expect(hashBefore).toBe(hashAfter);
    });

    it("changes hash when file content changes", () => {
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 1;\n");
      execSync("git add a.ts", { cwd: tmpDir, stdio: "ignore" });

      const hash1 = run("compute", tmpDir).trim();

      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 2;\n");

      const hash2 = run("compute", tmpDir).trim();
      expect(hash1).not.toBe(hash2);
    });

    it("changes hash when file is renamed", () => {
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 1;\n");
      execSync("git add a.ts", { cwd: tmpDir, stdio: "ignore" });

      const hash1 = run("compute", tmpDir).trim();

      renameSync(path.join(tmpDir, "a.ts"), path.join(tmpDir, "b.ts"));
      execSync("git add -A", { cwd: tmpDir, stdio: "ignore" });

      const hash2 = run("compute", tmpDir).trim();
      expect(hash1).not.toBe(hash2);
    });

    it("includes untracked files", () => {
      writeFileSync(path.join(tmpDir, "tracked.ts"), "const a = 1;\n");
      execSync("git add tracked.ts", { cwd: tmpDir, stdio: "ignore" });

      const hashWithoutUntracked = run("compute", tmpDir).trim();

      // Create a new file without git add
      writeFileSync(path.join(tmpDir, "untracked.ts"), "const b = 2;\n");

      const hashWithUntracked = run("compute", tmpDir).trim();
      expect(hashWithoutUntracked).not.toBe(hashWithUntracked);
    });
  });

  // ─── save ────────────────────────────────────────────────────────────

  describe("save", () => {
    it("creates hash file in .git/", () => {
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 1;\n");
      execSync("git add a.ts", { cwd: tmpDir, stdio: "ignore" });

      run("save", tmpDir);

      const hashFile = path.join(tmpDir, ".git", "prepush-hash");
      const content = readFileSync(hashFile, "utf-8");
      expect(content).toMatch(/^[0-9a-f]{64}\n$/);
    });

    it("file contains the computed hash", () => {
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 1;\n");
      execSync("git add a.ts", { cwd: tmpDir, stdio: "ignore" });

      run("save", tmpDir);

      const saved = readFileSync(path.join(tmpDir, ".git", "prepush-hash"), "utf-8").trim();
      const computed = run("compute", tmpDir).trim();
      expect(saved).toBe(computed);
    });

    it("rejects save when not called via package manager script", () => {
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 1;\n");
      execSync("git add a.ts", { cwd: tmpDir, stdio: "ignore" });

      const output = runFail("save", tmpDir, { npm_lifecycle_event: "" });
      expect(output).toContain("save must be called via");
    });
  });

  // ─── check ───────────────────────────────────────────────────────────

  describe("check", () => {
    it("succeeds (exit 0) when hash matches", () => {
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 1;\n");
      execSync("git add a.ts", { cwd: tmpDir, stdio: "ignore" });

      run("save", tmpDir);

      // Should not throw
      const output = run("check", tmpDir);
      expect(output).toContain("verified");
    });

    it("fails (exit 1) when no .prepush-hash exists", () => {
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 1;\n");
      execSync("git add a.ts", { cwd: tmpDir, stdio: "ignore" });

      const output = runFail("check", tmpDir);
      expect(output).toContain("hash not found");
    });

    it("fails (exit 1) when files changed since save", () => {
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 1;\n");
      execSync("git add a.ts", { cwd: tmpDir, stdio: "ignore" });

      run("save", tmpDir);

      // Modify the file after save
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 999;\n");

      const output = runFail("check", tmpDir);
      expect(output).toContain("files changed since last prepush");
    });
  });

  // ─── verify-footer ──────────────────────────────────────────────────

  describe("verify-footer", () => {
    it("appends verified checkmark when hash matches", () => {
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 1;\n");
      execSync("git add a.ts", { cwd: tmpDir, stdio: "ignore" });

      run("save", tmpDir);

      // Use .git/COMMIT_EDITMSG just like real git hooks do,
      // so the msg file is not picked up by git ls-files.
      const msgFile = path.join(tmpDir, ".git", "COMMIT_EDITMSG");
      writeFileSync(msgFile, "feat: add feature\n");

      run(`verify-footer ${msgFile}`, tmpDir);

      const result = readFileSync(msgFile, "utf-8");
      expect(result).toContain("Verified: prepush \u2713");
      expect(result).toMatch(/Verified: prepush \u2713 \([0-9a-f]{16}\)/);
      // Original message preserved
      expect(result).toContain("feat: add feature");
    });

    it("appends cross mark when no .prepush-hash", () => {
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 1;\n");
      execSync("git add a.ts", { cwd: tmpDir, stdio: "ignore" });

      const msgFile = path.join(tmpDir, ".git", "COMMIT_EDITMSG");
      writeFileSync(msgFile, "feat: add feature\n");

      run(`verify-footer ${msgFile}`, tmpDir);

      const result = readFileSync(msgFile, "utf-8");
      expect(result).toContain("Verified: prepush \u2715");
    });

    it("appends cross mark when hash does not match", () => {
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 1;\n");
      execSync("git add a.ts", { cwd: tmpDir, stdio: "ignore" });

      run("save", tmpDir);

      // Modify file after save to invalidate hash
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 999;\n");

      const msgFile = path.join(tmpDir, ".git", "COMMIT_EDITMSG");
      writeFileSync(msgFile, "feat: add feature\n");

      run(`verify-footer ${msgFile}`, tmpDir);

      const result = readFileSync(msgFile, "utf-8");
      expect(result).toContain("Verified: prepush \u2715");
      expect(result).not.toContain("\u2713");
    });

    it("replaces existing Verified line on amend (no duplicate)", () => {
      writeFileSync(path.join(tmpDir, "a.ts"), "const a = 1;\n");
      execSync("git add a.ts", { cwd: tmpDir, stdio: "ignore" });

      run("save", tmpDir);

      const msgFile = path.join(tmpDir, ".git", "COMMIT_EDITMSG");
      writeFileSync(
        msgFile,
        "feat: add feature\n\nVerified: prepush \u2713 (abcdef0123456789)\n",
      );

      run(`verify-footer ${msgFile}`, tmpDir);

      const result = readFileSync(msgFile, "utf-8");
      // Should have exactly one Verified line
      const matches = result.match(/Verified: prepush/g);
      expect(matches).toHaveLength(1);
      // Should be the new hash, not the old one
      expect(result).not.toContain("abcdef0123456789");
    });

    it("skips when source is merge", () => {
      const msgFile = path.join(tmpDir, ".git", "COMMIT_EDITMSG");
      writeFileSync(msgFile, "Merge branch 'main'\n");

      run(`verify-footer ${msgFile} merge`, tmpDir);

      const result = readFileSync(msgFile, "utf-8");
      expect(result).toBe("Merge branch 'main'\n");
      expect(result).not.toContain("Verified");
    });

    it("skips when source is squash", () => {
      const msgFile = path.join(tmpDir, ".git", "COMMIT_EDITMSG");
      writeFileSync(msgFile, "Squash commit\n");

      run(`verify-footer ${msgFile} squash`, tmpDir);

      const result = readFileSync(msgFile, "utf-8");
      expect(result).toBe("Squash commit\n");
      expect(result).not.toContain("Verified");
    });
  });

  // ─── error handling ─────────────────────────────────────────────────

  describe("error handling", () => {
    it("errors with exit 1 when not in a git repository", () => {
      // Create a plain temp dir (no git init)
      const nonGitDir = mkdtempSync(path.join(tmpdir(), "prepush-hash-nogit-"));
      try {
        const output = runFail("compute", nonGitDir);
        expect(output).toContain("not a git repository");
      } finally {
        rmSync(nonGitDir, { recursive: true, force: true });
      }
    });
  });
});
