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

function isInjectableDecorator(
  decorator: any,
  decoratorNames: string[],
): boolean {
  const expression = decorator.expression;
  if (expression?.type === "Identifier") {
    return decoratorNames.includes(expression.name);
  }
  if (
    expression?.type === "CallExpression" &&
    expression.callee.type === "Identifier"
  ) {
    return decoratorNames.includes(expression.callee.name);
  }
  return false;
}

function isInjectableClass(
  node: Rule.Node | null | undefined,
  decoratorNames: string[],
): boolean {
  return (
    node?.type === "ClassDeclaration" &&
    (node as any).decorators?.some((d: any) =>
      isInjectableDecorator(d, decoratorNames),
    )
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
        "Enforce NestJS-like DI patterns for needle-di modules: require @injectable() class exports, ban exported functions, module-level variables, and class fields.",
    },
    schema: [
      {
        type: "object",
        properties: {
          injectableDecorators: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingInjectable:
        "DI modules must export at least one @injectable() class.",
      noCallable:
        "Do not export functions from DI modules. Export behavior through an @injectable() class instead.",
      noModuleLevelVariable:
        "Do not declare variables at module level in DI modules. Use constructor injection instead.",
      noClassField:
        "Do not declare class fields in DI modules. Classes should be stateless. Use constructor parameter properties for injection.",
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const decoratorNames: string[] = options.injectableDecorators ?? [
      "injectable",
    ];

    return {
      // Check 1: No module-level variables
      VariableDeclaration(node) {
        const parent = (node as any).parent;
        if (parent?.type !== "Program") return;

        context.report({ node, messageId: "noModuleLevelVariable" });
      },

      // Check 2: No class fields
      PropertyDefinition(node) {
        context.report({ node, messageId: "noClassField" });
      },

      // Check 3 & 4: Require injectable export + no callable exports
      Program(node) {
        const programNode = node as any;
        const bindings = collectTopLevelBindings(programNode.body);
        let hasInjectableExport = false;

        for (const statement of programNode.body) {
          if (statement.type === "ExportNamedDeclaration") {
            if (statement.exportKind === "type") continue;

            const exportedNode = resolveExportedNode(
              statement.declaration,
              bindings,
            );

            if (isInjectableClass(exportedNode, decoratorNames)) {
              hasInjectableExport = true;
            }

            if (isCallableDeclaration(exportedNode)) {
              context.report({ node: statement, messageId: "noCallable" });
            }

            for (const specifier of statement.specifiers) {
              if (specifier.exportKind === "type") continue;

              const localNode = resolveExportedNode(
                specifier.local,
                bindings,
              );

              if (isInjectableClass(localNode, decoratorNames)) {
                hasInjectableExport = true;
              }

              if (isCallableDeclaration(localNode)) {
                context.report({
                  node: specifier,
                  messageId: "noCallable",
                });
              }
            }
          }

          if (statement.type === "ExportDefaultDeclaration") {
            const exportedNode = resolveExportedNode(
              statement.declaration,
              bindings,
            );

            if (isInjectableClass(exportedNode, decoratorNames)) {
              hasInjectableExport = true;
            }

            if (isCallableDeclaration(exportedNode)) {
              context.report({ node: statement, messageId: "noCallable" });
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
