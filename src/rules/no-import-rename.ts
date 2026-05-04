import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "noImportRename";

function getImportedName(node: TSESTree.ImportSpecifier): string {
  return node.imported.type === "Identifier"
    ? node.imported.name
    : node.imported.value;
}

const rule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow renaming imports with `import { foo as bar }`. Renamed imports can mislead readers about what a binding actually refers to. Allows renaming when the original name conflicts with another import in the same file.",
    },
    messages: {
      noImportRename:
        "import の as によるリネームは禁止です。元の名前「{{ imported }}」をそのまま使用してください。リネームは読み手を欺く可能性があります。",
    },
    schema: [],
  },

  defaultOptions: [],

  create(context) {
    const allLocalNames = new Set<string>();
    const importedNameCounts = new Map<string, number>();
    const renamedSpecifiers: Array<{
      node: TSESTree.ImportSpecifier;
      imported: string;
    }> = [];

    return {
      ImportDeclaration(decl: TSESTree.ImportDeclaration) {
        for (const specifier of decl.specifiers) {
          allLocalNames.add(specifier.local.name);
        }
        for (const specifier of decl.specifiers) {
          if (specifier.type !== "ImportSpecifier") continue;
          const imported = getImportedName(specifier);
          importedNameCounts.set(
            imported,
            (importedNameCounts.get(imported) ?? 0) + 1,
          );
          if (imported !== specifier.local.name) {
            renamedSpecifiers.push({ node: specifier, imported });
          }
        }
      },

      "Program:exit"() {
        for (const { node, imported } of renamedSpecifiers) {
          const hasLocalConflict = allLocalNames.has(imported);
          const hasDuplicateImport = (importedNameCounts.get(imported) ?? 0) > 1;
          if (hasLocalConflict || hasDuplicateImport) continue;
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
