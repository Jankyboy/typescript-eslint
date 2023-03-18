import { toJson } from '../config/utils';
import versions from './packageVersions.json';
import type { ConfigModel } from './types';

export const defaultConfig: ConfigModel = {
  ts: process.env.TS_VERSION!,
  sourceType: 'module',
  fileType: 'ts',
  showAST: false,
  tsconfig: toJson({
    compilerOptions: {
      strictNullChecks: true,
    },
    parserOptions: {
      sourceType: 'module',
    },
  }),
  eslintrc: toJson({
    rules: {},
  }),
  code: `\n`,
};

export const tsVersions: string[] = [...versions.typescript];

if (!tsVersions.includes(process.env.TS_VERSION!)) {
  tsVersions.unshift(process.env.TS_VERSION!);
}

// export const esTsVersions: string[] = ['latest', ...versions.eslintPlugin];

export const detailTabs = [
  { value: false as const, label: 'Errors' },
  { value: 'es' as const, label: 'ESTree' },
  { value: 'ts' as const, label: 'TypeScript' },
  { value: 'scope' as const, label: 'Scope' },
  { value: 'types' as const, label: 'Types' },
];

export const fileTypes = [
  'ts',
  'tsx',
  'js',
  'jsx',
  'd.ts',
  'cjs',
  'mjs',
  'cts',
  'mts',
] as const;
