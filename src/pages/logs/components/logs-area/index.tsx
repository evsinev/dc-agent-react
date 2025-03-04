import LogRow from '@/pages/logs/components/logs-area/components/log-row';
import Area from './components/area';
import useLogs from '../../hooks/use-logs';
import { useLogsList } from '../../api/logs-list';
import LogsAreaLoader from './loader';

export default function LogsArea() {
  // TODO: заменить hostname и service
  const { isLoading } = useLogsList({
    hostname: 'some-host',
    service: 'some-service',
    linesCount: 10,
  });

  const logs = useLogs((state) => state.logs);

  // Suspense не подходит, т.к. у нас все в одном bundle
  if (isLoading) {
    return <LogsAreaLoader />;
  }

  return (
    <Area>
      {logs.map((log, index) => (
        <LogRow
          key={`${log}${index}`}
          index={index}
          log={log}
        />
      ))}
    </Area>
  );
}
