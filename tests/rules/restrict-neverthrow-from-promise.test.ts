import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";

import rule from "../../src/rules/restrict-neverthrow-from-promise.js";

const ruleTester = new RuleTester();

describe("restrict-neverthrow-from-promise", () => {
  it("should allow external library calls and reject internal calls", () => {
    ruleTester.run("restrict-neverthrow-from-promise", rule, {
      valid: [
        // External package direct call
        {
          code: `import prisma from '@prisma/client';
ResultAsync.fromPromise(prisma.user.findMany(), e => e);`,
        },
        // Global API (fetch)
        {
          code: `ResultAsync.fromPromise(fetch("/api/users"), e => e);`,
        },
        // External import with method chain
        {
          code: `import axios from 'axios';
ResultAsync.fromPromise(axios.get("/api").then(r => r.data), e => e);`,
        },
        // Arrow function (expression body) with external call
        {
          code: `import prisma from '@prisma/client';
ResultAsync.fromPromise(() => prisma.user.create({ data: { name: "test" } }), e => e);`,
        },
        // Arrow function (block body, single return) with external call
        {
          code: `import prisma from '@prisma/client';
ResultAsync.fromPromise(async () => { return prisma.user.findMany() }, e => e);`,
        },
        // Not ResultAsync.fromPromise (different object)
        {
          code: `import { myFn } from './internal';
someObject.fromPromise(myFn(), e => e);`,
        },
        // Not fromPromise method
        {
          code: `ResultAsync.fromResult(ok(1));`,
        },
        // new Promise (global constructor)
        {
          code: `ResultAsync.fromPromise(new Promise(resolve => setTimeout(resolve, 1000)), e => e);`,
        },
        // Namespace import from external
        {
          code: `import * as AWS from 'aws-sdk';
ResultAsync.fromPromise(AWS.S3.putObject({ Bucket: 'b', Key: 'k' }), e => e);`,
        },
        // Scoped package (monorepo external)
        {
          code: `import { utils } from '@myorg/shared';
ResultAsync.fromPromise(utils.doSomething(), e => e);`,
        },
        // Renamed ResultAsync import
        {
          code: `import { ResultAsync as RA } from 'neverthrow';
import axios from 'axios';
RA.fromPromise(axios.get("/api"), e => e);`,
        },
      ],
      invalid: [
        // Internal function (relative import) direct call
        {
          code: `import { getUserById } from './user-repository';
ResultAsync.fromPromise(getUserById(1), e => e);`,
          errors: [{ messageId: "internalFunctionCall" }],
        },
        // Locally defined function
        {
          code: `async function fetchData() { return 42; }
ResultAsync.fromPromise(fetchData(), e => e);`,
          errors: [{ messageId: "localFunctionCall" }],
        },
        // Locally defined arrow function variable
        {
          code: `const fetchData = async () => 42;
ResultAsync.fromPromise(fetchData(), e => e);`,
          errors: [{ messageId: "localFunctionCall" }],
        },
        // Multiple statements in arrow function
        {
          code: `import prisma from '@prisma/client';
ResultAsync.fromPromise(async () => { const data = { name: "test" }; return prisma.user.create({ data }); }, e => e);`,
          errors: [{ messageId: "multipleStatements" }],
        },
        // Internal import with method chain
        {
          code: `import { api } from '../services/api';
ResultAsync.fromPromise(api.get("/users").then(r => r.data), e => e);`,
          errors: [{ messageId: "internalFunctionCall" }],
        },
        // Local function inside arrow function
        {
          code: `async function doWork() { return 42; }
ResultAsync.fromPromise(() => doWork(), e => e);`,
          errors: [{ messageId: "localFunctionCall" }],
        },
        // Relative path import (parent directory)
        {
          code: `import { myService } from '../services';
ResultAsync.fromPromise(myService.execute(), e => e);`,
          errors: [{ messageId: "internalFunctionCall" }],
        },
        // String literal as first argument
        {
          code: `ResultAsync.fromPromise("not a function call", e => e);`,
          errors: [{ messageId: "unresolvableArgument" }],
        },
        // Variable reference (not a call)
        {
          code: `const p = fetch("/api");
ResultAsync.fromPromise(p, e => e);`,
          errors: [{ messageId: "unresolvableArgument" }],
        },
        // Renamed ResultAsync with internal call
        {
          code: `import { ResultAsync as RA } from 'neverthrow';
import { myFn } from './internal';
RA.fromPromise(myFn(), e => e);`,
          errors: [{ messageId: "internalFunctionCall" }],
        },
      ],
    });
  });
});
