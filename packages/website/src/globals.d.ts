import type esquery from 'esquery';
import type * as TSType from 'typescript';

declare module 'monaco-editor/esm/vs/editor/editor.api' {
  namespace languages.typescript {
    export interface TypeScriptWorker {
      /**
       * https://github.com/microsoft/TypeScript-Website/blob/246798df5013036bd9b4389932b642c20ab35deb/packages/playground-worker/types.d.ts#L48
       */
      getLibFiles(): Promise<Record<string, string>>;
    }
  }
}

declare global {
  type WindowRequireCb = (...arg: unknown[]) => void;
  interface WindowRequire {
    (files: string[], cb: WindowRequireCb): void;
    config: (arg: {
      paths?: Record<string, string>;
      ignoreDuplicateModules?: string[];
    }) => void;
  }

  interface Window {
    ts: typeof TSType;
    require: WindowRequire;
    esquery: typeof esquery;
  }
}

declare module 'typescript' {
  interface OptionDeclarations {
    name: string;
    type?: unknown;
    category?: { message: string };
    description?: { message: string };
    element?: {
      type: unknown;
    };

    isCommandLineOnly?: boolean;
    affectsEmit?: true;
    affectsModuleResolution?: true;
    affectsSourceFile?: true;
    transpileOptionValue?: true;
  }

  const optionDeclarations: OptionDeclarations[];
}
