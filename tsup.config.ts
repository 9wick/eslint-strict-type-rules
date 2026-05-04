import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  splitting: false,
  external: [
    "eslint",
    "typescript-eslint",
    "@typescript-eslint/utils",
    "@eslint-community/eslint-plugin-eslint-comments",
    "eslint-plugin-import-x",
    "eslint-plugin-sonarjs",
    "eslint-plugin-react",
    "eslint-plugin-react-hooks",
    "eslint-plugin-react-refresh",
  ],
});
