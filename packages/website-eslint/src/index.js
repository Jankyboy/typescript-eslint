define(['exports', 'vs/language/typescript/tsWorker'], function (e, _t) {
  const eslintPlugin = require('@typescript-eslint/eslint-plugin');

  e.Linter = require('eslint').Linter;
  e.analyze = require('@typescript-eslint/scope-manager/dist/analyze').analyze;
  e.visitorKeys =
    require('@typescript-eslint/visitor-keys/dist/visitor-keys').visitorKeys;
  e.astConverter =
    require('@typescript-eslint/typescript-estree/dist/ast-converter').astConverter;
  e.esquery = require('esquery');
  e.configs = eslintPlugin.configs;
  e.rules = eslintPlugin.rules;
});
