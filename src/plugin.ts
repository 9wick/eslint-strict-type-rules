import type { ESLint } from "eslint";

import { rules } from "./rules/index.js";

const plugin: ESLint.Plugin = {
  meta: {
    name: "@9wick/eslint-plugin-strict-type-rules",
    version: "0.1.0",
  },
  rules,
};

export default plugin;
