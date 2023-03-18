import {
  NavbarSecondaryMenuFiller,
  useWindowSize,
} from '@docusaurus/theme-common';
import CopyIcon from '@site/src/icons/copy.svg';
import IconExternalLink from '@theme/Icon/ExternalLink';
import React, { useCallback } from 'react';

import { useDebouncedToggle } from '../../hooks/useDebouncedToggle';
import Checkbox from '../inputs/Checkbox';
import Dropdown from '../inputs/Dropdown';
import Tooltip from '../inputs/Tooltip';
import ActionLabel from '../layout/ActionLabel';
import Expander from '../layout/Expander';
import InputLabel from '../layout/InputLabel';
import { fileTypes, tsVersions } from './config';
import { createMarkdown, createMarkdownParams } from './lib/markdown';
import styles from './playground.module.css';
import type { ConfigModel } from './types';

interface OptionsSelectorParams {
  readonly config: ConfigModel;
  readonly enableScrolling: boolean;
  readonly setEnableScrolling: (checked: boolean) => void;
  readonly setConfig: (cfg: Partial<ConfigModel>) => void;
}

function OptionsSelectorContent({
  config,
  setConfig,
  enableScrolling,
  setEnableScrolling,
}: OptionsSelectorParams): JSX.Element {
  const [copyLink, setCopyLink] = useDebouncedToggle<boolean>(false);
  const [copyMarkdown, setCopyMarkdown] = useDebouncedToggle<boolean>(false);
  const windowSize = useWindowSize();

  const copyLinkToClipboard = useCallback(() => {
    void navigator.clipboard
      .writeText(document.location.toString())
      .then(() => {
        setCopyLink(true);
      });
  }, [setCopyLink]);

  const copyMarkdownToClipboard = useCallback(() => {
    void navigator.clipboard.writeText(createMarkdown(config)).then(() => {
      setCopyMarkdown(true);
    });
  }, [setCopyMarkdown, config]);

  const openIssue = useCallback((): void => {
    const params = createMarkdownParams(config);

    window
      .open(
        `https://github.com/typescript-eslint/typescript-eslint/issues/new?${params}`,
        '_blank',
      )
      ?.focus();
  }, [config]);

  return (
    <>
      <Expander label="Info">
        <InputLabel name="TypeScript">
          <Dropdown
            name="ts-version"
            options={tsVersions}
            value={config.ts}
            onChange={(ts): void => setConfig({ ts })}
          />
        </InputLabel>
        <InputLabel name="Eslint">{process.env.ESLINT_VERSION}</InputLabel>
        <InputLabel name="TSEslint">{process.env.TS_ESLINT_VERSION}</InputLabel>
      </Expander>
      <Expander label="Options">
        <InputLabel name="Source type">
          <Dropdown
            name="sourceType"
            value={config.sourceType ?? 'module'}
            onChange={(sourceType): void => setConfig({ sourceType })}
            options={['script', 'module']}
          />
        </InputLabel>
        <InputLabel name="File type">
          <Dropdown
            name="fileType"
            value={config.fileType ?? 'ts'}
            onChange={(fileType): void => setConfig({ fileType })}
            options={fileTypes}
          />
        </InputLabel>
        <InputLabel name="Auto scroll">
          <Checkbox
            name="enableScrolling"
            value=""
            checked={enableScrolling}
            onChange={setEnableScrolling}
          />
        </InputLabel>
      </Expander>
      <Expander label="Actions">
        <ActionLabel name="Copy link" onClick={copyLinkToClipboard}>
          <Tooltip open={copyLink} text="Copied">
            <CopyIcon width="13.5" height="13.5" />
          </Tooltip>
        </ActionLabel>
        <ActionLabel name="Copy Markdown" onClick={copyMarkdownToClipboard}>
          <Tooltip open={copyMarkdown} text="Copied">
            <CopyIcon width="13.5" height="13.5" />
          </Tooltip>
        </ActionLabel>
        <ActionLabel name="Report as Issue" onClick={openIssue}>
          <IconExternalLink width="13.5" height="13.5" />
        </ActionLabel>
      </Expander>
      {windowSize !== 'mobile' && (
        <Expander label="Debug">
          <InputLabel name="vfs instance">
            <code>window.system</code>
          </InputLabel>
          <InputLabel name="monaco instance">
            <code>window.monaco</code>
          </InputLabel>
          <InputLabel name="typescript">
            <code>window.ts</code>
          </InputLabel>
          <InputLabel name="esquery">
            <code>window.esquery</code>
          </InputLabel>
        </Expander>
      )}
    </>
  );
}

function OptionsSelector(props: OptionsSelectorParams): JSX.Element {
  const windowSize = useWindowSize();
  if (windowSize === 'mobile') {
    return (
      <NavbarSecondaryMenuFiller
        component={OptionsSelectorContent}
        props={props}
      />
    );
  }

  return (
    <div className={styles.playgroundMenu}>
      <OptionsSelectorContent {...props} />
    </div>
  );
}

export default OptionsSelector;
