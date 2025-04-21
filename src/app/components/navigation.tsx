import { SideNavigation } from '@cloudscape-design/components';
import { useNavigate } from 'react-router';

export default function Navigation() {
  const navigate = useNavigate();

  return (
    <SideNavigation
      header={{
        href: '/',
        text: 'dc-operator',
      }}
      onFollow={(event) => {
        event.preventDefault();
        navigate(event.detail.href);
      }}
      items={[
        {
          type: 'link',
          text: 'App list',
          href: '/',
        },
        {
          type: 'link',
          text: 'Service list',
          href: '/services',
        },
        {
          type: 'link',
          text: 'Git repo',
          href: '/git',
        },
        {
          type: 'link',
          text: 'Logs',
          href: '/logs',
        },
      ]}
    />
  );
}
