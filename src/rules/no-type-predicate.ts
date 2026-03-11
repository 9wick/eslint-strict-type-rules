import { createSelectorRule } from "../utils/create-selector-rule.js";

export default createSelectorRule({
  description:
    "Disallow user-defined type predicates (x is Type, asserts x is Type). Use validation libraries instead.",
  selector: "TSTypePredicate",
  messageId: "noTypePredicate",
  message:
    "ユーザー定義の型述語（x is Type / asserts x is Type）は禁止です。TypeScript は実装の正しさを検証しません。バリデーションライブラリ（Valibot, Typebox 等）の型ガードを使用してください。",
});
