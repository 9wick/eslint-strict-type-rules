import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";

import rule from "../../src/rules/require-injectable-class.js";

const ruleTester = new RuleTester();

describe("require-injectable-class", () => {
  it("should pass valid cases and fail invalid cases", () => {
    ruleTester.run("require-injectable-class", rule, {
      valid: [
        // Exported class with @injectable() decorator (call expression)
        {
          code: `@injectable() export class MyService {}`,
        },
        // Exported class with @injectable decorator (identifier)
        {
          code: `@injectable export class MyService {}`,
        },
        // Class declared then exported via specifier with @injectable()
        {
          code: `@injectable() class MyService {} export { MyService };`,
        },
        // Default export of injectable class
        {
          code: `@injectable() export default class MyService {}`,
        },
        // Multiple exports, one is injectable
        {
          code: `
            export const VALUE = 42;
            @injectable()
            export class MyService {}
          `,
        },
      ],
      invalid: [
        // No exports at all
        {
          code: `const x = 1;`,
          errors: [{ messageId: "missingInjectable" }],
        },
        // Exported class without decorator
        {
          code: `export class MyService {}`,
          errors: [{ messageId: "missingInjectable" }],
        },
        // Exported function only
        {
          code: `export function helper() {}`,
          errors: [{ messageId: "missingInjectable" }],
        },
        // Exported constant only
        {
          code: `export const VALUE = 42;`,
          errors: [{ messageId: "missingInjectable" }],
        },
        // Class with wrong decorator name
        {
          code: `@singleton() export class MyService {}`,
          errors: [{ messageId: "missingInjectable" }],
        },
        // Injectable class but not exported
        {
          code: `@injectable() class MyService {}`,
          errors: [{ messageId: "missingInjectable" }],
        },
        // Only type export of injectable class
        {
          code: `@injectable() class MyService {} export type { MyService };`,
          errors: [{ messageId: "missingInjectable" }],
        },
      ],
    });
  });
});
