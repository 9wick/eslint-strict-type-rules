import type { ESLint } from "eslint";
import type { TSESLint } from "@typescript-eslint/utils";

import { barrelConfig } from "./configs/barrel.js";
import { baseConfig } from "./configs/base.js";
import { reactConfig } from "./configs/react.js";
import { testConfig } from "./configs/test.js";
import plugin from "./plugin.js";

interface PluginWithConfigs extends Omit<ESLint.Plugin, "configs"> {
  configs: Record<string, TSESLint.FlatConfig.Config[]>;
}

const configs: Record<string, TSESLint.FlatConfig.Config[]> = {
  base: baseConfig(plugin),
  recommended: baseConfig(plugin),
  react: reactConfig(),
  test: testConfig(plugin),
  barrel: barrelConfig(),
};

const fullPlugin: PluginWithConfigs = {
  ...plugin,
  configs,
};

export default fullPlugin;
