import { createSelectorRule } from "../utils/create-selector-rule.js";

export default createSelectorRule({
  description:
    "Disallow nested andThen calls in neverthrow chains. Use flat chains instead.",
  selector:
    'CallExpression[callee.property.name="andThen"] > :matches(ArrowFunctionExpression, FunctionExpression) CallExpression[callee.property.name="andThen"]',
  messageId: "noNestedAndThen",
  message:
    "neverthrow のチェーン内でのネストは禁止です。コンテキストを引き回すか、ヘルパー関数に切り出してフラットなチェーンにしてください。",
});
