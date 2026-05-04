import type { TSESLint } from "@typescript-eslint/utils";

export function reactConfig(): TSESLint.FlatConfig.Config[] {
  return [
    {
      name: "@9wick/strict-type-rules/react",
      files: ["**/*.{jsx,tsx}"],
      rules: {
        "react/jsx-max-depth": ["warn", { max: 5 }],
        "react/jsx-max-props-per-line": [
          "warn",
          { maximum: 1, when: "multiline" },
        ],
        "react/prop-types": "off",
        "react/react-in-jsx-scope": "off",
      },
    },
  ];
}
