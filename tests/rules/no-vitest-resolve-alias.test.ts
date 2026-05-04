import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it, afterAll } from "vitest";
import rule from "../../src/rules/no-vitest-resolve-alias.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run("no-vitest-resolve-alias", rule, {
  valid: [
    {
      name: "vitest.config.ts without resolve.alias",
      filename: "vitest.config.ts",
      code: `
        export default defineConfig({
          test: {
            globals: true,
          },
        });
      `,
    },
    {
      name: "vitest.config.ts with resolve but no alias",
      filename: "vitest.config.ts",
      code: `
        export default defineConfig({
          resolve: {
            extensions: ['.ts', '.js'],
          },
        });
      `,
    },
    {
      name: "non-vitest config file with resolve.alias (should be ignored)",
      filename: "vite.config.ts",
      code: `
        export default defineConfig({
          resolve: {
            alias: {
              '@': './src',
            },
          },
        });
      `,
    },
    {
      name: "alias property not inside resolve (should be ignored)",
      filename: "vitest.config.ts",
      code: `
        export default defineConfig({
          other: {
            alias: {
              '@': './src',
            },
          },
        });
      `,
    },
  ],
  invalid: [
    {
      name: "vitest.config.ts with resolve.alias object",
      filename: "vitest.config.ts",
      code: `
        export default defineConfig({
          resolve: {
            alias: {
              '@': './src',
            },
          },
        });
      `,
      errors: [{ messageId: "noResolveAlias" }],
    },
    {
      name: "vitest.config.mts with resolve.alias",
      filename: "vitest.config.mts",
      code: `
        export default defineConfig({
          resolve: {
            alias: {
              '@': './src',
            },
          },
        });
      `,
      errors: [{ messageId: "noResolveAlias" }],
    },
    {
      name: "vitest.config.js with resolve.alias",
      filename: "vitest.config.js",
      code: `
        export default defineConfig({
          resolve: {
            alias: {
              '@': './src',
            },
          },
        });
      `,
      errors: [{ messageId: "noResolveAlias" }],
    },
    {
      name: "vitest.config.mjs with resolve.alias",
      filename: "vitest.config.mjs",
      code: `
        export default defineConfig({
          resolve: {
            alias: {
              '@': './src',
            },
          },
        });
      `,
      errors: [{ messageId: "noResolveAlias" }],
    },
    {
      name: "vitest.config.ts with resolve.alias array",
      filename: "vitest.config.ts",
      code: `
        export default defineConfig({
          resolve: {
            alias: [
              { find: '@', replacement: './src' },
            ],
          },
        });
      `,
      errors: [{ messageId: "noResolveAlias" }],
    },
  ],
});
