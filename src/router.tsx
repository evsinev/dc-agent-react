import * as process from 'process';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '@/pages/home';
import Example from '@/pages/example';
import AppList from '@/pages/app-list';
import AppView from '@/pages/app-view';
import ServiceList from '@/pages/service-list';
import ServiceView from '@/pages/service-view';
import GitRepositoryPage from '@/pages/git-repository-page';

export default function Router() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_BASE_PATH}>
      <Routes>
        <Route path="/" Component={AppList} />
        <Route path="/apps">
          <Route path="" Component={AppList} />
          <Route path=":appName" Component={AppView} />
        </Route>
        <Route path="/services">
          <Route path="" Component={ServiceList} />
          <Route path=":host/:serviceName" Component={ServiceView} />
        </Route>
        <Route path="/git">
          <Route path="" Component={GitRepositoryPage} />
        </Route>
        <Route path="*" Component={Home} />
      </Routes>
    </BrowserRouter>
  );
}
