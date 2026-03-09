import { describe, it, expect } from "vitest";

import plugin from "../../src/index.js";

describe("plugin structure", () => {
  it("should export meta with name and version", () => {
    expect(plugin.meta).toBeDefined();
    expect(plugin.meta!.name).toBe(
      "@9wick/eslint-plugin-strict-type-rules",
    );
    expect(plugin.meta!.version).toBe("0.1.0");
  });

  it("should export 15 custom rules", () => {
    expect(Object.keys(plugin.rules!)).toHaveLength(15);
    // Strict syntax rules (11)
    expect(plugin.rules).toHaveProperty("no-throw");
    expect(plugin.rules).toHaveProperty("no-try-catch");
    expect(plugin.rules).toHaveProperty("no-promise-result");
    expect(plugin.rules).toHaveProperty("no-nested-and-then");
    expect(plugin.rules).toHaveProperty("no-as-assertion");
    expect(plugin.rules).toHaveProperty("no-angle-assertion");
    expect(plugin.rules).toHaveProperty("no-in-operator");
    expect(plugin.rules).toHaveProperty("no-object-has-own");
    expect(plugin.rules).toHaveProperty("no-promise-reject");
    expect(plugin.rules).toHaveProperty("no-process-access");
    expect(plugin.rules).toHaveProperty("no-unsafe-unwrap");
    // Other custom rules (4)
    expect(plugin.rules).toHaveProperty("no-empty-select-value");
    expect(plugin.rules).toHaveProperty("no-vitest-resolve-alias");
    expect(plugin.rules).toHaveProperty("no-exported-callable");
    expect(plugin.rules).toHaveProperty("require-injectable-class");
  });

  it("should export 5 configs", () => {
    expect(Object.keys(plugin.configs)).toHaveLength(5);
    expect(plugin.configs).toHaveProperty("base");
    expect(plugin.configs).toHaveProperty("recommended");
    expect(plugin.configs).toHaveProperty("react");
    expect(plugin.configs).toHaveProperty("test");
    expect(plugin.configs).toHaveProperty("barrel");
  });
});

describe("base config", () => {
  it("should be a non-empty array", () => {
    expect(Array.isArray(plugin.configs.base)).toBe(true);
    expect(plugin.configs.base.length).toBeGreaterThan(0);
  });

  it("should include plugin in plugins", () => {
    const config = plugin.configs.base[0];
    expect(config.plugins).toHaveProperty("@9wick/strict-type-rules");
  });

  it("should include all 15 custom rules as error", () => {
    const rules = plugin.configs.base[0].rules!;
    // Strict syntax rules (11)
    expect(rules["@9wick/strict-type-rules/no-throw"]).toBe("error");
    expect(rules["@9wick/strict-type-rules/no-try-catch"]).toBe("error");
    expect(rules["@9wick/strict-type-rules/no-promise-result"]).toBe("error");
    expect(rules["@9wick/strict-type-rules/no-nested-and-then"]).toBe("error");
    expect(rules["@9wick/strict-type-rules/no-as-assertion"]).toBe("error");
    expect(rules["@9wick/strict-type-rules/no-angle-assertion"]).toBe("error");
    expect(rules["@9wick/strict-type-rules/no-in-operator"]).toBe("error");
    expect(rules["@9wick/strict-type-rules/no-object-has-own"]).toBe("error");
    expect(rules["@9wick/strict-type-rules/no-promise-reject"]).toBe("error");
    expect(rules["@9wick/strict-type-rules/no-process-access"]).toBe("error");
    expect(rules["@9wick/strict-type-rules/no-unsafe-unwrap"]).toBe("error");
    // Other custom rules (4)
    expect(rules["@9wick/strict-type-rules/no-empty-select-value"]).toBe(
      "error",
    );
    expect(rules["@9wick/strict-type-rules/no-vitest-resolve-alias"]).toBe(
      "error",
    );
    expect(rules["@9wick/strict-type-rules/no-exported-callable"]).toBe(
      "error",
    );
    expect(rules["@9wick/strict-type-rules/require-injectable-class"]).toBe(
      "error",
    );
  });

  it("should not use no-restricted-syntax in base config", () => {
    const rules = plugin.configs.base[0].rules!;
    expect(rules["no-restricted-syntax"]).toBeUndefined();
  });

  it("should set complexity to max 7", () => {
    const rules = plugin.configs.base[0].rules!;
    expect(rules["complexity"]).toEqual(["error", { max: 7 }]);
  });

  it("should set max-lines to 500", () => {
    const rules = plugin.configs.base[0].rules!;
    expect(rules["max-lines"]).toEqual([
      "error",
      { max: 500, skipBlankLines: true, skipComments: true },
    ]);
  });

  it("should set max-lines-per-function to 50", () => {
    const rules = plugin.configs.base[0].rules!;
    expect(rules["max-lines-per-function"]).toEqual([
      "error",
      { max: 50, skipBlankLines: true, skipComments: true, IIFEs: true },
    ]);
  });
});

describe("recommended config", () => {
  it("should be equivalent to base config", () => {
    // They are separate instances but structurally identical
    expect(plugin.configs.recommended).toHaveLength(
      plugin.configs.base.length,
    );
    expect(plugin.configs.recommended[0].rules).toEqual(
      plugin.configs.base[0].rules,
    );
  });
});

describe("react config", () => {
  it("should target jsx/tsx files", () => {
    const config = plugin.configs.react[0];
    expect(config.files).toEqual(["**/*.{jsx,tsx}"]);
  });

  it("should set jsx-max-depth to 5", () => {
    const rules = plugin.configs.react[0].rules!;
    expect(rules["react/jsx-max-depth"]).toEqual(["warn", { max: 5 }]);
  });

  it("should disable prop-types", () => {
    const rules = plugin.configs.react[0].rules!;
    expect(rules["react/prop-types"]).toBe("off");
  });
});

describe("test config", () => {
  it("should contain 4 config entries", () => {
    expect(plugin.configs.test).toHaveLength(4);
  });

  it("should target .test.ts files in first entry", () => {
    expect(plugin.configs.test[0].files).toEqual(["**/*.test.{ts,tsx}"]);
  });

  it("should relax no-console for tests", () => {
    const rules = plugin.configs.test[0].rules!;
    expect(rules["no-console"]).toBe("off");
  });

  it("should relax max-lines to 1000 for tests", () => {
    const rules = plugin.configs.test[0].rules!;
    expect(rules["max-lines"]).toEqual([
      "error",
      { max: 1000, skipBlankLines: true, skipComments: true },
    ]);
  });

  it("should disable DI rules for tests", () => {
    const rules = plugin.configs.test[0].rules!;
    expect(rules["@9wick/strict-type-rules/no-exported-callable"]).toBe(
      "off",
    );
    expect(rules["@9wick/strict-type-rules/require-injectable-class"]).toBe(
      "off",
    );
  });

  it("should turn off strict syntax rules except no-promise-result", () => {
    const rules = plugin.configs.test[0].rules!;
    expect(rules["@9wick/strict-type-rules/no-throw"]).toBe("off");
    expect(rules["@9wick/strict-type-rules/no-try-catch"]).toBe("off");
    expect(rules["@9wick/strict-type-rules/no-as-assertion"]).toBe("off");
    expect(rules["@9wick/strict-type-rules/no-angle-assertion"]).toBe("off");
    expect(rules["@9wick/strict-type-rules/no-in-operator"]).toBe("off");
    expect(rules["@9wick/strict-type-rules/no-object-has-own"]).toBe("off");
    expect(rules["@9wick/strict-type-rules/no-nested-and-then"]).toBe("off");
    expect(rules["@9wick/strict-type-rules/no-promise-reject"]).toBe("off");
    expect(rules["@9wick/strict-type-rules/no-process-access"]).toBe("off");
    expect(rules["@9wick/strict-type-rules/no-unsafe-unwrap"]).toBe("off");
    // no-promise-result is NOT turned off (inherited from base)
    expect(
      rules["@9wick/strict-type-rules/no-promise-result"],
    ).toBeUndefined();
  });

  it("should forbid .spec.ts files", () => {
    const specConfig = plugin.configs.test[1];
    expect(specConfig.files).toEqual(["**/*.spec.{ts,tsx}"]);
  });

  it("should forbid __tests__ directory", () => {
    const testsConfig = plugin.configs.test[2];
    expect(testsConfig.files).toEqual(["**/__tests__/**/*.{ts,tsx}"]);
  });

  it("should forbid mocks in E2E tests", () => {
    const e2eConfig = plugin.configs.test[3];
    expect(e2eConfig.files).toEqual([
      "**/*.e2e.test.{ts,tsx}",
      "**/*.e2e.spec.{ts,tsx}",
    ]);
  });
});

describe("barrel config", () => {
  it("should target index.ts files", () => {
    expect(plugin.configs.barrel[0].files).toEqual(["**/index.ts"]);
  });

  it("should ignore index.test.ts", () => {
    expect(plugin.configs.barrel[0].ignores).toEqual(["**/index.test.ts"]);
  });

  it("should have 7 restricted syntax rules", () => {
    const rules = plugin.configs.barrel[0].rules!;
    const restricted = rules["no-restricted-syntax"] as unknown[];
    expect(restricted[0]).toBe("error");
    expect(restricted).toHaveLength(8); // "error" + 7 rules
  });
});
