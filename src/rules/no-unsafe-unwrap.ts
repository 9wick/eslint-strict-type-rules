import { createSelectorRule } from "../utils/create-selector-rule.js";

export default createSelectorRule({
  description:
    "Disallow _unsafeUnwrap and _unsafeUnwrapErr. Use match or andThen instead.",
  selector:
    'CallExpression:matches([callee.property.name="_unsafeUnwrap"], [callee.property.name="_unsafeUnwrapErr"])',
  messageId: "noUnsafeUnwrap",
  message:
    "_unsafeUnwrap / _unsafeUnwrapErr は禁止です。match や andThen で安全にハンドリングしてください。",
});
