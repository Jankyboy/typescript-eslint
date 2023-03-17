define(['exports', 'vs/language/typescript/tsWorker'], function (e, _t) {
  const eslintPlugin = require('@typescript-eslint/eslint-plugin');

  e.Linter = require('eslint').Linter;
  e.analyze = require('@typescript-eslint/scope-manager/dist/analyze').analyze;
  e.visitorKeys =
    require('@typescript-eslint/visitor-keys/dist/visitor-keys').visitorKeys;
  e.astConverter =
    require('@typescript-eslint/typescript-estree/dist/ast-converter').astConverter;
  e.esquery = require('esquery');
  e.rules = eslintPlugin.rules;

  const rules = {};

  const eslintConfigs = require('@eslint/js').configs;

  for (const [key, value] of Object.entries(eslintConfigs)) {
    rules[`eslint:${key}`] = value;
  }
  for (const [key, value] of Object.entries(eslintPlugin.configs)) {
    rules[`plugin:@typescript-eslint/${key}`] = value;
  }

  console.log(e.configs);

  e.configs = rules;
});
