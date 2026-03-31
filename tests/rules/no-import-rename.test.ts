import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";

import rule from "../../src/rules/no-import-rename.js";

const ruleTester = new RuleTester();

describe("no-import-rename", () => {
  it("should pass valid cases and fail invalid cases", () => {
    ruleTester.run("no-import-rename", rule, {
      valid: [
        { code: `import { foo } from 'bar';` },
        { code: `import { foo, bar } from 'baz';` },
        { code: `import defaultExport from 'module';` },
        { code: `import * as ns from 'module';` },
        { code: `import 'side-effect';` },
        { code: `import { type Foo } from 'bar';` },
      ],
      invalid: [
        {
          code: `import { foo as bar } from 'baz';`,
          errors: [
            {
              messageId: "noImportRename",
              data: { imported: "foo" },
            },
          ],
        },
        {
          code: `import { error as success } from 'result';`,
          errors: [
            {
              messageId: "noImportRename",
              data: { imported: "error" },
            },
          ],
        },
        {
          code: `import { type Foo as Bar } from 'baz';`,
          errors: [
            {
              messageId: "noImportRename",
              data: { imported: "Foo" },
            },
          ],
        },
        {
          code: `import { foo as bar, baz as qux } from 'module';`,
          errors: [
            {
              messageId: "noImportRename",
              data: { imported: "foo" },
            },
            {
              messageId: "noImportRename",
              data: { imported: "baz" },
            },
          ],
        },
        {
          code: `import { foo, bar as renamed } from 'module';`,
          errors: [
            {
              messageId: "noImportRename",
              data: { imported: "bar" },
            },
          ],
        },
      ],
    });
  });
});
