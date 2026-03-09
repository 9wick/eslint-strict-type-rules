import noAngleAssertion from "./no-angle-assertion.js";
import noAsAssertion from "./no-as-assertion.js";
import noCrossDirectoryLibImport from "./no-cross-directory-lib-import.js";
import noEmptySelectValue from "./no-empty-select-value.js";
import noExportedCallable from "./no-exported-callable.js";
import noInOperator from "./no-in-operator.js";
import noNestedAndThen from "./no-nested-and-then.js";
import noObjectHasOwn from "./no-object-has-own.js";
import noProcessAccess from "./no-process-access.js";
import noPromiseReject from "./no-promise-reject.js";
import noPromiseResult from "./no-promise-result.js";
import noThrow from "./no-throw.js";
import noTryCatch from "./no-try-catch.js";
import noUnsafeUnwrap from "./no-unsafe-unwrap.js";
import noVitestResolveAlias from "./no-vitest-resolve-alias.js";
import requireInjectableClass from "./require-injectable-class.js";

export const rules = {
  "no-angle-assertion": noAngleAssertion,
  "no-as-assertion": noAsAssertion,
  "no-cross-directory-lib-import": noCrossDirectoryLibImport,
  "no-empty-select-value": noEmptySelectValue,
  "no-exported-callable": noExportedCallable,
  "no-in-operator": noInOperator,
  "no-nested-and-then": noNestedAndThen,
  "no-object-has-own": noObjectHasOwn,
  "no-process-access": noProcessAccess,
  "no-promise-reject": noPromiseReject,
  "no-promise-result": noPromiseResult,
  "no-throw": noThrow,
  "no-try-catch": noTryCatch,
  "no-unsafe-unwrap": noUnsafeUnwrap,
  "no-vitest-resolve-alias": noVitestResolveAlias,
  "require-injectable-class": requireInjectableClass,
};
