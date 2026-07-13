import { clientPost } from '@/libs/client-post';
import useSWR from 'swr';

export type OperatorInfo = {
  /** The dc-operator backend build version (jar manifest Implementation-Version). */
  version: string;
};

/** Fetch the backend version from the operator's `/api/info` endpoint. */
export function useOperatorInfo() {
  return useSWR('/info', (url) => clientPost<OperatorInfo>({ url }));
}

export type BuildInfo = {
  version: string;
  commit?: string;
  buildTime?: string;
};

/**
 * Read `build-info.json` — a static file the release workflow writes to the dist root (served under
 * PUBLIC_BASE_PATH). It carries the released git tag + commit. Absent in dev → resolves to null so the
 * footer falls back to the build-injected package.json version.
 */
export function useBuildInfo() {
  return useSWR('build-info.json', async (): Promise<BuildInfo | null> => {
    try {
      const response = await fetch(`${process.env.PUBLIC_BASE_PATH}/build-info.json`, { cache: 'no-store' });
      return response.ok ? ((await response.json()) as BuildInfo) : null;
    } catch {
      return null;
    }
  });
}
