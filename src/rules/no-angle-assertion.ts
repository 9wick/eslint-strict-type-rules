import { createSelectorRule } from "../utils/create-selector-rule.js";

export default createSelectorRule({
  description:
    "Disallow angle-bracket type assertions. Use type annotations instead.",
  selector: "TSTypeAssertion",
  messageId: "noAngleAssertion",
  message:
    "<> による型アサーションは禁止です。代わりに `const a: Type = value` の形式で型注釈を使用してください。",
});
