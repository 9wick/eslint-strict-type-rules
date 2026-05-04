export interface RestrictedSyntaxRule {
  selector: string;
  message: string;
}

/**
 * 基底ルール: 全TypeScriptファイルに適用される no-restricted-syntax ルール
 *
 * 各ルールにはキーが付与されており、buildRestrictedSyntaxRules で
 * 特定キーを除外してサブセットを構築できる。
 */
export const BASE_RESTRICTED_SYNTAX_RULES = {
  /** throw キーワードを禁止。neverthrow の Result 型を使用すること。 */
  throw: {
    selector: "ThrowStatement",
    message:
      "throw は禁止です。neverthrow の Result 型（ok/err）を使用してください。外部ライブラリの例外は fromThrowable で変換してください。",
  },
  /** try-catch を禁止。neverthrow の fromThrowable / fromPromise を使用すること。 */
  tryCatch: {
    selector: "TryStatement",
    message:
      "try-catch は禁止です。neverthrow の fromThrowable / fromPromise を使用してください。",
  },
  /** Promise<Result<>> を禁止。ResultAsync を使用すること。 */
  promiseResult: {
    selector:
      'TSTypeReference[typeName.name="Promise"] > TSTypeParameterInstantiation > TSTypeReference[typeName.name="Result"]:first-child',
    message:
      "Promise<Result<>> は禁止です。ResultAsync を使用してください。fromPromise でラップするか、チェーンメソッド（andThen, map, mapErr）で繋いでください。",
  },
  /** neverthrow のチェーン内でのネストを禁止。 */
  nestedAndThen: {
    selector:
      'CallExpression[callee.property.name="andThen"] > :matches(ArrowFunctionExpression, FunctionExpression) CallExpression[callee.property.name="andThen"]',
    message:
      "neverthrow のチェーン内でのネストは禁止です。コンテキストを引き回すか、ヘルパー関数に切り出してフラットなチェーンにしてください。",
  },
  /** as による型アサーションを禁止（as const は許可）。 */
  asAssertion: {
    selector: 'TSAsExpression:not([typeAnnotation.typeName.name="const"])',
    message:
      "as による型アサーションは禁止です（as const は許可）。代わりに `const a: Type = value` の形式で型注釈を使用してください。",
  },
  /** <> による型アサーションを禁止。 */
  angleAssertion: {
    selector: "TSTypeAssertion",
    message:
      "<> による型アサーションは禁止です。代わりに `const a: Type = value` の形式で型注釈を使用してください。",
  },
  /** in 演算子を禁止（型安全性を破壊するため）。 */
  inOperator: {
    selector: 'BinaryExpression[operator="in"]',
    message:
      "in 演算子は型安全性を破壊するため禁止です。ts-pattern の match を使用してください。",
  },
  /** Object.hasOwn を禁止（型安全性を破壊するため）。 */
  objectHasOwn: {
    selector:
      'CallExpression[callee.object.name="Object"][callee.property.name="hasOwn"]',
    message:
      "Object.hasOwn は型安全性を破壊するため禁止です。ts-pattern の match を使用してください。",
  },
  /** Promise.reject を禁止。neverthrow の errAsync を使用すること。 */
  promiseReject: {
    selector:
      'CallExpression[callee.object.name="Promise"][callee.property.name="reject"]',
    message:
      "Promise.reject は禁止です。neverthrow の errAsync を使用してください。",
  },
  /**
   * process オブジェクトへの直接アクセスを禁止。
   * process.env, process.exit, process.argv 等はグローバル状態への暗黙的な依存を生み、
   * テスタビリティとポータビリティを損なう。
   * 代わりに DI / 設定オブジェクト経由でアクセスすること。
   */
  /** ユーザー定義の型述語を禁止。バリデーションライブラリを使用すること。 */
  typePredicate: {
    selector: "TSTypePredicate",
    message:
      "ユーザー定義の型述語（x is Type / asserts x is Type）は禁止です。TypeScript は実装の正しさを検証しません。バリデーションライブラリ（Valibot, Typebox 等）の型ガードを使用してください。",
  },
  processAccess: {
    selector: 'MemberExpression[object.name="process"]',
    message:
      "process への直接アクセスは禁止です。DI や設定オブジェクト経由でアクセスしてください。",
  },
} as const satisfies Record<string, RestrictedSyntaxRule>;

export type RestrictedSyntaxKey = keyof typeof BASE_RESTRICTED_SYNTAX_RULES;

/**
 * ルールオブジェクトから ESLint の no-restricted-syntax 配列形式に変換する。
 * excludeKeys で特定のルールを除外できる。
 */
export function buildRestrictedSyntaxRules(
  excludeKeys: RestrictedSyntaxKey[] = [],
): RestrictedSyntaxRule[] {
  const excludeSet = new Set<string>(excludeKeys);
  return Object.entries(BASE_RESTRICTED_SYNTAX_RULES)
    .filter(([key]) => !excludeSet.has(key))
    .map(([, rule]) => rule);
}
