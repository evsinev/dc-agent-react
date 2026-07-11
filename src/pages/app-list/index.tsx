import { useSplitPanel } from '@/hooks/use-split-panel';
import { AppListItem, useAppList } from '@/pages/app-list/api/app-list';
import { StatusIndicator } from '@cloudscape-design/components';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useEffect, useState } from 'react';
import AppListTable from './components/app-list-table';
import AppServicePanel from '@/pages/app-list/components/app-service-panel';

export default function AppList() {
  const { data, isLoading } = useAppList();
  const [selected, setSelected] = useState<AppListItem[]>([]);

  const show = useSplitPanel((state) => state.show);
  const hide = useSplitPanel((state) => state.hide);

  useEffect(() => {
    if (selected.length > 0) {
      const last = selected[selected.length - 1];

      show({
        content: (
          <AppServicePanel
            appName={last.appName}
            serviceHost={last.taskHost}
            serviceName={`${last.taskName}-1`}
          />
        ),
        title: last.appName,
      });
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
