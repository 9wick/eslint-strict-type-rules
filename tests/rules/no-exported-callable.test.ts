import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";

import rule from "../../src/rules/no-exported-callable.js";

const ruleTester = new RuleTester();

describe("no-exported-callable", () => {
  it("should pass valid cases and fail invalid cases", () => {
    ruleTester.run("no-exported-callable", rule, {
      valid: [
        // Exporting a class is allowed
        {
          code: `export class MyService {}`,
        },
        // Exporting a constant is allowed
        {
          code: `export const MY_VALUE = 42;`,
        },
        // Exporting a type is allowed (even if it looks like a function type)
        {
          code: `export type MyFn = () => void;`,
        },
        // Type export of a function via specifier is allowed
        {
          code: `function helper() {} export type { helper };`,
        },
        // Exporting an interface is allowed
        {
          code: `export interface MyInterface { foo: string; }`,
        },
        // Default export of a class is allowed
        {
          code: `export default class MyService {}`,
        },
        // Exporting a variable that is not a function
        {
          code: `const value = 42; export { value };`,
        },
        // Export kind type at declaration level
        {
          code: `export type { SomeType } from './types';`,
        },
      ],
      invalid: [
        // Exported function declaration
        {
          code: `export function helper() {}`,
          errors: [{ messageId: "noCallable" }],
        },
        // Exported arrow function
        {
          code: `export const helper = () => {};`,
          errors: [{ messageId: "noCallable" }],
        },
        // Exported function expression
        {
          code: `export const helper = function() {};`,
          errors: [{ messageId: "noCallable" }],
        },
        // Default exported function declaration
        {
          code: `export default function helper() {}`,
          errors: [{ messageId: "noCallable" }],
        },
        // Re-exported function via specifier
        {
          code: `function helper() {} export { helper };`,
          errors: [{ messageId: "noCallable" }],
        },
        // Re-exported arrow function via specifier
        {
          code: `const helper = () => {}; export { helper };`,
          errors: [{ messageId: "noCallable" }],
        },
        // Default export of a named function via identifier
        {
          code: `function helper() {} export default helper;`,
          errors: [{ messageId: "noCallable" }],
        },
      ],
    });
  });
});
