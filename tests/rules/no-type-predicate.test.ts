import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";

import rule from "../../src/rules/no-type-predicate.js";

const ruleTester = new RuleTester();

describe("no-type-predicate", () => {
  it("should pass valid cases and fail invalid cases", () => {
    ruleTester.run("no-type-predicate", rule, {
      valid: [
        // typeof による型チェック（type predicate ではない）
        {
          code: `function isString(x: unknown): boolean { return typeof x === 'string'; }`,
        },
        // instanceof による型チェック
        {
          code: `function isError(x: unknown): boolean { return x instanceof Error; }`,
        },
        // ライブラリの型ガード呼び出し（CallExpression なので検出されない）
        {
          code: `import { is } from 'valibot'; const result = is(schema, data);`,
        },
        // 通常の関数宣言
        {
          code: `function validate(x: unknown): boolean { return x !== null; }`,
        },
      ],
      invalid: [
        // 関数宣言の type predicate
        {
          code: `function isString(x: unknown): x is string { return typeof x === 'string'; }`,
          errors: [{ messageId: "noTypePredicate" }],
        },
        // アロー関数の type predicate
        {
          code: `const isNumber = (x: unknown): x is number => typeof x === 'number';`,
          errors: [{ messageId: "noTypePredicate" }],
        },
        // asserts type predicate
        {
          code: `function assertIsString(x: unknown): asserts x is string { if (typeof x !== 'string') throw new Error(); }`,
          errors: [{ messageId: "noTypePredicate" }],
        },
        // メソッドの type predicate
        {
          code: `class Guard { isValid(x: unknown): x is string { return typeof x === 'string'; } }`,
          errors: [{ messageId: "noTypePredicate" }],
        },
        // カスタム型への type predicate
        {
          code: `type Cat = { meow: () => void }; function isCat(x: unknown): x is Cat { return true; }`,
          errors: [{ messageId: "noTypePredicate" }],
        },
      ],
    });
  });
});
