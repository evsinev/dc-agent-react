import '@cloudscape-design/global-styles/index.css';
import React from 'react';
import { AppLayout } from '@cloudscape-design/components';
import { I18nProvider } from '@cloudscape-design/components/i18n';
import messages from '@cloudscape-design/components/i18n/messages/all.en';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSplitPanel } from '@/hooks/use-split-panel';
import Navigation from './components/navigation';
import Breadcrumbs from './components/breadcrumbs';
import SplitPanelWrapper from './components/split-panel';
import Router from './router';

const LOCALE = 'en';

const queryClient = new QueryClient();

export default function App() {
  const hide = useSplitPanel((state) => state.hide);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider locale={LOCALE} messages={[messages]}>
        <AppLayout
          breadcrumbs={<Breadcrumbs />}
          navigation={<Navigation />}
          content={<Router />}
          splitPanel={<SplitPanelWrapper />}
          splitPanelOpen
          onSplitPanelToggle={hide}
        />
      </I18nProvider>
    </QueryClientProvider>
  );
}
