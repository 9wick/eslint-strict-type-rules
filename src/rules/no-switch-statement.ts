import { createSelectorRule } from "../utils/create-selector-rule.js";

export default createSelectorRule({
  description:
    "Disallow switch statements. Use ts-pattern match() for exhaustive pattern matching.",
  selector: "SwitchStatement",
  messageId: "noSwitchStatement",
  message:
    "switch 文の代わりに ts-pattern の match() を使用してください。網羅性チェックが保証されます。",
});
