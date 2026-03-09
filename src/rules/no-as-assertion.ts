import { createSelectorRule } from "../utils/create-selector-rule.js";

export default createSelectorRule({
  description:
    "Disallow 'as' type assertions (except 'as const'). Use type annotations instead.",
  selector: 'TSAsExpression:not([typeAnnotation.typeName.name="const"])',
  messageId: "noAsAssertion",
  message:
    "as による型アサーションは禁止です（as const は許可）。代わりに `const a: Type = value` の形式で型注釈を使用してください。",
});
