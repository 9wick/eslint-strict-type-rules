import { describe, expectTypeOf, it } from "vitest";
import type { ConfigWithExtends } from "typescript-eslint";
import plugin from "../../src/index.js";

describe("type: plugin configs are compatible with tseslint.config()", () => {
  it("base config elements should be assignable to ConfigWithExtends", () => {
    expectTypeOf(plugin.configs.base[0]).toMatchTypeOf<ConfigWithExtends>();
  });

  it("recommended config elements should be assignable to ConfigWithExtends", () => {
    expectTypeOf(
      plugin.configs.recommended[0],
    ).toMatchTypeOf<ConfigWithExtends>();
  });

  it("react config elements should be assignable to ConfigWithExtends", () => {
    expectTypeOf(plugin.configs.react[0]).toMatchTypeOf<ConfigWithExtends>();
  });

  it("test config elements should be assignable to ConfigWithExtends", () => {
    expectTypeOf(plugin.configs.test[0]).toMatchTypeOf<ConfigWithExtends>();
  });

  it("barrel config elements should be assignable to ConfigWithExtends", () => {
    expectTypeOf(plugin.configs.barrel[0]).toMatchTypeOf<ConfigWithExtends>();
  });
});
