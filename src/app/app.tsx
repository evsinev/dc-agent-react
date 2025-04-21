import '@cloudscape-design/global-styles/index.css';
import GlobalStyles from '@/app/components/global-styles';
import ErrorProvider from '@/components/error';
import { useSplitPanel } from '@/hooks/use-split-panel';
import { AppLayout } from '@cloudscape-design/components';
import { I18nProvider } from '@cloudscape-design/components/i18n';
import messages from '@cloudscape-design/components/i18n/messages/all.en';
import { BrowserRouter } from 'react-router';
import Breadcrumbs from './components/breadcrumbs';
import Navigation from './components/navigation';
import SplitPanelWrapper from './components/split-panel';
import Router from './router';

const LOCALE = 'en';

export default function App() {
  const hide = useSplitPanel((state) => state.hide);

  return (
    <ErrorProvider>
      <GlobalStyles />
      <I18nProvider
        locale={LOCALE}
        messages={[messages]}
      >
        <BrowserRouter basename={process.env.PUBLIC_BASE_PATH}>
          <AppLayout
            breadcrumbs={<Breadcrumbs />}
            navigation={<Navigation />}
            content={<Router />}
            splitPanel={<SplitPanelWrapper />}
            splitPanelOpen
            onSplitPanelToggle={hide}
          />
        </BrowserRouter>
      </I18nProvider>
    </ErrorProvider>
  );
}
