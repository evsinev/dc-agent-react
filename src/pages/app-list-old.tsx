import { useEffect, useState } from 'react';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { clientPost } from '@/libs/client-post';
import AppListTable from '@/components/app/app-list-table';

export default function AppListOld() {
  const [value, setValue] = useState<any>([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await clientPost({ url: '/app/list' });
      setValue(response.data);
    };

    fetchData().catch(() => setValue([]));
  }, []);

  console.log(value);

  return (
    <SpaceBetween size="m">
      <Header variant="h1">app list</Header>

      <AppListTable apps={(value as any)?.apps ? (value as any).apps : []} />
    </SpaceBetween>
  );
}
