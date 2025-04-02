import { BrowserRouter, Route, Routes } from 'react-router';
import Home from '@/pages/home';
import AppList from '@/pages/app-list';
import ServiceList from '@/pages/service-list';
import ServiceView from '@/pages/service-view';
import GitRepositoryPage from '@/pages/git-repository-page';
import LogsPage from '@/pages/logs';

export default function Router() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_BASE_PATH}>
      <Routes>
        <Route path="/" Component={AppList} />
        <Route path="/apps" Component={AppList} />
        <Route path="/services">
          <Route path="" Component={ServiceList} />
          <Route path=":host/:serviceName" Component={ServiceView} />
        </Route>
        <Route path="/git">
          <Route path="" Component={GitRepositoryPage} />
        </Route>
        <Route path="/logs" Component={LogsPage} />
        <Route path="*" Component={Home} />
      </Routes>
    </BrowserRouter>
  );
}
