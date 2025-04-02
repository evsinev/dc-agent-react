import { BreadcrumbGroup } from '@cloudscape-design/components';
import React from 'react';

export default function Breadcrumbs() {
  const basePath = process.env.PUBLIC_BASE_PATH || '';

  return (
    <BreadcrumbGroup
      items={[
        {
          text: 'Home',
          href: `${basePath}/`,
        },
        {
          text: 'Apps',
          href: `${basePath}/`,
        },
      ]}
    />
  );
}
