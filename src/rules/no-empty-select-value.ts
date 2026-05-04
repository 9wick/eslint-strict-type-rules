/**
 * ESLintカスタムルール: SelectItem/RadioGroupItemなどのvalueプロパティに空文字列を禁止する
 *
 * shadcn/uiのSelectコンポーネントは、空文字列をvalueとして使用することを禁止している。
 * これは、空文字列がselectionをクリアするための特殊値として予約されているため。
 *
 * 検出対象:
 * - <SelectItem value="" />
 * - <SelectItem value={""} />
 * - <SelectItem value={``} />
 * - <RadioGroupItem value="" />
 * - その他のshadcn/uiコンポーネント
 *
 * @see https://github.com/radix-ui/primitives/issues/1569
 */

import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

/**
 * 空文字列を禁止すべきコンポーネント名のリスト
 */
const RESTRICTED_COMPONENTS = new Set([
  "SelectItem",
  "RadioGroupItem",
  "DropdownMenuItem",
  "ContextMenuItem",
]);

type MessageIds = "emptyValue";

const rule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow empty string values in SelectItem, RadioGroupItem, and similar components",
    },
    messages: {
      emptyValue:
        "{{componentName}} must not have an empty string value. Use a special constant like NO_SELECTION instead.",
    },
    schema: [],
  },

  defaultOptions: [],

  create(context) {
    return {
      JSXAttribute(node: TSESTree.JSXAttribute) {
        // value属性以外は無視
        if (node.name.type !== "JSXIdentifier" || node.name.name !== "value") {
          return;
        }

        // 親要素がJSXOpeningElementでない場合は無視
        const parent = node.parent as TSESTree.Node;
        if (parent.type !== "JSXOpeningElement") {
          return;
        }

        // コンポーネント名を取得
        const openingElement = parent as TSESTree.JSXOpeningElement;
        if (openingElement.name.type !== "JSXIdentifier") {
          return;
        }
        const componentName = openingElement.name.name;

        // 対象コンポーネントでない場合は無視
        if (!RESTRICTED_COMPONENTS.has(componentName)) {
          return;
        }

        // value属性の値をチェック
        const value = node.value;
        if (value == null) {
          return;
        }

        let isEmpty = false;

        if (value.type === "Literal" && value.value === "") {
          // <SelectItem value="" />
          isEmpty = true;
        } else if (value.type === "JSXExpressionContainer") {
          const expression = value.expression;
          if (expression.type === "Literal" && expression.value === "") {
            // <SelectItem value={""} />
            isEmpty = true;
          } else if (
            expression.type === "TemplateLiteral" &&
            expression.expressions.length === 0 &&
            expression.quasis.length === 1 &&
            expression.quasis[0].value.raw === ""
          ) {
            // <SelectItem value={``} />
            isEmpty = true;
          }
        }

        if (isEmpty) {
          context.report({
            node,
            messageId: "emptyValue",
            data: {
              componentName,
            },
          });
        }
      },
    };
  },
};

export default rule;
