import { COMMAND_TYPES, type CommandTypeKey, isCommandType } from '@/pages/command-list/api/command-types';

// Command types that accept a binary artifact upload — the ones the curl/wget deploy snippets apply to.
// FETCH_URL (a GET proxy) and DOCKER are invoked differently, so the Usage section is hidden for them.
const UPLOAD_TYPES: ReadonlySet<CommandTypeKey> = new Set<CommandTypeKey>([
  'JAR',
  'WAR',
  'NODE',
  'SAVE_ARTIFACT',
  'ZIP_ARCHIVE',
  'ZIP_DIRS',
]);

export function isUploadType(type: string | undefined): type is CommandTypeKey {
  return isCommandType(type) && UPLOAD_TYPES.has(type);
}

const AGENT_URL_PLACEHOLDER = '<agent-url>';

/**
 * Build the full deploy URL for a command. The agent URL from config may or may not already include the
 * `/dc-agent` context, so it's stripped and re-added to guarantee it appears exactly once. `{name}` is
 * substituted; `{version}`/`{subdir}` (save-artifact/zip-dirs) are left as literal placeholders to fill.
 */
export function buildDeployUrl(agentUrl: string | undefined, type: string | undefined, name: string): string {
  const base = (agentUrl ?? AGENT_URL_PLACEHOLDER).replace(/\/dc-agent\/?$/, '');
  const path = isCommandType(type)
    ? COMMAND_TYPES[type].endpoint.replace(/^\w+\s+/, '').replace('{name}', name)
    : `/dc-agent/${name}`;
  return base + path;
}

export type UsageSnippets = {
  curl: string;
  wget: string;
  gitlabCurl: string;
  gitlabWget: string;
};

/** The four deploy-command templates (verbatim flag sets), with the deploy URL substituted. */
export function buildUsageSnippets(url: string): UsageSnippets {
  return {
    curl: `curl \\
  --data-binary @package.zip \\
  -k \\
  --fail -H "content-type: application/zip" \\
  -H "api-key: $DEPLOY_KEY" \\
  -v \\
  ${url}`,
    wget: `wget \\
  --header="api-key: $DEPLOY_KEY" \\
  --header="content-type: application/zip" \\
  --post-file package.zip \\
  -d \\
  -O- \\
  ${url}`,
    gitlabCurl: `    - >
      curl
      --fail
      -H "Content-Type: application/zip"
      -H "api-key: $RELEASE_KEY"
      --data-binary @package.zip
      ${url}`,
    gitlabWget: `    - >
      wget
      --header="api-key: $DEPLOY_KEY"
      --header="content-type: application/zip"
      --post-file package.zip
      --show-progress
      --progress=bar
      -O-
      "${url}"`,
  };
}
