import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";

import rule from "../../src/rules/no-module-level-variable.js";

const ruleTester = new RuleTester();

describe("no-module-level-variable", () => {
  it("should pass valid cases and fail invalid cases", () => {
    ruleTester.run("no-module-level-variable", rule, {
      valid: [
        // Class declaration is allowed
        { code: `class MyService { private data = []; }` },
        // Import statements are allowed
        { code: `import { something } from 'module';` },
        // Type/interface declarations are allowed
        { code: `type MyType = { foo: string };` },
        { code: `interface MyInterface { foo: string; }` },
        // Enum declarations are allowed
        { code: `enum Status { Active, Inactive }` },
        // Export of class is allowed
        { code: `export class MyService {}` },
        // Export type is allowed
        { code: `export type MyType = string;` },
        // Variables inside functions are allowed
        { code: `function init() { const data = []; }` },
        // Variables inside class methods are allowed
        {
          code: `class Svc { run() { let instance = null; } }`,
        },
      ],
      invalid: [
        // let at module level
        {
          code: `let instance = null;`,
          errors: [{ messageId: "noModuleLevelVariable" }],
        },
        // const array at module level
        {
          code: `const data: string[] = [];`,
          errors: [{ messageId: "noModuleLevelVariable" }],
        },
        // const object at module level
        {
          code: `const cache = {};`,
          errors: [{ messageId: "noModuleLevelVariable" }],
        },
        // const primitive at module level
        {
          code: `const MAX_RETRY = 3;`,
          errors: [{ messageId: "noModuleLevelVariable" }],
        },
        // exported const variable
        {
          code: `export const config = { timeout: 5000 };`,
          errors: [{ messageId: "noModuleLevelVariable" }],
        },
        // multiple declarations
        {
          code: `let a = 1; let b = 2;`,
          errors: [
            { messageId: "noModuleLevelVariable" },
            { messageId: "noModuleLevelVariable" },
          ],
        },
      ],
    });
  });
});
