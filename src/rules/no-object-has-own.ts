import { createSelectorRule } from "../utils/create-selector-rule.js";

export default createSelectorRule({
  description:
    "Disallow Object.hasOwn for type safety. Use ts-pattern match instead.",
  selector:
    'CallExpression[callee.object.name="Object"][callee.property.name="hasOwn"]',
  messageId: "noObjectHasOwn",
  message:
    "Object.hasOwn は型安全性を破壊するため禁止です。ts-pattern の match を使用してください。",
});
