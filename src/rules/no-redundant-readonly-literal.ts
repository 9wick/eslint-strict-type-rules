import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "noRedundantReadonlyLiteral";

const LITERAL_TYPE_NODES = new Set([
  "TSLiteralType",
  "TSNullKeyword",
  "TSUndefinedKeyword",
]);

function isLiteralType(node: TSESTree.TypeNode): boolean {
  return LITERAL_TYPE_NODES.has(node.type);
}

function removeReadonlyKeyword(
  context: TSESLint.RuleContext<MessageIds, []>,
  node: TSESTree.Node,
): TSESLint.ReportFixFunction {
  return (fixer) => {
    const sourceCode = context.sourceCode;
    const readonlyToken = sourceCode.getFirstToken(node, {
      filter: (token) =>
        token.type === "Keyword" && token.value === "readonly",
    });
    if (!readonlyToken) return null;

    const nextToken = sourceCode.getTokenAfter(readonlyToken);
    if (!nextToken) return null;

    return fixer.removeRange([readonlyToken.range[0], nextToken.range[0]]);
  };
}

const rule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      description:
        "Disallow redundant `readonly` modifier on properties whose type is a single literal, `null`, or `undefined`.",
    },
    messages: {
      noRedundantReadonlyLiteral:
        "リテラル型のプロパティに readonly は不要です。値が単一のリテラル型であるため、再代入しても値は変わりません。",
    },
    schema: [],
  },

  defaultOptions: [],

  create(context) {
    function check(
      node: TSESTree.TSPropertySignature | TSESTree.PropertyDefinition,
    ) {
      if (!node.readonly) return;

      const typeAnnotation = node.typeAnnotation?.typeAnnotation;
      if (!typeAnnotation) return;
      if (!isLiteralType(typeAnnotation)) return;

      context.report({
        node,
        messageId: "noRedundantReadonlyLiteral",
        fix: removeReadonlyKeyword(context, node),
      });
    }

    return {
      TSPropertySignature: check,
      PropertyDefinition: check,
    };
  },
};

export default rule;
