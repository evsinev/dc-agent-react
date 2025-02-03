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
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider locale={LOCALE} messages={[messages]}>
        <AppLayout
          breadcrumbs={(
            <BreadcrumbGroup
              items={[
                {
                  text: 'Home',
                  href: process.env.PUBLIC_BASE_PATH,
                },
                {
                  text: 'Apps',
                  href: process.env.PUBLIC_BASE_PATH,
                },
              ]}
            />
          )}
          navigation={(
            <SideNavigation
              header={{
                href: process.env.PUBLIC_BASE_PATH,
                text: 'dc-operator',
              }}
              items={[
                {
                  type: 'link',
                  text: 'App list',
                  href: process.env.PUBLIC_BASE_PATH,
                },
                {
                  type: 'link',
                  text: 'Service list',
                  href: `${process.env.PUBLIC_BASE_PATH}/services`,
                },
                {
                  type: 'link',
                  text: 'Git repo',
                  href: `${process.env.PUBLIC_BASE_PATH}/git`,
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
