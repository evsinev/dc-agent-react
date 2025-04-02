import { SideNavigation } from '@cloudscape-design/components';
import React from 'react';

export default function Navigation() {
  const basePath = process.env.PUBLIC_BASE_PATH || '';

  return (
    <SideNavigation
      header={{
        href: basePath,
        text: 'dc-operator',
      }}
      items={[
        {
          type: 'link',
          text: 'App list',
          href: basePath,
        },
        {
          type: 'link',
          text: 'Service list',
          href: `${basePath}/services`,
        },
        {
          type: 'link',
          text: 'Git repo',
          href: `${basePath}/git`,
        },
        {
          type: 'link',
          text: 'Logs',
          href: `${basePath}/logs`,
        },
      ]}
    />
  );
}
