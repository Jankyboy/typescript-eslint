import type { EslintUtilsModule } from '@typescript-eslint/website-eslint';

export function loadUtils(): Promise<EslintUtilsModule> {
  return new Promise(resolve => {
    window.require(
      [
        'vs/language/typescript/tsWorker',
        document.location.origin + '/sandbox/index.js',
      ],
      function (_, utils) {
        resolve(utils as EslintUtilsModule);
      },
    );
  });
}
