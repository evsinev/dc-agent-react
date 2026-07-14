import { useState } from 'react';
import { useQueryParams } from './use-query-params';

/**
 * Source of a table's transient page/sort/current-filter state.
 *
 * Standalone list pages persist it in the URL (`urlState = true`) so it survives reload and is
 * shareable. Embedded instances (e.g. the Command/Service tables inside the Agent View tabs) keep it
 * in internal component state (`urlState = false`) so several tables can coexist on one route without
 * fighting over the shared, global query-param keys. Saved filter sets and column/density preferences
 * persist to localStorage in either mode.
 */
export function useTableParams(urlState: boolean): {
  getParam: (param: string) => string | undefined;
  setParam: (param: string, value: string | null) => void;
} {
  const url = useQueryParams();
  const [local, setLocal] = useState<Record<string, string>>({});

  if (urlState) {
    return { getParam: url.getQueryParam, setParam: url.setQueryParam };
  }

  return {
    getParam: (param) => local[param],
    setParam: (param, value) =>
      setLocal((current) => {
        const next = { ...current };
        if (value === null || value === '') {
          delete next[param];
        } else {
          next[param] = value;
        }
        return next;
      }),
  };
}
