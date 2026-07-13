import { RequestError } from '@/components/error/models/error-model';
import { clientPost } from '@/libs/client-post';
import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

// ── Wire types (mirror the backend control-plane DTOs) ──────────────────────

/** A stored key, masked: the frontend never sees the secret, only a stable id + owner label. */
export type MaskedApiKey = { maskedId: string; owner: string };

/** A newly-generated key sent to the server (write-only). */
export type NewApiKey = { key: string; owner: string };

/**
 * Write-only key operations. `keep` lists masked ids of existing keys to retain; `add` carries
 * brand-new secrets. On create, `keep` is empty. Keys never round-trip as plaintext.
 */
export type ApiKeyOps = { keep: string[]; add: NewApiKey[] };

/** Full detail for the view/edit screens: config fields (non-secret) + masked keys. */
export type CommandDetail = {
  host: string;
  name: string;
  type: string;
  parameters: Record<string, string>;
  apiKeys: MaskedApiKey[];
};

type CommandDetailResponse = { command: CommandDetail };

/** Everything needed to create or update a command; `typePath` selects the endpoint. */
export type CommandWritePayload = {
  host: string;
  name: string;
  typePath: string;
  config: Record<string, unknown>;
  apiKeys: ApiKeyOps;
};

const GET_KEY = '/command/get';

// ── Hooks ───────────────────────────────────────────────────────────────────

/** Fetch a single command's full detail (used by the details and edit screens). */
export function useCommandGet(host?: string, name?: string) {
  return useSWR(host && name ? [GET_KEY, host, name] : null, ([url, h, n]) =>
    clientPost<CommandDetailResponse>({ url, params: { host: h, name: n } }).then((r) => r.command),
  );
}

/** Create a new command. Posts to `/command/create/<typePath>`; throws `RequestError` on 409/5xx. */
export function useCommandCreate() {
  return useSWRMutation<CommandDetail, RequestError, string, CommandWritePayload>('/command/create', (_key, { arg }) =>
    clientPost<CommandDetailResponse>({
      url: `/command/create/${arg.typePath}`,
      params: { host: arg.host, name: arg.name, config: arg.config, apiKeys: arg.apiKeys },
    }).then((r) => r.command),
  );
}

/** Update an existing command's configuration and keys. Posts to `/command/update/<typePath>`. */
export function useCommandUpdate() {
  return useSWRMutation<CommandDetail, RequestError, string, CommandWritePayload>('/command/update', (_key, { arg }) =>
    clientPost<CommandDetailResponse>({
      url: `/command/update/${arg.typePath}`,
      params: { host: arg.host, name: arg.name, config: arg.config, apiKeys: arg.apiKeys },
    }).then((r) => r.command),
  );
}

/**
 * Returns a function that revalidates the command list and every `/command/get` cache entry, so
 * the list and detail screens reflect a create/update immediately.
 */
export function useRevalidateCommands() {
  const { mutate } = useSWRConfig();
  return () => Promise.all([mutate('/command/list'), mutate((key) => Array.isArray(key) && key[0] === GET_KEY)]);
}
