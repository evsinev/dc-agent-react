import { SideNavigation } from '@cloudscape-design/components';
import { SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import routing from '@routing';
import { matchPath, useLocation, useNavigate } from 'react-router';

function toHref(aRouterLink: string) {
  return process.env.PUBLIC_BASE_PATH + aRouterLink;
}

export const navigationItems = [
  {
    type: 'link',
    text: 'Applications',
    href: toHref(routing.apps),
  },
  {
    type: 'link',
    text: 'Agents',
    href: toHref(routing.agents),
  },
  {
    type: 'link',
    text: 'Services',
    href: toHref(routing.services),
  },
  {
    type: 'link',
    text: 'Commands',
    href: toHref(routing.commands),
  },
  {
    type: 'link',
    text: 'Git repo',
    href: toHref(routing.git),
  },
  {
    type: 'link',
    text: 'Logs',
    href: toHref(routing.logs),
  },
] as ReadonlyArray<SideNavigationProps.Link>;

// Map the current (basename-relative) path to the routing path of its nav section, so detail
// pages — including ones reached through in-page links or opened directly by URL — keep the
// correct top-level item highlighted.
function activeSection(pathname: string): string | undefined {
  if (matchPath(routing.app, pathname) || matchPath(routing.apps, pathname)) {
    return routing.apps;
  }
  if (matchPath(routing.agent, pathname) || matchPath(routing.agents, pathname)) {
    return routing.agents;
  }
  if (matchPath(routing.service, pathname) || matchPath(routing.services, pathname)) {
    return routing.services;
  }
  if (
    matchPath(routing.command, pathname) ||
    matchPath(routing.commands, pathname) ||
    matchPath(routing.commandCreate, pathname) ||
    matchPath(routing.commandEdit, pathname)
  ) {
    return routing.commands;
  }
  if (matchPath(routing.git, pathname)) {
    return routing.git;
  }
  if (matchPath(routing.logs, pathname)) {
    return routing.logs;
  }
  return undefined;
}

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const section = activeSection(location.pathname);
  const activeHref = section ? toHref(section) : '';

  function onFollow(event: CustomEvent<SideNavigationProps.FollowDetail>) {
    event.preventDefault();
    const { href } = event.detail;
    if (href.startsWith('http')) {
      window.location.href = href;
      return;
    }
    navigate(href.replace(process.env.PUBLIC_BASE_PATH || '', ''));
  }

  return (
    <SideNavigation
      header={{
        href: routing.apps,
        text: 'dc-operator',
      }}
      activeHref={activeHref}
      onFollow={onFollow}
      items={navigationItems}
    />
  );
}
