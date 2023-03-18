import type { JSONSchema4 } from 'json-schema';
import React, { useCallback, useEffect, useState } from 'react';

import type { PlaygroundSystem, TSConfig } from '../playground/types';
import { shallowEqual } from '../util/shallowEqual';
import type { ConfigOptionsType } from './ConfigEditor';
import ConfigEditor from './ConfigEditor';
import { parseTSConfig, schemaToConfigOptions, toJson } from './utils';

export interface ConfigTypeScriptProps {
  readonly isOpen: boolean;
  readonly onClose: (isOpen: false) => void;
  readonly system: PlaygroundSystem;
}

function readConfigSchema(system: PlaygroundSystem): ConfigOptionsType[] {
  const schemaFile = system.readFile('/schema/tsconfig.schema');
  if (schemaFile) {
    const schema = JSON.parse(schemaFile) as JSONSchema4;
    if (
      schema.type === 'object' &&
      schema.properties?.compilerOptions?.properties
    ) {
      return schemaToConfigOptions(
        schema.properties.compilerOptions.properties,
      );
    }
  }
  return [];
}

function ConfigTypeScript({
  onClose: onCloseProps,
  isOpen,
  system,
}: ConfigTypeScriptProps): JSX.Element {
  const [tsConfigOptions, updateOptions] = useState<ConfigOptionsType[]>([]);
  const [configObject, updateConfigObject] = useState<TSConfig>();

  useEffect(() => {
    if (isOpen) {
      updateOptions(readConfigSchema(system));
      const config = system.readFile('/tsconfig.json');
      updateConfigObject(parseTSConfig(config));
    }
  }, [isOpen, system]);

  const onClose = useCallback(
    (newConfig: Record<string, unknown>) => {
      const cfg = { ...newConfig };
      if (!shallowEqual(cfg, configObject?.compilerOptions)) {
        system.writeFile(
          '/tsconfig.json',
          toJson({ ...(configObject ?? {}), compilerOptions: cfg }),
        );
      }
      onCloseProps(false);
    },
    [onCloseProps, configObject, system],
  );

  return (
    <ConfigEditor
      header="TypeScript Config"
      options={tsConfigOptions}
      values={configObject?.compilerOptions ?? {}}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}

export default ConfigTypeScript;
