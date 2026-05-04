import { createSelectorRule } from "../utils/create-selector-rule.js";

export default createSelectorRule({
  description:
    "Disallow Promise.reject. Use neverthrow errAsync instead.",
  selector:
    'CallExpression[callee.object.name="Promise"][callee.property.name="reject"]',
  messageId: "noPromiseReject",
  message:
    "Promise.reject は禁止です。neverthrow の errAsync を使用してください。",
});
