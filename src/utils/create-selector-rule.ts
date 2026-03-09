import type { Rule } from "eslint";

/**
 * AST selector + message から ESLint ルールを生成するファクトリ。
 * no-restricted-syntax の各エントリを独立したカスタムルールに昇格させるために使う。
 */
export function createSelectorRule(options: {
  description: string;
  selector: string;
  messageId: string;
  message: string;
}): Rule.RuleModule {
  return {
    meta: {
      type: "problem",
      docs: {
        description: options.description,
      },
      messages: {
        [options.messageId]: options.message,
      },
      schema: [],
    },
    create(context) {
      return {
        [options.selector](node: Rule.Node) {
          context.report({ node, messageId: options.messageId });
        },
      };
    },
  };
}
