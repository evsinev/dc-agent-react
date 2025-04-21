import AppList from '@/pages/app-list';
import GitRepositoryPage from '@/pages/git-repository-page';
import Home from '@/pages/home';
import LogsPage from '@/pages/logs';
import ServiceList from '@/pages/service-list';
import ServiceView from '@/pages/service-view';
import { Route, Routes } from 'react-router';

export default function Router() {
  return (
    <Routes>
      <Route
        path="/"
        Component={AppList}
      />
      <Route
        path="/apps"
        Component={AppList}
      />
      <Route path="/services">
        <Route
          path=""
          Component={ServiceList}
        />
        <Route
          path=":host/:serviceName"
          Component={ServiceView}
        />
      </Route>
      <Route path="/git">
        <Route
          path=""
          Component={GitRepositoryPage}
        />
      </Route>
      <Route
        path="/logs"
        Component={LogsPage}
      />
      <Route
        path="*"
        Component={Home}
      />
    </Routes>
  );
}
