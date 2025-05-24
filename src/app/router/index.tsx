import AppList from '@/pages/app-list';
import AppView from '@/pages/app-view';
import Git from '@/pages/git';
import LogsPage from '@/pages/logs';
import NotFound from '@/pages/not-found';
import ServiceList from '@/pages/service-list';
import ServiceViewPage from '@/pages/service-view';
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
        path="*"
        Component={NotFound}
      />
    </Routes>
  );
}
