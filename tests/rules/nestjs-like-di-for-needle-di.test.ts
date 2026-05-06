import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";

import rule from "../../src/rules/nestjs-like-di-for-needle-di.js";

const ruleTester = new RuleTester();

describe("nestjs-like-di-for-needle-di", () => {
  it("should allow valid DI module patterns", () => {
    ruleTester.run("nestjs-like-di-for-needle-di", rule, {
      valid: [
        // Basic injectable class with constructor injection
        {
          code: `@injectable() export class UserService {
            constructor(private readonly repo: UserRepository) {}
            findAll() { return this.repo.findAll(); }
          }`,
        },
        // @injectable without call expression
        {
          code: `@injectable export class UserService {}`,
        },
        // Declared then exported via specifier
        {
          code: `@injectable() class UserService {} export { UserService };`,
        },
        // Default export
        {
          code: `@injectable() export default class UserService {}`,
        },
        // Type exports alongside injectable class
        {
          code: `
            export type { UserDTO } from './types';
            @injectable() export class UserService {}
          `,
        },
        // Multiple constructor injections
        {
          code: `@injectable() export class UserService {
            constructor(
              private readonly repo: UserRepository,
              private readonly logger: Logger,
            ) {}
          }`,
        },
      ],
      invalid: [],
    });
  });

  it("should require at least one @injectable() class export", () => {
    ruleTester.run("nestjs-like-di-for-needle-di", rule, {
      valid: [],
      invalid: [
        // No exports at all
        {
          code: `class MyService {}`,
          errors: [{ messageId: "missingInjectable" }],
        },
        // Exported class without decorator
        {
          code: `export class MyService {}`,
          errors: [{ messageId: "missingInjectable" }],
        },
        // Wrong decorator name
        {
          code: `@singleton() export class MyService {}`,
          errors: [{ messageId: "missingInjectable" }],
        },
        // Injectable class but not exported
        {
          code: `@injectable() class MyService {}`,
          errors: [{ messageId: "missingInjectable" }],
        },
        // Only type export
        {
          code: `@injectable() class MyService {} export type { MyService };`,
          errors: [{ messageId: "missingInjectable" }],
        },
      ],
    });
  });

  it("should ban exported functions", () => {
    ruleTester.run("nestjs-like-di-for-needle-di", rule, {
      valid: [],
      invalid: [
        // Exported function declaration
        {
          code: `export function helper() {} @injectable() export class Svc {}`,
          errors: [{ messageId: "noCallable" }],
        },
        // Exported arrow function
        {
          code: `export const helper = () => {}; @injectable() export class Svc {}`,
          errors: [
            { messageId: "noModuleLevelVariable" },
            { messageId: "noCallable" },
          ],
        },
        // Re-exported function via specifier
        {
          code: `function helper() {} export { helper }; @injectable() export class Svc {}`,
          errors: [{ messageId: "noCallable" }],
        },
        // Default exported function
        {
          code: `export default function helper() {} @injectable() export class Svc {}`,
          errors: [
            { messageId: "noCallable" },
            { messageId: "missingInjectable" },
          ],
        },
      ],
    });
  });

  it("should ban module-level variables", () => {
    ruleTester.run("nestjs-like-di-for-needle-di", rule, {
      valid: [],
      invalid: [
        // let at module level
        {
          code: `let instance = null; @injectable() export class Svc {}`,
          errors: [{ messageId: "noModuleLevelVariable" }],
        },
        // const at module level
        {
          code: `const data: string[] = []; @injectable() export class Svc {}`,
          errors: [{ messageId: "noModuleLevelVariable" }],
        },
        // Multiple variables
        {
          code: `let a = 1; let b = 2; @injectable() export class Svc {}`,
          errors: [
            { messageId: "noModuleLevelVariable" },
            { messageId: "noModuleLevelVariable" },
          ],
        },
      ],
    });
  });

  it("should allow custom injectable decorators via options", () => {
    ruleTester.run("nestjs-like-di-for-needle-di", rule, {
      valid: [
        // Custom decorator: Controller
        {
          code: `@Controller() export class UserController {}`,
          options: [{ injectableDecorators: ["Controller"] }],
        },
        // Custom decorator: Injectable (PascalCase)
        {
          code: `@Injectable() export class UserService {}`,
          options: [{ injectableDecorators: ["Injectable"] }],
        },
        // Multiple custom decorators
        {
          code: `@Service() export class UserService {}`,
          options: [{ injectableDecorators: ["Controller", "Service", "Injectable"] }],
        },
        // Custom decorator without call expression
        {
          code: `@Controller export class UserController {}`,
          options: [{ injectableDecorators: ["Controller"] }],
        },
      ],
      invalid: [
        // Default decorator not in custom list
        {
          code: `@injectable() export class UserService {}`,
          options: [{ injectableDecorators: ["Controller"] }],
          errors: [{ messageId: "missingInjectable" }],
        },
        // Unrecognized decorator
        {
          code: `@Unknown() export class UserService {}`,
          options: [{ injectableDecorators: ["Controller", "Service"] }],
          errors: [{ messageId: "missingInjectable" }],
        },
      ],
    });
  });

  it("should ban class fields", () => {
    ruleTester.run("nestjs-like-di-for-needle-di", rule, {
      valid: [],
      invalid: [
        // Private field
        {
          code: `@injectable() export class Svc { private cache = new Map(); }`,
          errors: [{ messageId: "noClassField" }],
        },
        // Public field
        {
          code: `@injectable() export class Svc { data: string[] = []; }`,
          errors: [{ messageId: "noClassField" }],
        },
        // Static field
        {
          code: `@injectable() export class Svc { static count = 0; }`,
          errors: [{ messageId: "noClassField" }],
        },
        // Field alongside constructor injection (field is banned, constructor is fine)
        {
          code: `@injectable() export class Svc {
            private cache = new Map();
            constructor(private readonly repo: Repo) {}
          }`,
          errors: [{ messageId: "noClassField" }],
        },
      ],
    });
  });
});
