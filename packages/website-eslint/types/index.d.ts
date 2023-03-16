import type { TSESLint } from '@typescript-eslint/utils';

import type { analyze } from '@typescript-eslint/scope-manager/dist/analyze';
import type { astConverter } from '@typescript-eslint/typescript-estree/dist/ast-converter';
import type esquery from 'esquery';
import type { configs, rules } from '@typescript-eslint/eslint-plugin';

export interface EslintUtilsModule {
  Linter: typeof TSESLint.Linter;
  analyze: typeof analyze;
  visitorKeys: TSESLint.SourceCode.VisitorKeys;
  astConverter: typeof astConverter;
  rules: typeof rules;
  configs: typeof configs;
  esquery: typeof esquery;
}
