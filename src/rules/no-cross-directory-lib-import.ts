import type { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow importing .lib.* files from outside the same directory.",
    },
    messages: {
      noCrossDirectoryLibImport:
        ".lib ファイルは同一ディレクトリからのみ import 可能です。",
    },
    schema: [],
  },
  create(context) {
    function check(node: Rule.Node & { source?: { value?: unknown } | null }) {
      const source = node.source?.value;
      if (typeof source !== "string") return;

      const basename = source.split("/").pop() || "";
      if (!/\.lib(\.|$)/.test(basename)) return;

      // Same-directory relative import: ./foo.lib or ./foo.lib.js
      if (source.startsWith("./") && !source.slice(2).includes("/")) {
        return;
      }

      context.report({ node, messageId: "noCrossDirectoryLibImport" });
    }

    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
    };
  },
};

export default rule;
