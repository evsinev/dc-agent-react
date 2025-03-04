import '@cloudscape-design/global-styles/index.css';
import React from 'react';
import { AppLayout, BreadcrumbGroup, SideNavigation } from '@cloudscape-design/components';
import { I18nProvider } from '@cloudscape-design/components/i18n';
import messages from '@cloudscape-design/components/i18n/messages/all.en';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Router from './router';

const LOCALE = 'en';

const queryClient = new QueryClient();

export default function App() {
  const basePath = process.env.PUBLIC_BASE_PATH || '';

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider locale={LOCALE} messages={[messages]}>
        <AppLayout
          breadcrumbs={(
            <BreadcrumbGroup
              items={[
                {
                  text: 'Home',
                  href: `${basePath}/`,
                },
                {
                  text: 'Apps',
                  href: `${basePath}/`,
                },
              ]}
            />
          )}
          navigation={(
            <SideNavigation
              header={{
                href: basePath,
                text: 'dc-operator',
              }}
              items={[
                {
                  type: 'link',
                  text: 'App list',
                  href: basePath,
                },
                {
                  type: 'link',
                  text: 'Service list',
                  href: `${basePath}/services`,
                },
                {
                  type: 'link',
                  text: 'Git repo',
                  href: `${basePath}/git`,
                },
                {
                  type: 'link',
                  text: 'Logs',
                  href: `${basePath}/logs`,
                },
              ]}
            />
          )}
          content={(
            <Router />
          )}
        />
      </I18nProvider>
    </QueryClientProvider>
  );
}
