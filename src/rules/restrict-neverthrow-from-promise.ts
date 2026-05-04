import type { Rule } from "eslint";

type Classification = "external" | "internal" | "local" | "global";

function resolveRootIdentifier(node: Rule.Node): string | null {
  if (node.type === "Identifier") return node.name;
  if (node.type === "MemberExpression" && node.object) {
    return resolveRootIdentifier(node.object as Rule.Node);
  }
  return null;
}

function extractCallExpression(node: Rule.Node): Rule.Node | null {
  if (node.type === "CallExpression") return node;
  if (node.type === "AwaitExpression" && node.argument) {
    return extractCallExpression(node.argument as Rule.Node);
  }
  return null;
}

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Restrict ResultAsync.fromPromise() to only wrap external library function calls.",
    },
    messages: {
      internalFunctionCall:
        "ResultAsync.fromPromise() に内部関数（相対import）を渡すことは禁止です。内部関数は直接 ResultAsync を返すようにリファクタリングしてください。",
      localFunctionCall:
        "ResultAsync.fromPromise() にローカル定義の関数を渡すことは禁止です。その関数自体が ResultAsync を返すようにしてください。",
      multipleStatements:
        "ResultAsync.fromPromise() に渡す関数は単一の式または単一のreturn文のみ許可されます。複数文を含む処理は ResultAsync を返す関数に切り出してください。",
      unresolvableArgument:
        "ResultAsync.fromPromise() の第一引数を解析できませんでした。外部ライブラリの関数呼び出しのみを渡してください。",
    },
    schema: [],
  },
  create(context) {
    const importClassification = new Map<string, "external" | "internal">();
    const localDefinitions = new Set<string>();
    let resultAsyncLocalName = "ResultAsync";

    function classifyIdentifier(name: string): Classification {
      const imported = importClassification.get(name);
      if (imported) return imported;
      if (localDefinitions.has(name)) return "local";
      return "global";
    }

    function reportForClassification(
      classification: Classification,
      node: Rule.Node,
    ): void {
      if (classification === "internal") {
        context.report({ node, messageId: "internalFunctionCall" });
      } else if (classification === "local") {
        context.report({ node, messageId: "localFunctionCall" });
      }
    }

    function analyzeCallLike(node: Rule.Node, reportNode: Rule.Node): boolean {
      const callExpr = extractCallExpression(node);
      if (callExpr && callExpr.type === "CallExpression") {
        const root = resolveRootIdentifier(callExpr.callee as Rule.Node);
        if (!root) {
          context.report({ node: reportNode, messageId: "unresolvableArgument" });
          return true;
        }
        const classification = classifyIdentifier(root);
        reportForClassification(classification, reportNode);
        return true;
      }
      if (node.type === "NewExpression") {
        const root = resolveRootIdentifier(node.callee as Rule.Node);
        if (!root) {
          context.report({ node: reportNode, messageId: "unresolvableArgument" });
          return true;
        }
        const classification = classifyIdentifier(root);
        reportForClassification(classification, reportNode);
        return true;
      }
      return false;
    }

    function analyzeFunctionBody(
      node: Rule.Node & { body: Rule.Node },
      reportNode: Rule.Node,
    ): void {
      const { body } = node;
      if (body.type !== "BlockStatement") {
        if (!analyzeCallLike(body, reportNode)) {
          context.report({ node: reportNode, messageId: "unresolvableArgument" });
        }
        return;
      }
      const statements = (body as Rule.Node & { body: Rule.Node[] }).body;
      if (statements.length >= 2) {
        context.report({ node: reportNode, messageId: "multipleStatements" });
        return;
      }
      if (
        statements.length === 1 &&
        statements[0].type === "ReturnStatement" &&
        (statements[0] as Rule.Node & { argument?: Rule.Node }).argument
      ) {
        const arg = (statements[0] as Rule.Node & { argument: Rule.Node })
          .argument;
        if (!analyzeCallLike(arg, reportNode)) {
          context.report({ node: reportNode, messageId: "unresolvableArgument" });
        }
        return;
      }
      context.report({ node: reportNode, messageId: "unresolvableArgument" });
    }

    function isFromPromiseCall(node: Rule.Node): boolean {
      if (node.type !== "CallExpression") return false;
      const callee = node.callee as Rule.Node;
      if (callee.type !== "MemberExpression") return false;
      const obj = callee.object as Rule.Node;
      const prop = callee.property as Rule.Node;
      return (
        obj.type === "Identifier" &&
        obj.name === resultAsyncLocalName &&
        prop.type === "Identifier" &&
        prop.name === "fromPromise"
      );
    }

    return {
      ImportDeclaration(node) {
        const source = (node.source as { value: string }).value;
        const isRelative =
          source.startsWith("./") || source.startsWith("../");
        const classification = isRelative ? "internal" : "external";

        for (const specifier of node.specifiers ?? []) {
          const local = (specifier.local as { name: string }).name;
          importClassification.set(local, classification);

          if (
            specifier.type === "ImportSpecifier" &&
            (specifier.imported as { name: string }).name === "ResultAsync"
          ) {
            resultAsyncLocalName = local;
          }
        }
      },
      FunctionDeclaration(node) {
        if (node.id && (node.id as { name: string }).name) {
          localDefinitions.add((node.id as { name: string }).name);
        }
      },
      VariableDeclarator(node) {
        const init = (node as Rule.Node & { init?: Rule.Node }).init;
        if (
          init &&
          (init.type === "ArrowFunctionExpression" ||
            init.type === "FunctionExpression") &&
          (node.id as { name?: string }).name
        ) {
          localDefinitions.add((node.id as { name: string }).name);
        }
      },
      CallExpression(node) {
        if (!isFromPromiseCall(node)) return;
        const args = (node as Rule.Node & { arguments: Rule.Node[] }).arguments;
        if (args.length < 1) return;
        const firstArg = args[0];

        if (
          firstArg.type === "ArrowFunctionExpression" ||
          firstArg.type === "FunctionExpression"
        ) {
          analyzeFunctionBody(
            firstArg as Rule.Node & { body: Rule.Node },
            node,
          );
          return;
        }

        if (!analyzeCallLike(firstArg, node)) {
          context.report({ node, messageId: "unresolvableArgument" });
        }
      },
    };
  },
};

export default rule;
