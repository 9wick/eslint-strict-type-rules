import type { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow top-level variable declarations in DI-oriented modules. Module-level state breaks dependency injection.",
    },
    schema: [],
    messages: {
      noModuleLevelVariable:
        "Do not declare variables at module level in DI-oriented modules. Use class fields or inject dependencies instead.",
    },
  },
  create(context) {
    return {
      VariableDeclaration(node) {
        const parent = (node as any).parent;
        if (parent?.type !== "Program") return;

        context.report({ node, messageId: "noModuleLevelVariable" });
      },
    };
  },
};

export default rule;
