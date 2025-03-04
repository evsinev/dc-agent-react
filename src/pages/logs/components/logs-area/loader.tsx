import { useLogsList } from '@/pages/logs/api/logs-list';

export default function LogsAreaLoader() {
  // TODO: заменить hostname и service
  const { data } = useLogsList({
    hostname: 'some-host',
    service: 'some-service',
    linesCount: 10,
  });

  return (
    <div>Loading</div>
  );
}
