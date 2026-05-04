import { createSelectorRule } from "../utils/create-selector-rule.js";

export default createSelectorRule({
  description:
    "Disallow direct process object access. Use DI or config objects instead.",
  selector: 'MemberExpression[object.name="process"]',
  messageId: "noProcessAccess",
  message:
    "process への直接アクセスは禁止です。DI や設定オブジェクト経由でアクセスしてください。",
});
