import { createSelectorRule } from "../utils/create-selector-rule.js";

export default createSelectorRule({
  description:
    "Disallow try-catch statements. Use neverthrow fromThrowable/fromPromise instead.",
  selector: "TryStatement",
  messageId: "noTryCatch",
  message:
    "try-catch は禁止です。neverthrow の fromThrowable / fromPromise を使用してください。",
});
