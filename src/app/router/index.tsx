import AppList from '@/pages/app-list';
import Git from '@/pages/git';
import LogsPage from '@/pages/logs';
import NotFound from '@/pages/not-found';
import ServiceList from '@/pages/service-list';
import ServiceView from '@/pages/service-view';
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
        path={routing.services}
        Component={ServiceList}
      />
      <Route
        path={routing.service}
        Component={ServiceView}
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
