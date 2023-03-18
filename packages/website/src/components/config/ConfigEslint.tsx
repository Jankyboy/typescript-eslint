import type { TSESLint } from '@typescript-eslint/utils';
import type { JSONSchema4 } from 'json-schema';
import React, { useCallback, useEffect, useState } from 'react';

import type { PlaygroundSystem } from '../playground/types';
import { shallowEqual } from '../util/shallowEqual';
import type { ConfigOptionsType } from './ConfigEditor';
import ConfigEditor from './ConfigEditor';
import { parseESLintRC, schemaToConfigOptions, toJson } from './utils';

export interface ConfigEslintProps {
  readonly isOpen: boolean;
  readonly onClose: (isOpen: false) => void;
  readonly system: PlaygroundSystem;
}

function readConfigSchema(system: PlaygroundSystem): ConfigOptionsType[] {
  const schemaFile = system.readFile('/schema/eslint.schema');
  if (schemaFile) {
    const schema = JSON.parse(schemaFile) as JSONSchema4;
    if (schema.type === 'object' && schema.properties?.rules?.properties) {
      return schemaToConfigOptions(
        schema.properties.rules.properties,
      ).reverse();
    }
  }

  return [];
}

function ConfigEslint({
  isOpen,
  onClose: onCloseProps,
  system,
}: ConfigEslintProps): JSX.Element {
  const [options, updateOptions] = useState<ConfigOptionsType[]>([]);
  const [configObject, updateConfigObject] = useState<TSESLint.Linter.Config>();

  useEffect(() => {
    if (isOpen) {
      updateOptions(readConfigSchema(system));
      const config = system.readFile('/.eslintrc');
      updateConfigObject(parseESLintRC(config));
    }
  }, [isOpen, system]);

  const onClose = useCallback(
    (newRules: Record<string, unknown>) => {
      if (!shallowEqual(newRules, configObject?.rules)) {
        system.writeFile(
          '/.eslintrc',
          toJson({ ...(configObject ?? {}), rules: newRules }),
        );
      }
      onCloseProps(false);
    },
    [onCloseProps, configObject, system],
  );

  return (
    <ConfigEditor
      header="Eslint Config"
      options={options}
      values={configObject?.rules ?? {}}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}

export default ConfigEslint;
