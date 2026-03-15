import type { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow class field declarations in DI-oriented modules. Classes should be stateless; use constructor injection for dependencies.",
    },
    schema: [],
    messages: {
      noClassField:
        "Do not declare class fields in DI-oriented modules. Classes should be stateless. Use constructor parameter properties for dependency injection.",
    },
  },
  create(context) {
    return {
      PropertyDefinition(node) {
        context.report({ node, messageId: "noClassField" });
      },
    };
  },
};

export default rule;
