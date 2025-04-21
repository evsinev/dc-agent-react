import { useLogsList } from '../../api/logs-list';
import useLogs from '../../hooks/use-logs';
import Area from './components/area';
import LogRow from './components/log-row';
import LogsAreaLoader from './loader';

export default function LogsArea() {
  // TODO: заменить hostname и service
  const { isLoading } = useLogsList({
    hostname: 'some-host',
    service: 'some-service',
    linesCount: 10,
  });

  const logs = useLogs((state) => state.logs);

  return (
    <Area>
      {isLoading && <LogsAreaLoader />}
      {logs.map((log, index) => (
        <LogRow
          key={`${log}-${index}`}
          index={index}
          log={log}
        />
      ))}
    </Area>
  );
}
