import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "noImportRename";

const rule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow renaming imports with `import { foo as bar }`. Renamed imports can mislead readers about what a binding actually refers to.",
    },
    messages: {
      noImportRename:
        "import の as によるリネームは禁止です。元の名前「{{ imported }}」をそのまま使用してください。リネームは読み手を欺く可能性があります。",
    },
    schema: [],
  },

  defaultOptions: [],

  create(context) {
    return {
      ImportSpecifier(node: TSESTree.ImportSpecifier) {
        const imported =
          node.imported.type === "Identifier"
            ? node.imported.name
            : node.imported.value;

        if (imported !== node.local.name) {
          context.report({
            node,
            messageId: "noImportRename",
            data: { imported },
          });
        }
      },
    };
  },
};

export default rule;
