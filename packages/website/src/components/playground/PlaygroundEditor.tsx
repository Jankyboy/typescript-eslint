import { loader } from '@monaco-editor/react';
import { loadUtils } from '@site/src/components/playground/importUtils';
import type { EslintUtilsModule } from '@typescript-eslint/website-eslint';
import type * as Monaco from 'monaco-editor';
import React, { useEffect, useRef, useState } from 'react';

import Loader from '../layout/Loader';
import type { UpdateModel } from '../linter/types';
import PlaygroundLoaded from './PlaygroundLoaded';
import type { ErrorGroup, PlaygroundSystem } from './types';

export interface PlaygroundProps {
  readonly activeFile: string;
  readonly tsVersion: string;
  readonly system: PlaygroundSystem;
  readonly onValidate: (markers: ErrorGroup[]) => void;
  readonly onUpdate: (model: UpdateModel) => void;
  readonly onCursorChange: (offset: number) => void;
  readonly selectedRange?: [number, number];
}

function PlaygroundEditor(props: PlaygroundProps): JSX.Element {
  const [isLoading, setLoading] = useState<boolean>(true);
  const monaco = useRef<typeof Monaco>();
  const utils = useRef<EslintUtilsModule>();

  useEffect(() => {
    loader.config({
      paths: {
        vs: `https://typescript.azureedge.net/cdn/${props.tsVersion}/monaco/min/vs`,
      },
    });

    // This has to be executed in proper order
    loader
      .init()
      .then((instance: typeof Monaco) => {
        monaco.current = instance;
        return loadUtils();
      })
      .then(instance => {
        utils.current = instance;
        setLoading(false);
      })
      .catch(e => {
        // eslint-disable-next-line no-console
        console.log('Unable to initialize editor', e);
      });
    // this can't be reactive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading || !monaco.current || !utils.current) {
    return <Loader />;
  }

  return (
    <PlaygroundLoaded
      monaco={monaco.current}
      utils={utils.current}
      {...props}
    />
  );
}

export default PlaygroundEditor;
