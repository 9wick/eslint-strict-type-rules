import { describe, it, expect } from "vitest";

import {
  BASE_RESTRICTED_SYNTAX_RULES,
  buildRestrictedSyntaxRules,
} from "../../src/utils/restricted-syntax.js";

describe("BASE_RESTRICTED_SYNTAX_RULES", () => {
  it("should contain 11 rules", () => {
    expect(Object.keys(BASE_RESTRICTED_SYNTAX_RULES)).toHaveLength(11);
  });

  it("should have selector and message for each rule", () => {
    for (const rule of Object.values(BASE_RESTRICTED_SYNTAX_RULES)) {
      expect(rule).toHaveProperty("selector");
      expect(rule).toHaveProperty("message");
      expect(typeof rule.selector).toBe("string");
      expect(typeof rule.message).toBe("string");
    }
  });

  it("should include ThrowStatement rule", () => {
    expect(BASE_RESTRICTED_SYNTAX_RULES.throw.selector).toBe(
      "ThrowStatement",
    );
  });

  it("should include TryStatement rule", () => {
    expect(BASE_RESTRICTED_SYNTAX_RULES.tryCatch.selector).toBe(
      "TryStatement",
    );
  });
});

describe("buildRestrictedSyntaxRules", () => {
  it("should return all rules when no exclusions", () => {
    const result = buildRestrictedSyntaxRules();
    expect(result).toHaveLength(11);
  });

  it("should exclude specified keys", () => {
    const result = buildRestrictedSyntaxRules(["throw", "tryCatch"]);
    expect(result).toHaveLength(9);
    expect(result.some((r) => r.selector === "ThrowStatement")).toBe(false);
    expect(result.some((r) => r.selector === "TryStatement")).toBe(false);
  });

  it("should return objects with selector and message", () => {
    const result = buildRestrictedSyntaxRules();
    for (const rule of result) {
      expect(rule).toHaveProperty("selector");
      expect(rule).toHaveProperty("message");
    }
  });

  it("should exclude test-relaxed rules correctly", () => {
    const testExclusions = [
      "throw",
      "tryCatch",
      "asAssertion",
      "angleAssertion",
      "inOperator",
      "objectHasOwn",
      "nestedAndThen",
      "promiseReject",
    ] as const;
    const result = buildRestrictedSyntaxRules([...testExclusions]);
    // promiseResult + processAccess + typePredicate should remain
    expect(result).toHaveLength(3);
  });
});
