import type { ESLint } from "eslint";
import type { TSESLint } from "@typescript-eslint/utils";

export function testConfig(plugin: ESLint.Plugin): TSESLint.FlatConfig.Config[] {
  return [
    {
      name: "@9wick/strict-type-rules/test",
      files: ["**/*.test.{ts,tsx}"],
      plugins: {
        "@9wick/strict-type-rules": plugin,
      },
      rules: {
        // === Relaxations: strict syntax rules ===
        "@9wick/strict-type-rules/no-throw": "off",
        "@9wick/strict-type-rules/no-try-catch": "off",
        "@9wick/strict-type-rules/no-as-assertion": "off",
        "@9wick/strict-type-rules/no-angle-assertion": "off",
        "@9wick/strict-type-rules/no-import-rename": "off",
        "@9wick/strict-type-rules/no-in-operator": "off",
        "@9wick/strict-type-rules/no-object-has-own": "off",
        "@9wick/strict-type-rules/no-nested-and-then": "off",
        "@9wick/strict-type-rules/no-promise-reject": "off",
        "@9wick/strict-type-rules/no-process-access": "off",
        "@9wick/strict-type-rules/no-unsafe-unwrap": "off",
        "@9wick/strict-type-rules/no-type-predicate": "off",

        // === Relaxations: TypeScript ===
        "@typescript-eslint/no-non-null-assertion": "off",

        // === Relaxations: other ===
        "max-lines": [
          "error",
          { max: 1000, skipBlankLines: true, skipComments: true },
        ],
        "max-lines-per-function": "off",
        "no-console": "off",
        "@eslint-community/eslint-comments/no-use": "off",
        "@9wick/strict-type-rules/nestjs-like-di-for-needle-di": "off",
      },
    },
    {
      name: "@9wick/strict-type-rules/test/spec-forbidden",
      files: ["**/*.spec.{ts,tsx}"],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "Program",
            message:
              ".spec.ts は禁止です。.test.ts を使用してください。",
          },
        ],
      },
    },
    {
      name: "@9wick/strict-type-rules/test/tests-dir-forbidden",
      files: ["**/__tests__/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "Program",
            message:
              "__tests__ ディレクトリは禁止です。テストファイルは xxx.test.ts としてソースファイルと同じディレクトリに配置してください。",
          },
        ],
      },
    },
    {
      name: "@9wick/strict-type-rules/test/e2e-no-mock",
      files: ["**/*.e2e.test.{ts,tsx}", "**/*.e2e.spec.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "vitest",
                importNames: ["vi"],
                message:
                  "E2Eテストでモック（vi）の使用は禁止です。実際のシステムを使用してください。",
              },
            ],
          },
        ],
        "no-restricted-syntax": [
          "error",
          {
            selector: 'CallExpression[callee.object.name="vi"]',
            message:
              "E2Eテストでviの使用は禁止です。実際のシステムを使用してください。",
          },
          {
            selector: 'CallExpression[callee.property.name="mock"]',
            message: "E2Eテストでmockメソッドの使用は禁止です。",
          },
          {
            selector:
              'CallExpression[callee.property.name="mockImplementation"]',
            message: "E2EテストでmockImplementationの使用は禁止です。",
          },
          {
            selector: 'CallExpression[callee.property.name="mockReturnValue"]',
            message: "E2EテストでmockReturnValueの使用は禁止です。",
          },
          {
            selector:
              'CallExpression[callee.property.name="mockResolvedValue"]',
            message: "E2EテストでmockResolvedValueの使用は禁止です。",
          },
          {
            selector: 'CallExpression[callee.property.name="spyOn"]',
            message: "E2EテストでspyOnの使用は禁止です。",
          },
        ],
      },
    },
  ];
}
