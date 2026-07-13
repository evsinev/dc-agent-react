// Single source of truth for the eight command types. Drives the create-form type tiles,
// the per-type Configuration fields, the command details view, the endpoint badge, and the
// create/update request URL. Keep this in sync with the backend `TaskType` enum and the
// per-type request DTOs (dc-agent `.../remote/agent/controlplane/messages/Command*Request`).

export type CommandTypeKey =
  | 'WAR'
  | 'JAR'
  | 'NODE'
  | 'SAVE_ARTIFACT'
  | 'ZIP_ARCHIVE'
  | 'ZIP_DIRS'
  | 'FETCH_URL'
  | 'DOCKER';

export type FieldKind = 'path' | 'text' | 'url' | 'boolean';

export type FieldDef = {
  /** Config key written to the file and posted in `config` (matches the backend model field). */
  key: string;
  label: string;
  required: boolean;
  kind: FieldKind;
  description?: string;
  constraintText?: string;
  placeholder?: string;
};

export type CommandTypeDef = {
  key: CommandTypeKey;
  /** Short verb shown on the tile and after the type code (e.g. "deploy jar"). */
  label: string;
  /** Tile helper text. */
  description: string;
  /** Endpoint template with `{name}` (and other) placeholders — shown as a badge. */
  endpoint: string;
  /** Backend type segment used in the create/update URL (`/command/create/<path>`). */
  path: string;
  /** Types whose command name is fixed and cannot be chosen by the user. */
  fixedName?: string;
  fields: FieldDef[];
};

const serviceName: FieldDef = {
  key: 'serviceName',
  label: 'serviceName',
  required: true,
  kind: 'text',
  description: 'daemontools service name; derives the service dir and log file.',
  constraintText: 'Defaults to Name · Allowed characters: a–z A–Z 0–9 . _ -',
  placeholder: 'billing',
};

const waitUrl: FieldDef = {
  key: 'waitUrl',
  label: 'waitUrl',
  required: false,
  kind: 'url',
  description: 'Health URL polled after restart until it returns 200. Skipped if empty.',
  constraintText: 'Must start with http:// or https://. Polled until 200 or waitDuration expires.',
  placeholder: 'http://127.0.0.1:8080/health',
};

export const COMMAND_TYPES: Record<CommandTypeKey, CommandTypeDef> = {
  WAR: {
    key: 'WAR',
    label: 'deploy war',
    description: 'Swap a WAR, restart the service, wait on a health URL',
    endpoint: 'POST /dc-agent/war/{name}',
    path: 'war',
    fields: [
      {
        key: 'warFilename',
        label: 'warFilename',
        required: true,
        kind: 'path',
        description: 'Destination path for the uploaded WAR.',
        constraintText: 'Absolute path on the agent host.',
        placeholder: '/service/myservice/app.war',
      },
      serviceName,
      waitUrl,
    ],
  },
  JAR: {
    key: 'JAR',
    label: 'deploy jar',
    description: 'Swap a runnable JAR, restart the service, wait on health',
    endpoint: 'POST /dc-agent/jar/{name}',
    path: 'jar',
    fields: [
      {
        key: 'jarFilename',
        label: 'jarFilename',
        required: true,
        kind: 'path',
        description: 'Destination path for the uploaded JAR.',
        constraintText: 'Absolute path on the agent host.',
        placeholder: '/service/myservice/app.jar',
      },
      serviceName,
      waitUrl,
    ],
  },
  NODE: {
    key: 'NODE',
    label: 'deploy node',
    description: 'Unpack a Node.js ZIP bundle, restart, wait on health',
    endpoint: 'POST /dc-agent/node/{name}',
    path: 'node',
    fields: [
      {
        key: 'jarFilename',
        label: 'jarFilename',
        required: true,
        kind: 'path',
        description: 'Destination path where the uploaded Node.js ZIP is unpacked.',
        constraintText: 'Absolute path on the agent host.',
        placeholder: '/service/frontend',
      },
      serviceName,
      waitUrl,
    ],
  },
  SAVE_ARTIFACT: {
    key: 'SAVE_ARTIFACT',
    label: 'save-artifact',
    description: 'Store an uploaded build artifact under a directory',
    endpoint: 'POST /dc-agent/save-artifact/{name}/{version}',
    path: 'save-artifact',
    fields: [
      {
        key: 'dir',
        label: 'dir',
        required: true,
        kind: 'path',
        description: 'Directory on the host where the uploaded file is written.',
        constraintText: 'Absolute path, starts with /.',
        placeholder: '/opt/sbp-android',
      },
      {
        key: 'extension',
        label: 'extension',
        required: false,
        kind: 'text',
        description: 'Extension appended to the saved file name.',
        constraintText: 'Letters and digits, no dot. Overridable by the x-dc-agent-file-extension header.',
        placeholder: 'apk',
      },
      {
        key: 'replaceDirChars',
        label: 'replaceDirChars',
        required: false,
        kind: 'text',
        description: 'Substring in {version} replaced by "/" — lets you write into subdirectories.',
        constraintText: 'Any string, e.g. __.',
        placeholder: '__',
      },
    ],
  },
  ZIP_ARCHIVE: {
    key: 'ZIP_ARCHIVE',
    label: 'zip-archive',
    description: 'Extract an uploaded ZIP into a directory',
    endpoint: 'POST /dc-agent/zip-archive/{name}',
    path: 'zip-archive',
    fields: [
      {
        key: 'dir',
        label: 'dir',
        required: true,
        kind: 'path',
        description: 'Directory the uploaded ZIP is extracted into.',
        constraintText: 'Absolute path, starts with /.',
        placeholder: '/opt/app-name',
      },
    ],
  },
  ZIP_DIRS: {
    key: 'ZIP_DIRS',
    label: 'zip-dirs',
    description: 'Extract a ZIP into a base dir + URL sub-path',
    endpoint: 'POST /dc-agent/zip-dirs/{name}/{subdir}',
    path: 'zip-dirs',
    fields: [
      {
        key: 'dir',
        label: 'dir',
        required: true,
        kind: 'path',
        description: 'Base directory; the URL sub-path is appended to it.',
        constraintText: 'Absolute path, starts with /.',
        placeholder: '/opt/app-name',
      },
      {
        key: 'delete',
        label: 'delete — mirror mode',
        required: false,
        kind: 'boolean',
        description: 'Delete everything in the target dir that is not present in the uploaded ZIP.',
        constraintText: 'Destructive: mirror applies to the whole target directory.',
      },
    ],
  },
  FETCH_URL: {
    key: 'FETCH_URL',
    label: 'fetch-url',
    description: 'Proxy an HTTP GET ZIP from the agent host',
    endpoint: 'GET /dc-agent/fetch-url/{url}',
    path: 'fetch-url',
    fixedName: 'fetch-url',
    fields: [],
  },
  DOCKER: {
    key: 'DOCKER',
    label: 'docker push / check',
    description: 'Apply or dry-run a dc-docker.yml service definition',
    endpoint: 'POST /dc-agent/docker/push|check/{name}',
    path: 'docker',
    fixedName: 'dc-docker',
    fields: [],
  },
};

// Tile display order (4 columns × 2 rows), matching the design.
export const COMMAND_TYPE_ORDER: CommandTypeKey[] = [
  'WAR',
  'JAR',
  'NODE',
  'SAVE_ARTIFACT',
  'ZIP_ARCHIVE',
  'ZIP_DIRS',
  'FETCH_URL',
  'DOCKER',
];

/** True when `type` is a valid known command type key. */
export function isCommandType(type: string | undefined): type is CommandTypeKey {
  return type !== undefined && type in COMMAND_TYPES;
}

/** "JAR — deploy jar" label used in the details Overview. */
export function commandTypeLabel(type: string | undefined): string {
  return isCommandType(type) ? `${type} — ${COMMAND_TYPES[type].label}` : (type ?? '—');
}

/** Endpoint with `{name}` substituted, for the details Overview. */
export function commandEndpoint(type: string | undefined, name: string): string {
  return isCommandType(type) ? COMMAND_TYPES[type].endpoint.replace('{name}', name) : '—';
}

/** Config filename for a command (`config/<name>.json`). */
export function commandConfigFile(name: string): string {
  return `config/${name}.json`;
}
