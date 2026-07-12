import AppList from '@/pages/app-list';
import AppView from '@/pages/app-view';
import CommandList from '@/pages/command-list';
import CommandView from '@/pages/command-view';
import DcAgentList from '@/pages/dc-agent-list';
import DcAgentView from '@/pages/dc-agent-view';
import Git from '@/pages/git';
import LogsPage from '@/pages/logs';
import NotFound from '@/pages/not-found';
import ServiceList from '@/pages/service-list';
import ServiceViewPage from '@/pages/service-view';
import TestPage from '@/pages/test';
import routing from '@routing';
import { Route, Routes } from 'react-router';

export default function Router() {
  return (
    <Routes>
      <Route
        path={routing.apps}
        Component={AppList}
      />
      <Route
        path={routing.app}
        element={<AppView showAppInfo={true} />}
      />
      <Route
        path={routing.services}
        Component={ServiceList}
      />
      <Route
        path={routing.service}
        Component={ServiceViewPage}
      />
      <Route
        path={routing.git}
        Component={Git}
      />
      <Route
        path={routing.logs}
        Component={LogsPage}
      />
      <Route
        path={routing.test}
        Component={TestPage}
      />
      <Route
        path={routing.agents}
        Component={DcAgentList}
      />
      <Route
        path={routing.agent}
        Component={DcAgentView}
      />
      <Route
        path={routing.commands}
        Component={CommandList}
      />
      <Route
        path={routing.command}
        Component={CommandView}
      />
      <Route
        path="*"
        Component={NotFound}
      />
    </Routes>
  );
}
