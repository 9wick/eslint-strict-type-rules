# @9wick/eslint-plugin-strict-type-rules

neverthrow / 型安全性 / コード品質のための厳格な ESLint ルールセット + TypeScript 最厳格設定。

## Install

```bash
pnpm add -D "github:9wick/eslint-strict-type-rules#main"
```

### Peer Dependencies

```bash
pnpm add -D eslint typescript-eslint eslint-plugin-import-x eslint-plugin-sonarjs @eslint-community/eslint-plugin-eslint-comments
```

React を使う場合:

```bash
pnpm add -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh
```

## TSConfig

最厳格な TypeScript コンパイラ設定を提供します。

```json
// tsconfig.json
{
  "extends": "@9wick/eslint-plugin-strict-type-rules/tsconfig/strictest.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist"
  }
}
```

### 含まれるオプション

| カテゴリ | オプション | 説明 |
|---------|-----------|------|
| **strict** | `strict: true` | 8個の厳格チェックを一括有効化 |
| **型安全性** | `noUncheckedIndexedAccess` | インデックスアクセスに `undefined` を追加 |
| | `exactOptionalPropertyTypes` | `?` プロパティへの暗黙的 `undefined` 代入を禁止 |
| | `noPropertyAccessFromIndexSignature` | Record 型のドットアクセスを禁止 |
| **制御フロー** | `noImplicitOverride` | `override` キーワードの明示を強制 |
| | `noFallthroughCasesInSwitch` | switch フォールスルーを禁止 |
| | `noImplicitReturns` | void 以外の関数の暗黙 return を禁止 |
| | `allowUnusedLabels: false` | 未使用ラベルをエラー |
| | `allowUnreachableCode: false` | 到達不能コードをエラー |
| **モジュール** | `isolatedModules` | ファイル単位トランスパイル互換を強制 |
| | `verbatimModuleSyntax` | `import type` の明示を強制 |
| | `erasableSyntaxOnly` | enum / namespace を禁止（TS 5.8+） |

> **Note:** `noUnusedLocals` / `noUnusedParameters` は ESLint 側で制御するため意図的に除外しています。

## Usage

> **Note:** `no-unnecessary-condition` は typed linting が必要です。`parserOptions.projectService: true` の設定（`tseslint.configs.recommendedTypeChecked` 等）を推奨します。

```js
// eslint.config.mjs
import tseslint from "typescript-eslint";
import strictTypes from "@9wick/eslint-plugin-strict-type-rules";

export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,
  ...strictTypes.configs.recommended,
);
```

### React プロジェクト

```js
export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,
  ...strictTypes.configs.recommended,
  ...strictTypes.configs.react,
);
```

### テスト緩和 + barrel 制約

```js
export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,
  ...strictTypes.configs.recommended,
  ...strictTypes.configs.test,    // .test.ts で throw/try-catch 等を許可
  ...strictTypes.configs.barrel,  // index.ts を re-export のみに制限
);
```

### ルールの個別 opt-out

全ルールが独立しているため、1行で無効化できます:

```js
export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,
  ...strictTypes.configs.recommended,
  {
    rules: {
      "@9wick/strict-type-rules/no-throw": "off",
    },
  },
);
```

### DI ルールのスコープ

`no-exported-callable` / `require-injectable-class` は sub-extension 付きファイル（`*.service.ts`, `*.controller.ts` 等）にのみ適用されます。特定の sub-extension を除外するには:

```js
export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,
  ...strictTypes.configs.recommended,
  {
    files: ["**/*.lib.{ts,tsx}"],
    rules: {
      "@9wick/strict-type-rules/no-exported-callable": "off",
      "@9wick/strict-type-rules/require-injectable-class": "off",
    },
  },
);
```

## Configs

| Config | 説明 |
|--------|------|
| `recommended` / `base` | 全ルール有効（同一内容） |
| `react` | `**/*.{jsx,tsx}` 対象。JSX depth/props 制限、prop-types off |
| `test` | `**/*.test.{ts,tsx}` 対象。throw/try-catch 等を許可、max-lines 緩和。`.spec.ts` / `__tests__/` 禁止 |
| `barrel` | `**/index.ts` 対象。re-export のみ許可 |

## Rules

### Strict Syntax Rules

| Rule | 説明 |
|------|------|
| `no-throw` | `throw` 文を禁止。neverthrow の `err()` を使用 |
| `no-try-catch` | `try-catch` を禁止。Result 型でエラーハンドリング |
| `no-promise-result` | `Promise<Result>` を禁止。`ResultAsync` を使用 |
| `no-nested-and-then` | `andThen` のネストを禁止。`safeTry` を使用 |
| `no-as-assertion` | `as` 型アサーションを禁止（`as const` は許可） |
| `no-angle-assertion` | `<Type>value` 型アサーションを禁止 |
| `no-in-operator` | `in` 演算子を禁止。ts-pattern の `match` を使用 |
| `no-object-has-own` | `Object.hasOwn` を禁止。ts-pattern の `match` を使用 |
| `no-promise-reject` | `Promise.reject` を禁止。neverthrow の `errAsync` を使用 |
| `no-process-access` | `process.*` への直接アクセスを禁止。DI / 設定オブジェクト経由でアクセス |
| `no-unsafe-unwrap` | `_unsafeUnwrap` / `_unsafeUnwrapErr` を禁止。`match` や `andThen` を使用 |

### Other Rules

| Rule | 説明 |
|------|------|
| `no-empty-select-value` | `<SelectItem value="">` 等の空 value を禁止 |
| `no-vitest-resolve-alias` | vitest.config の `resolve.alias` を禁止 |
| `no-cross-directory-lib-import` | `.lib` ファイルの同フォルダ外 import を禁止 |
| `no-exported-callable` | DI モジュールからの関数 export を禁止（`*.*.{ts,tsx}` のみ、`*.lib.*` 除外） |
| `require-injectable-class` | DI モジュールに `@injectable` class を要求（`*.*.{ts,tsx}` のみ、`*.lib.*` 除外） |

### Built-in Rules (base config)

| Rule | 設定 |
|------|------|
| `complexity` | max: 7 |
| `sonarjs/cognitive-complexity` | error |
| `no-console` | error |
| `max-lines` | 500 行 |
| `max-lines-per-function` | 50 行 |
| `import-x/no-cycle` | error |
| `import-x/order` | グループ間改行必須 |
| `import-x/no-namespace` | error |
| `@typescript-eslint/no-unnecessary-condition` | error (要 typed linting) |
| `@eslint-community/eslint-comments/no-use` | allow: [] |
