import type { Linter } from "eslint";

export function barrelConfig(): Linter.Config[] {
  return [
    {
      name: "@9wick/strict-type-rules/barrel",
      files: ["**/index.ts"],
      ignores: ["**/index.test.ts"],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "VariableDeclaration",
            message:
              "index.ts に変数宣言は禁止です。re-export のみ記述してください。",
          },
          {
            selector: "FunctionDeclaration",
            message:
              "index.ts に関数宣言は禁止です。re-export のみ記述してください。",
          },
          {
            selector: "ClassDeclaration",
            message:
              "index.ts にクラス宣言は禁止です。re-export のみ記述してください。",
          },
          {
            selector: "TSInterfaceDeclaration",
            message:
              "index.ts に interface 宣言は禁止です。re-export のみ記述してください。",
          },
          {
            selector: "TSTypeAliasDeclaration",
            message:
              "index.ts に type 宣言は禁止です。re-export のみ記述してください。",
          },
          {
            selector: "ImportDeclaration",
            message:
              "index.ts に import 文は禁止です。export * from または export { ... } from を使用してください。",
          },
          {
            selector: "ExportDefaultDeclaration",
            message:
              "index.ts に export default は禁止です。名前付き re-export のみ記述してください。",
          },
        ],
      },
    },
  ];
}
