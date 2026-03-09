import { createSelectorRule } from "../utils/create-selector-rule.js";

export default createSelectorRule({
  description: "Disallow Promise<Result<>>. Use ResultAsync instead.",
  selector:
    'TSTypeReference[typeName.name="Promise"] > TSTypeParameterInstantiation > TSTypeReference[typeName.name="Result"]:first-child',
  messageId: "noPromiseResult",
  message:
    "Promise<Result<>> は禁止です。ResultAsync を使用してください。fromPromise でラップするか、チェーンメソッド（andThen, map, mapErr）で繋いでください。",
});
