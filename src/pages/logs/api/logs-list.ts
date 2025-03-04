import { useEffect } from 'react';
import useSWR from 'swr';
import useLogs from '@/pages/logs/hooks/use-logs';

export type LogsListParams = {
  logToken?: string;
  hostname: string;
  service: string;
  linesCount: number;
};

export type LogsListResponse = {
  logToken: string;
  logs: string[];
};

// TODO: Удалить при интеграции
const getLogsMoq = (params: LogsListParams): Promise<LogsListResponse> => new Promise((resolve) => {
  setTimeout(() => {
    resolve({
      logToken: 'some token',
      logs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((log) => `some log some log somesome log some log some log some log some log some log some log some log some log some log some log some logsome log some log some log some log some log some log some log some log some log some log some log some logsome log some log some log some log some log some log some log some log some log some log some log some log log some log some log some log some log some log some log some log some log some log ${log + Math.random()}`),
    });
  }, 2000);
});

export function useLogsList(params: LogsListParams) {
  const logToken = useLogs((state) => state.logToken);
  const setLogToken = useLogs((state) => state.setLogToken);
  const setLogs = useLogs((state) => state.setLogs);

  const refreshInterval = process.env.PUBLIC_LOGS_REFRESH_INTERVAL ? Number(process.env.PUBLIC_LOGS_REFRESH_INTERVAL) : 5000;

  const response = useSWR<LogsListResponse>(
    '/logs/get-list',
    () => getLogsMoq({ ...params, logToken }),
    {
      refreshInterval,
    },
  );

  // перезаписываем токен в хранилище, чтобы последующие запросы шли с ним
  useEffect(() => {
    if (response.data?.logs) {
      setLogs(response.data.logs);
    }
    if (response.data?.logToken) {
      setLogToken(response.data.logToken);
    }
  }, [response.data?.logToken, response.data?.logs]);

  return response;
}
