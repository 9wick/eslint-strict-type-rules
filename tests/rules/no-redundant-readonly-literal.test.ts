import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";

import rule from "../../src/rules/no-redundant-readonly-literal.js";

const ruleTester = new RuleTester();

describe("no-redundant-readonly-literal", () => {
  it("should report readonly on literal types and provide autofix", () => {
    ruleTester.run("no-redundant-readonly-literal", rule, {
      valid: [
        // readonly with non-literal types
        { code: `interface Foo { readonly name: string; }` },
        { code: `interface Foo { readonly count: number; }` },
        { code: `interface Foo { readonly flag: boolean; }` },
        // no readonly on literal types
        { code: `interface Foo { type: 'error'; }` },
        { code: `interface Foo { code: 42; }` },
        { code: `interface Foo { flag: true; }` },
        // readonly with union types
        { code: `interface Foo { readonly status: 'active' | 'inactive'; }` },
        { code: `interface Foo { readonly code: 1 | 2 | 3; }` },
        // readonly with complex types
        { code: `interface Foo { readonly data: Record<string, unknown>; }` },
        { code: `interface Foo { readonly items: string[]; }` },
        // type alias - no readonly on literal
        { code: `type Foo = { type: 'error'; }` },
        // class - readonly with non-literal
        { code: `class Foo { readonly name: string = ''; }` },
        // readonly with nullable union
        { code: `interface Foo { readonly value: string | null; }` },
      ],
      invalid: [
        // interface - string literal
        {
          code: `interface Foo { readonly type: 'error'; }`,
          output: `interface Foo { type: 'error'; }`,
          errors: [{ messageId: "noRedundantReadonlyLiteral" }],
        },
        // interface - number literal
        {
          code: `interface Foo { readonly code: 42; }`,
          output: `interface Foo { code: 42; }`,
          errors: [{ messageId: "noRedundantReadonlyLiteral" }],
        },
        // interface - boolean literal
        {
          code: `interface Foo { readonly flag: true; }`,
          output: `interface Foo { flag: true; }`,
          errors: [{ messageId: "noRedundantReadonlyLiteral" }],
        },
        // interface - false literal
        {
          code: `interface Foo { readonly disabled: false; }`,
          output: `interface Foo { disabled: false; }`,
          errors: [{ messageId: "noRedundantReadonlyLiteral" }],
        },
        // interface - null
        {
          code: `interface Foo { readonly nothing: null; }`,
          output: `interface Foo { nothing: null; }`,
          errors: [{ messageId: "noRedundantReadonlyLiteral" }],
        },
        // interface - undefined
        {
          code: `interface Foo { readonly missing: undefined; }`,
          output: `interface Foo { missing: undefined; }`,
          errors: [{ messageId: "noRedundantReadonlyLiteral" }],
        },
        // type alias - string literal
        {
          code: `type Foo = { readonly type: 'DuckDbMemoryError'; }`,
          output: `type Foo = { type: 'DuckDbMemoryError'; }`,
          errors: [{ messageId: "noRedundantReadonlyLiteral" }],
        },
        // class property - string literal
        {
          code: `class Foo { readonly type: 'error' = 'error'; }`,
          output: `class Foo { type: 'error' = 'error'; }`,
          errors: [{ messageId: "noRedundantReadonlyLiteral" }],
        },
        // multiple properties - only literal ones flagged
        {
          code: `interface Foo { readonly type: 'error'; readonly name: string; }`,
          output: `interface Foo { type: 'error'; readonly name: string; }`,
          errors: [{ messageId: "noRedundantReadonlyLiteral" }],
        },
        // negative number literal
        {
          code: `interface Foo { readonly code: -1; }`,
          output: `interface Foo { code: -1; }`,
          errors: [{ messageId: "noRedundantReadonlyLiteral" }],
        },
      ],
    });
  });
});
