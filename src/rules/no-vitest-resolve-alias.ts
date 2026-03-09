import type { Rule } from "eslint";

/**
 * ESLint custom rule: Disallow resolve.alias in vitest.config files
 *
 * Using resolve.alias in vitest.config.ts causes module resolution during tests
 * to differ from runtime behavior, leading to these problems:
 *
 * 1. Tests pass even when dependencies are missing from package.json
 * 2. TypeScript builds succeed via tsconfig.json paths, masking the issue
 * 3. "Cannot find package" errors only appear at Node.js runtime
 *
 * Instead, use Node.js standard module resolution (package.json exports + node_modules)
 * to ensure consistent behavior between tests and runtime.
 *
 * Detection targets:
 * - resolve: { alias: { ... } }
 * - resolve: { alias: [ ... ] }
 */
const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow resolve.alias in vitest.config.ts to ensure consistent module resolution",
      recommended: true,
    },
    messages: {
      noResolveAlias:
        "vitest.config.ts での resolve.alias は禁止です。テスト時と実行時でモジュール解決が異なり、package.json の依存関係不足を検出できなくなります。代わりに package.json の dependencies に依存関係を追加し、Node.js の標準モジュール解決を使用してください。",
    },
    schema: [],
  },

  create(context) {
    /**
     * Check if the current file is a vitest.config file
     */
    function isVitestConfig(): boolean {
      const filename = context.filename ?? context.getFilename();
      return /vitest\.config\.(ts|js|mts|mjs)$/.test(filename);
    }

    return {
      /**
       * Detect resolve: { alias: ... } pattern
       * Reports when a property named 'alias' exists inside a 'resolve' property object
       */
      Property(node) {
        // Skip files that are not vitest.config.*
        if (!isVitestConfig()) {
          return;
        }

        // Skip if property name is not 'alias'
        if (node.key.type !== "Identifier" || node.key.name !== "alias") {
          return;
        }

        // Check if parent is an ObjectExpression (value of resolve property)
        const parent = node.parent;
        if (!parent || parent.type !== "ObjectExpression") {
          return;
        }

        const grandparent = (parent as { parent?: { type: string; key?: { type: string; name?: string } } }).parent;
        if (!grandparent || grandparent.type !== "Property") {
          return;
        }

        // Verify that the grandparent's key is 'resolve'
        if (
          grandparent.key?.type !== "Identifier" ||
          grandparent.key.name !== "resolve"
        ) {
          return;
        }

        // Report error
        context.report({
          node,
          messageId: "noResolveAlias",
        });
      },
    };
  },
};

export default rule;
