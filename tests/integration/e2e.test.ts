import { describe, it, expect } from "vitest";
import { ESLint, Linter } from "eslint";
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";
import * as importX from "eslint-plugin-import-x";
import eslintComments from "@eslint-community/eslint-plugin-eslint-comments/configs";

import plugin from "../../src/index.js";

/**
 * E2Eテスト用: peer dependency pluginを登録した上でpluginのconfigを適用する。
 * 実際のconsumer環境を模倣する。
 */
function createESLint(configs: Linter.Config[]) {
  return new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      // TypeScript parserを有効化
      ...tseslint.configs.recommended as Linter.Config[],
      // sonarjs plugin登録
      {
        plugins: {
          sonarjs,
          "import-x": importX as unknown as ESLint.Plugin,
        },
      },
      // eslint-comments recommended
      ...(Array.isArray(eslintComments.recommended)
        ? eslintComments.recommended
        : [eslintComments.recommended]) as Linter.Config[],
      // テスト対象のconfig
      ...configs,
    ],
  });
}

/** peer dependency不要のconfigのみテストする場合 */
function createSimpleESLint(configs: Linter.Config[]) {
  return new ESLint({
    overrideConfigFile: true,
    overrideConfig: configs,
  });
}

describe("E2E: base config", () => {
  const eslint = createESLint(plugin.configs.base);

  it("should report error for throw statement", async () => {
    const results = await eslint.lintText(
      'const x = 1;\nthrow new Error("test");\n',
      { filePath: "src/test.ts" },
    );
    const messages = results[0].messages;
    expect(messages.some((m) => m.message.includes("throw は禁止"))).toBe(
      true,
    );
  });

  it("should report error for try-catch", async () => {
    const results = await eslint.lintText(
      "try { } catch (e) { }\n",
      { filePath: "src/test.ts" },
    );
    const messages = results[0].messages;
    expect(
      messages.some((m) => m.message.includes("try-catch は禁止")),
    ).toBe(true);
  });

  it("should report error for type assertion (as)", async () => {
    const results = await eslint.lintText(
      'const x = "hello" as string;\n',
      { filePath: "src/test.ts" },
    );
    const messages = results[0].messages;
    expect(
      messages.some((m) => m.message.includes("as による型アサーション")),
    ).toBe(true);
  });

  it("should allow as const", async () => {
    const results = await eslint.lintText(
      'const x = "hello" as const;\n',
      { filePath: "src/test.ts" },
    );
    const messages = results[0].messages;
    expect(
      messages.some((m) => m.message.includes("as による型アサーション")),
    ).toBe(false);
  });

  it("should report error for in operator", async () => {
    const results = await eslint.lintText(
      'const x = "a" in {};\n',
      { filePath: "src/test.ts" },
    );
    const messages = results[0].messages;
    expect(
      messages.some((m) => m.message.includes("in 演算子は型安全性")),
    ).toBe(true);
  });

  it("should report error for Promise.reject", async () => {
    const results = await eslint.lintText(
      'const x = Promise.reject("error");\n',
      { filePath: "src/test.ts" },
    );
    const messages = results[0].messages;
    expect(
      messages.some((m) => m.message.includes("Promise.reject は禁止")),
    ).toBe(true);
  });

  it("should report error for process.env access", async () => {
    const results = await eslint.lintText(
      "const x = process.env.NODE_ENV;\n",
      { filePath: "src/test.ts" },
    );
    const messages = results[0].messages;
    expect(
      messages.some((m) => m.message.includes("process への直接アクセスは禁止")),
    ).toBe(true);
  });

  it("should report error for process.exit", async () => {
    const results = await eslint.lintText(
      "process.exit(1);\n",
      { filePath: "src/test.ts" },
    );
    const messages = results[0].messages;
    expect(
      messages.some((m) => m.message.includes("process への直接アクセスは禁止")),
    ).toBe(true);
  });

  it("should report error for no-console", async () => {
    const results = await eslint.lintText(
      'console.log("hello");\n',
      { filePath: "src/test.ts" },
    );
    const messages = results[0].messages;
    expect(messages.some((m) => m.ruleId === "no-console")).toBe(true);
  });
});

describe("E2E: test config relaxation", () => {
  const eslint = createESLint([
    ...plugin.configs.base,
    ...plugin.configs.test,
  ]);

  it("should allow throw in .test.ts", async () => {
    const results = await eslint.lintText(
      'throw new Error("test");\n',
      { filePath: "src/foo.test.ts" },
    );
    const messages = results[0].messages;
    expect(messages.some((m) => m.message.includes("throw は禁止"))).toBe(
      false,
    );
  });

  it("should allow try-catch in .test.ts", async () => {
    const results = await eslint.lintText(
      "try { } catch (e) { }\n",
      { filePath: "src/foo.test.ts" },
    );
    const messages = results[0].messages;
    expect(
      messages.some((m) => m.message.includes("try-catch は禁止")),
    ).toBe(false);
  });

  it("should allow no-console in .test.ts", async () => {
    const results = await eslint.lintText(
      'console.log("debug");\n',
      { filePath: "src/foo.test.ts" },
    );
    const messages = results[0].messages;
    expect(messages.some((m) => m.ruleId === "no-console")).toBe(false);
  });
});

describe("E2E: barrel config", () => {
  const eslint = createSimpleESLint(plugin.configs.barrel);

  it("should report error for variable declaration in index.ts", async () => {
    const results = await eslint.lintText("const x = 1;\n", {
      filePath: "src/index.ts",
    });
    const messages = results[0].messages;
    expect(
      messages.some((m) => m.message.includes("index.ts に変数宣言は禁止")),
    ).toBe(true);
  });

  it("should allow re-exports in index.ts", async () => {
    const results = await eslint.lintText(
      'export { foo } from "./foo.js";\nexport * from "./bar.js";\n',
      { filePath: "src/index.ts" },
    );
    expect(results[0].errorCount).toBe(0);
  });

  it("should report error for export default in index.ts", async () => {
    const results = await eslint.lintText("export default 42;\n", {
      filePath: "src/index.ts",
    });
    const messages = results[0].messages;
    expect(
      messages.some((m) => m.message.includes("export default は禁止")),
    ).toBe(true);
  });
});

describe("E2E: test config constraints", () => {
  it("should report error for .spec.ts files", async () => {
    const eslint = createSimpleESLint(plugin.configs.test);
    const results = await eslint.lintText("const x = 1;\n", {
      filePath: "src/foo.spec.ts",
    });
    const messages = results[0].messages;
    expect(messages.some((m) => m.message.includes(".spec.ts は禁止"))).toBe(
      true,
    );
  });

  it("should report error for __tests__ directory", async () => {
    const eslint = createSimpleESLint(plugin.configs.test);
    const results = await eslint.lintText("const x = 1;\n", {
      filePath: "src/__tests__/foo.test.ts",
    });
    const messages = results[0].messages;
    expect(
      messages.some((m) =>
        m.message.includes("__tests__ ディレクトリは禁止"),
      ),
    ).toBe(true);
  });
});
