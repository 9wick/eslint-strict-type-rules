import { createSelectorRule } from "../utils/create-selector-rule.js";

export default createSelectorRule({
  description:
    "Disallow 'in' operator for type safety. Use ts-pattern match instead.",
  selector: 'BinaryExpression[operator="in"]',
  messageId: "noInOperator",
  message:
    "in 演算子は型安全性を破壊するため禁止です。ts-pattern の match を使用してください。",
});
