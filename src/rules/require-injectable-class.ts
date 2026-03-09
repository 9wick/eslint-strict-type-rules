import type { Rule } from "eslint";

function isInjectableDecorator(decorator: any): boolean {
  const expression = decorator.expression;
  if (expression?.type === "Identifier") {
    return expression.name === "injectable";
  }
  if (
    expression?.type === "CallExpression" &&
    expression.callee.type === "Identifier"
  ) {
    return expression.callee.name === "injectable";
  }
  return false;
}

function isInjectableClass(node: Rule.Node | null | undefined): boolean {
  return (
    node?.type === "ClassDeclaration" &&
    (node as any).decorators?.some(isInjectableDecorator)
  );
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
        "Require DI-oriented modules to export at least one @injectable() class as their runtime entrypoint.",
    },
    schema: [],
    messages: {
      missingInjectable:
        "DI-oriented modules must export at least one @injectable() class.",
    },
  },
  create(context) {
    return {
      Program(node) {
        const programNode = node as any;
        const bindings = collectTopLevelBindings(programNode.body);
        let hasInjectableExport = false;

        for (const statement of programNode.body) {
          if (statement.type === "ExportNamedDeclaration") {
            const exportedNode = resolveExportedNode(
              statement.declaration,
              bindings,
            );
            if (isInjectableClass(exportedNode)) {
              hasInjectableExport = true;
              break;
            }

            for (const specifier of statement.specifiers) {
              if (specifier.exportKind === "type") {
                continue;
              }

              const localNode = resolveExportedNode(
                specifier.local,
                bindings,
              );
              if (isInjectableClass(localNode)) {
                hasInjectableExport = true;
                break;
              }
            }
          }

          if (statement.type === "ExportDefaultDeclaration") {
            const exportedNode = resolveExportedNode(
              statement.declaration,
              bindings,
            );
            if (isInjectableClass(exportedNode)) {
              hasInjectableExport = true;
              break;
            }
          }
        }

        if (!hasInjectableExport) {
          context.report({ node, messageId: "missingInjectable" });
        }
      },
    };
  },
};

export default rule;
