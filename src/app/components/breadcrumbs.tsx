import { navigationItems } from '@/app/components/navigation';
import { BreadcrumbGroup } from '@cloudscape-design/components';
import routing from '@routing';
import { useLocation, useNavigate } from 'react-router';

export default function Breadcrumbs() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      text: 'Home',
      href: routing.apps,
    },
  ];

  const currentCrumb = navigationItems.find((item) => item.href === location.pathname);
  if (currentCrumb) {
    items.push(currentCrumb);
  }

  return (
    <BreadcrumbGroup
      onFollow={(event) => {
        event.preventDefault();
        navigate(event.detail.href);
      }}
      items={items}
    />
  );
}
