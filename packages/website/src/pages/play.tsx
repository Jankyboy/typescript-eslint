import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import React, { lazy, Suspense } from 'react';

import Loader from '../components/layout/Loader';

function Play(): JSX.Element {
  return (
    <Layout title="Playground" description="Playground" noFooter={true}>
      <BrowserOnly fallback={<Loader />}>
        {(): JSX.Element => {
          const Playground = lazy(
            () =>
              // @ts-expect-error: This does not follow Node resolution
              import('../components/playground/PlaygroundRoot') as Promise<
                () => JSX.Element
              >,
          );
          return (
            <Suspense fallback={<Loader />}>
              <Playground />
            </Suspense>
          );
        }}
      </BrowserOnly>
    </Layout>
  );
}

export default Play;
