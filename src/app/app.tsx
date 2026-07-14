import '@cloudscape-design/global-styles/index.css';
import GlobalStyles from '@/app/components/global-styles';
import ErrorProvider from '@/components/error';
import { useHelpPanel } from '@/hooks/use-help-panel';
import { useSplitPanel } from '@/hooks/use-split-panel';
import { AppLayoutToolbar } from '@cloudscape-design/components';
import { I18nProvider } from '@cloudscape-design/components/i18n';
import messages from '@cloudscape-design/components/i18n/messages/all.en';
import routing from '@routing';
import { BrowserRouter, useLocation } from 'react-router';
import Breadcrumbs from './components/breadcrumbs';
import HelpPanelWrapper from './components/help-panel';
import Navigation from './components/navigation';
import Notifications from './components/notifications';
import SplitPanelWrapper from './components/split-panel';
import Router from './router';

const LOCALE = 'en';

// Routes whose content is a single full-page table; these get contentType="table"
// so the table spans the full content width and its sticky header aligns correctly.
const FULL_PAGE_ROUTES: string[] = [routing.apps, routing.services, routing.commands, routing.agents];

function AppShell() {
  const hideSplitPanel = useSplitPanel((state) => state.hide);
  const helpPanel = useHelpPanel((state) => state.panel);
  const hideHelpPanel = useHelpPanel((state) => state.hide);
  const { pathname } = useLocation();
  const contentType = FULL_PAGE_ROUTES.includes(pathname) ? 'table' : 'default';

  return (
    <AppLayoutToolbar
      contentType={contentType}
      breadcrumbs={<Breadcrumbs />}
      navigation={<Navigation />}
      notifications={<Notifications />}
      content={<Router />}
      splitPanel={<SplitPanelWrapper />}
      splitPanelOpen
      onSplitPanelToggle={hideSplitPanel}
      tools={<HelpPanelWrapper />}
      toolsOpen={!!helpPanel}
      onToolsChange={({ detail }) => {
        if (!detail.open) {
          hideHelpPanel();
        }
      }}
    />
  );
}

export default function App() {
  return (
    <ErrorProvider>
      <GlobalStyles />
      <I18nProvider
        locale={LOCALE}
        messages={[messages]}
      >
        <BrowserRouter basename={process.env.PUBLIC_BASE_PATH}>
          <AppShell />
        </BrowserRouter>
      </I18nProvider>
    </ErrorProvider>
  );
}
