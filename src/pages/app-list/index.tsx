import { useSplitPanel } from '@/hooks/use-split-panel';
import { AppListItem, useAppList } from '@/pages/app-list/api/app-list';
import AppDetail from '@/pages/app-view';
import { StatusIndicator } from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useEffect, useState } from 'react';
import AppListTable from './components/app-list-table';

export default function AppList() {
  const { data, isLoading } = useAppList();
  const [selected, setSelected] = useState<AppListItem[]>([]);

  const show = useSplitPanel((state) => state.show);
  const hide = useSplitPanel((state) => state.hide);

  useEffect(() => {
    if (selected.length > 0) {
      const last = selected[selected.length - 1];

      show({ content: <AppDetail appName={last.appName} />, title: last.appName });
    } else {
      hide();
    }
  }, [selected]);

  return (
    <SpaceBetween size="m">
      <Header variant="h1">
        App list
        {isLoading && <StatusIndicator type="loading">Fetching</StatusIndicator>}
      </Header>

      <AppListTable
        apps={data?.apps ?? []}
        isLoading={isLoading}
        selected={selected}
        setSelected={setSelected}
      />
    </SpaceBetween>
  );
}
