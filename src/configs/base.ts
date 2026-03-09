import type { ESLint, Linter } from "eslint";

export function baseConfig(plugin: ESLint.Plugin): Linter.Config[] {
  return [
    {
      name: "@9wick/strict-type-rules/base",
      plugins: {
        "@9wick/strict-type-rules": plugin,
      },
      rules: {
        // === Strict Syntax Rules (individual, independently toggleable) ===
        "@9wick/strict-type-rules/no-throw": "error",
        "@9wick/strict-type-rules/no-try-catch": "error",
        "@9wick/strict-type-rules/no-promise-result": "error",
        "@9wick/strict-type-rules/no-nested-and-then": "error",
        "@9wick/strict-type-rules/no-as-assertion": "error",
        "@9wick/strict-type-rules/no-angle-assertion": "error",
        "@9wick/strict-type-rules/no-in-operator": "error",
        "@9wick/strict-type-rules/no-object-has-own": "error",
        "@9wick/strict-type-rules/no-promise-reject": "error",
        "@9wick/strict-type-rules/no-process-access": "error",
        "@9wick/strict-type-rules/no-unsafe-unwrap": "error",

        // === Other Custom Rules ===
        "@9wick/strict-type-rules/no-empty-select-value": "error",
        "@9wick/strict-type-rules/no-vitest-resolve-alias": "error",
        "@9wick/strict-type-rules/no-cross-directory-lib-import": "error",

        // === Complexity ===
        complexity: ["error", { max: 7 }],
        "sonarjs/cognitive-complexity": "error",
        "no-console": "error",
        "max-lines": [
          "error",
          { max: 500, skipBlankLines: true, skipComments: true },
        ],
        "max-lines-per-function": [
          "error",
          { max: 50, skipBlankLines: true, skipComments: true, IIFEs: true },
        ],

        // === TypeScript ===
        "@typescript-eslint/no-unnecessary-condition": "error",
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/explicit-function-return-type": "off",

        // === Import ===
        "import-x/no-cycle": "error",
        "import-x/order": [
          "error",
          {
            groups: [
              "builtin",
              "external",
              "internal",
              "parent",
              "sibling",
              "index",
            ],
            "newlines-between": "always",
          },
        ],
        "import-x/no-namespace": [
          "error",
          { ignore: ["react", "@radix-ui/*", "valibot"] },
        ],

        // === ESLint Comments ===
        "@eslint-community/eslint-comments/no-use": [
          "error",
          { allow: [] as string[] },
        ],
      },
    },
    {
      name: "@9wick/strict-type-rules/base/di",
      files: ["**/*.*.{ts,tsx}"],
      ignores: ["**/*.lib.{ts,tsx}"],
      plugins: {
        "@9wick/strict-type-rules": plugin,
      },
      rules: {
        "@9wick/strict-type-rules/no-exported-callable": "error",
        "@9wick/strict-type-rules/require-injectable-class": "error",
      },
    },
    {
      name: "@9wick/strict-type-rules/base/logger",
      files: ["**/*[lL]ogger*.{ts,tsx,js,jsx}"],
      rules: {
        "no-console": "off",
      },
    },
  ];
}
