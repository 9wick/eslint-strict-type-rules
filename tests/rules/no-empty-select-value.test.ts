import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";

import rule from "../../src/rules/no-empty-select-value.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

describe("no-empty-select-value", () => {
  it("should pass all rule tests", () => {
    ruleTester.run("no-empty-select-value", rule, {
      valid: [
        // 通常のvalue値を持つケース
        { code: '<SelectItem value="option1" />' },
        { code: '<RadioGroupItem value="yes" />' },
        { code: '<DropdownMenuItem value="action" />' },
        { code: '<ContextMenuItem value="copy" />' },

        // 式でのvalue値を持つケース
        { code: "<SelectItem value={someVariable} />" },
        { code: '<SelectItem value={"non-empty"} />' },
        { code: "<SelectItem value={`non-empty`} />" },

        // 対象外コンポーネント（空文字列でもOK）
        { code: '<Input value="" />' },
        { code: '<TextField value="" />' },
        { code: '<div value="" />' },

        // value以外の属性に空文字列
        { code: '<SelectItem label="" value="valid" />' },
      ],

      invalid: [
        // SelectItem
        {
          code: '<SelectItem value="" />',
          errors: [{ messageId: "emptyValue" as const }],
        },
        {
          code: '<SelectItem value={""} />',
          errors: [{ messageId: "emptyValue" as const }],
        },
        {
          code: "<SelectItem value={``} />",
          errors: [{ messageId: "emptyValue" as const }],
        },

        // RadioGroupItem
        {
          code: '<RadioGroupItem value="" />',
          errors: [{ messageId: "emptyValue" as const }],
        },
        {
          code: '<RadioGroupItem value={""} />',
          errors: [{ messageId: "emptyValue" as const }],
        },
        {
          code: "<RadioGroupItem value={``} />",
          errors: [{ messageId: "emptyValue" as const }],
        },

        // DropdownMenuItem
        {
          code: '<DropdownMenuItem value="" />',
          errors: [{ messageId: "emptyValue" as const }],
        },
        {
          code: '<DropdownMenuItem value={""} />',
          errors: [{ messageId: "emptyValue" as const }],
        },
        {
          code: "<DropdownMenuItem value={``} />",
          errors: [{ messageId: "emptyValue" as const }],
        },

        // ContextMenuItem
        {
          code: '<ContextMenuItem value="" />',
          errors: [{ messageId: "emptyValue" as const }],
        },
        {
          code: '<ContextMenuItem value={""} />',
          errors: [{ messageId: "emptyValue" as const }],
        },
        {
          code: "<ContextMenuItem value={``} />",
          errors: [{ messageId: "emptyValue" as const }],
        },
      ],
    });
  });
});
