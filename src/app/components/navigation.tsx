import { SideNavigation } from '@cloudscape-design/components';
import { SideNavigationProps } from '@cloudscape-design/components/side-navigation/interfaces';
import routing from '@routing';
import { useLocation, useNavigate } from 'react-router';

export const navigationItems = [
  {
    type: 'link',
    text: 'App list',
    href: routing.apps,
  },
  {
    type: 'link',
    text: 'Service list',
    href: routing.services,
  },
  {
    type: 'link',
    text: 'Git repo',
    href: routing.git,
  },
  {
    type: 'link',
    text: 'Logs',
    href: routing.logs,
  },
] as ReadonlyArray<SideNavigationProps.Link>;

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SideNavigation
      header={{
        href: routing.apps,
        text: 'dc-operator',
      }}
      activeHref={location.pathname}
      onFollow={(event) => {
        event.preventDefault();
        navigate(event.detail.href);
      }}
      items={navigationItems}
    />
  );
}
