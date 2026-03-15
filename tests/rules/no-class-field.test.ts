import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";

import rule from "../../src/rules/no-class-field.js";

const ruleTester = new RuleTester();

describe("no-class-field", () => {
  it("should pass valid cases and fail invalid cases", () => {
    ruleTester.run("no-class-field", rule, {
      valid: [
        // Constructor parameter properties (DI injection) are allowed
        {
          code: `class UserService {
            constructor(private readonly userRepo: UserRepository) {}
          }`,
        },
        // Methods are allowed
        {
          code: `class UserService {
            findAll() { return []; }
          }`,
        },
        // Constructor with multiple injections
        {
          code: `class UserService {
            constructor(
              private readonly userRepo: UserRepository,
              private readonly logger: Logger,
            ) {}
          }`,
        },
        // Empty class is allowed
        {
          code: `class EmptyService {}`,
        },
        // Getters and setters are allowed (they are MethodDefinition)
        {
          code: `class Svc { get name() { return 'svc'; } }`,
        },
      ],
      invalid: [
        // Private field with initializer
        {
          code: `class Svc { private cache = new Map(); }`,
          errors: [{ messageId: "noClassField" }],
        },
        // Public field
        {
          code: `class Svc { data: string[] = []; }`,
          errors: [{ messageId: "noClassField" }],
        },
        // Let-like mutable field
        {
          code: `class Svc { instance: any = null; }`,
          errors: [{ messageId: "noClassField" }],
        },
        // Static field
        {
          code: `class Svc { static count = 0; }`,
          errors: [{ messageId: "noClassField" }],
        },
        // Readonly field (should use constructor injection instead)
        {
          code: `class Svc { readonly name = 'test'; }`,
          errors: [{ messageId: "noClassField" }],
        },
        // Multiple fields
        {
          code: `class Svc { a = 1; b = 2; }`,
          errors: [
            { messageId: "noClassField" },
            { messageId: "noClassField" },
          ],
        },
        // Field alongside constructor injection
        {
          code: `class Svc {
            private cache = new Map();
            constructor(private readonly repo: Repo) {}
          }`,
          errors: [{ messageId: "noClassField" }],
        },
      ],
    });
  });
});
