import type { ESLint, Linter } from "eslint";

import { barrelConfig } from "./configs/barrel.js";
import { baseConfig } from "./configs/base.js";
import { reactConfig } from "./configs/react.js";
import { testConfig } from "./configs/test.js";
import plugin from "./plugin.js";

interface PluginWithConfigs extends ESLint.Plugin {
  configs: Record<string, Linter.Config[]>;
}

const configs: Record<string, Linter.Config[]> = {
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
