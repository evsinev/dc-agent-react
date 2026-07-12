import { SideNavigation } from '@cloudscape-design/components';
import { SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import routing from '@routing';
import { useNavigate } from 'react-router';
import { useState } from 'react';

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

const getActiveHref = () => {
  const basePath = process.env.PUBLIC_BASE_PATH || '';

  if (window.location.pathname === basePath) {
    return `${basePath}/`;
  }

  return window.location.pathname;
};

export default function Navigation() {
  const navigate = useNavigate();
  const [activeHref, setActiveHref] = useState(getActiveHref());

  function onFollow(event: CustomEvent<SideNavigationProps.FollowDetail>) {
    event.preventDefault();
    const { href } = event.detail;
    if (href.startsWith('http')) {
      window.location.href = href;
    }
    setActiveHref(href);
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
