import { createSelectorRule } from "../utils/create-selector-rule.js";

export default createSelectorRule({
  description: "Disallow throw statements. Use neverthrow Result type instead.",
  selector: "ThrowStatement",
  messageId: "noThrow",
  message:
    "throw は禁止です。neverthrow の Result 型（ok/err）を使用してください。外部ライブラリの例外は fromThrowable で変換してください。",
});
