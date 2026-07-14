import { BreadcrumbGroup } from '@cloudscape-design/components';
import routing from '@routing';
import { matchPath, useLocation, useNavigate } from 'react-router';

type Crumb = { text: string; href: string };

const HOME: Crumb = { text: 'dc-operator', href: routing.apps };

// Build the trail (Home → section → entity) from the current route. All hrefs are
// basename-relative, matching location.pathname and navigate().
function buildItems(pathname: string): Crumb[] {
  const app = matchPath(routing.app, pathname);
  if (app) {
    return [HOME, { text: 'Applications', href: routing.apps }, { text: app.params.appName ?? '', href: pathname }];
  }

  const agent = matchPath(routing.agent, pathname);
  if (agent) {
    return [HOME, { text: 'Agents', href: routing.agents }, { text: agent.params.name ?? '', href: pathname }];
  }
  if (matchPath(routing.agents, pathname)) {
    return [HOME, { text: 'Agents', href: routing.agents }];
  }

  const service = matchPath(routing.service, pathname);
  if (service) {
    return [
      HOME,
      { text: 'Services', href: routing.services },
      { text: `${service.params.host}/${service.params.serviceName}`, href: pathname },
    ];
  }
  if (matchPath(routing.services, pathname)) {
    return [HOME, { text: 'Services', href: routing.services }];
  }

  if (matchPath(routing.commandCreate, pathname)) {
    return [HOME, { text: 'Commands', href: routing.commands }, { text: 'Create command', href: pathname }];
  }
  const commandEdit = matchPath(routing.commandEdit, pathname);
  if (commandEdit) {
    const detailsHref = routing.command
      .replace(':host', commandEdit.params.host ?? '')
      .replace(':name', commandEdit.params.name ?? '');
    return [
      HOME,
      { text: 'Commands', href: routing.commands },
      { text: commandEdit.params.name ?? '', href: detailsHref },
      { text: 'Edit', href: pathname },
    ];
  }
  const command = matchPath(routing.command, pathname);
  if (command) {
    return [
      HOME,
      { text: 'Commands', href: routing.commands },
      { text: command.params.name ?? `${command.params.host}/${command.params.name}`, href: pathname },
    ];
  }
  if (matchPath(routing.commands, pathname)) {
    return [HOME, { text: 'Commands', href: routing.commands }];
  }
  if (matchPath(routing.git, pathname)) {
    return [HOME, { text: 'Git repo', href: routing.git }];
  }
  if (matchPath(routing.logs, pathname)) {
    return [HOME, { text: 'Logs', href: routing.logs }];
  }
  if (matchPath(routing.test, pathname)) {
    return [HOME, { text: 'Test', href: routing.test }];
  }

  // routing.apps ('/') is Applications, which doubles as Home — show it as a section too.
  if (matchPath(routing.apps, pathname)) {
    return [HOME, { text: 'Applications', href: routing.apps }];
  }

  return [HOME];
}

export default function Breadcrumbs() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <BreadcrumbGroup
      items={buildItems(location.pathname)}
      onFollow={(event) => {
        event.preventDefault();
        navigate(event.detail.href);
      }}
    />
  );
}
