import type { Rule } from "eslint";

function isFunctionLike(node: Rule.Node | null | undefined): boolean {
  return (
    node?.type === "FunctionDeclaration" ||
    node?.type === "FunctionExpression" ||
    node?.type === "ArrowFunctionExpression"
  );
}

function isCallableDeclaration(node: Rule.Node | null | undefined): boolean {
  if (!node) return false;
  if (isFunctionLike(node)) return true;
  if (node.type === "VariableDeclarator") {
    return isFunctionLike(node.init as Rule.Node | null);
  }
  return false;
}

function collectTopLevelBindings(body: Rule.Node[]): Map<string, Rule.Node> {
  const bindings = new Map<string, Rule.Node>();

  for (const statement of body) {
    if (
      statement.type === "FunctionDeclaration" &&
      (statement as any).id
    ) {
      bindings.set((statement as any).id.name, statement);
      continue;
    }

    if (
      statement.type === "ClassDeclaration" &&
      (statement as any).id
    ) {
      bindings.set((statement as any).id.name, statement);
      continue;
    }

    if (
      (statement as any).type === "TSEnumDeclaration" &&
      (statement as any).id?.type === "Identifier"
    ) {
      bindings.set((statement as any).id.name, statement);
      continue;
    }

    if (statement.type === "VariableDeclaration") {
      for (const declaration of (statement as any).declarations) {
        if (declaration.id.type === "Identifier") {
          bindings.set(declaration.id.name, declaration);
        }
      }
    }
  }

  return bindings;
}

function resolveExportedNode(
  declaration: Rule.Node | null | undefined,
  bindings: Map<string, Rule.Node>,
): Rule.Node | null {
  if (!declaration) return null;

  if (declaration.type === "Identifier") {
    return bindings.get((declaration as any).name) ?? null;
  }

  return declaration;
}

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow exported functions in DI-oriented modules. Export behavior through injectable classes instead.",
    },
    schema: [],
    messages: {
      noCallable:
        "Do not export functions from DI-oriented modules. Export behavior through an @injectable() class instead.",
    },
  },
  create(context) {
    return {
      Program(node) {
        const programNode = node as any;
        const bindings = collectTopLevelBindings(programNode.body);

        for (const statement of programNode.body) {
          if (statement.type === "ExportNamedDeclaration") {
            if (statement.exportKind === "type") {
              continue;
            }

            const exportedNode = resolveExportedNode(
              statement.declaration,
              bindings,
            );
            if (isCallableDeclaration(exportedNode)) {
              context.report({ node: statement, messageId: "noCallable" });
            }

            for (const specifier of statement.specifiers) {
              if (specifier.exportKind === "type") {
                continue;
              }

              const localNode = resolveExportedNode(
                specifier.local,
                bindings,
              );
              if (isCallableDeclaration(localNode)) {
                context.report({ node: specifier, messageId: "noCallable" });
              }
            }
          }

          if (statement.type === "ExportDefaultDeclaration") {
            const exportedNode = resolveExportedNode(
              statement.declaration,
              bindings,
            );
            if (isCallableDeclaration(exportedNode)) {
              context.report({ node: statement, messageId: "noCallable" });
            }
          }
        }
      },
    };
  },
};

export default rule;
