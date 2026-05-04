import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";

import rule from "../../src/rules/no-switch-statement.js";

const ruleTester = new RuleTester();

describe("no-switch-statement", () => {
  it("should pass valid cases and fail invalid cases", () => {
    ruleTester.run("no-switch-statement", rule, {
      valid: [
        {
          code: `import { match } from 'ts-pattern'; const result = match(value).with('a', () => 1).exhaustive();`,
        },
        {
          code: `if (x === 1) { foo(); } else if (x === 2) { bar(); }`,
        },
        {
          code: `const result = x === 1 ? 'a' : 'b';`,
        },
      ],
      invalid: [
        {
          code: `switch (value) { case 'a': break; case 'b': break; }`,
          errors: [{ messageId: "noSwitchStatement" }],
        },
        {
          code: `switch (value) { case 1: return 'one'; default: return 'other'; }`,
          errors: [{ messageId: "noSwitchStatement" }],
        },
        {
          code: `switch (true) { case x > 0: foo(); break; }`,
          errors: [{ messageId: "noSwitchStatement" }],
        },
      ],
    });
  });
});
