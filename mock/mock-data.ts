// Fake, obviously-non-production fixtures for the dev mock middleware.
// Shapes mirror the frontend API types (imported type-only, erased at build).
import type { AppListItem } from '../src/pages/app-list/api/app-list';
import type { AgentInfo, AgentMetrics } from '../src/pages/dc-agent-list/api/agent-list';
import type { GitLog, GitLogItem } from '../src/pages/git/api/git-log';
import type { CommandInfo } from '../src/pages/command-list/api/command-list';
import type { CommandDetail, MaskedApiKey } from '../src/pages/command-list/api/command-mutations';
import type { ServiceListItem, ServiceStateType } from '../src/pages/service-list/api/service-list';
import type { ServiceView } from '../src/pages/service-view/api/service-view';

// `/app/view` and `/app/status` response types are not exported from the app — mirror them here.
export type AppView = {
  appName: string;
  taskName: string;
  taskType: string;
  taskHost: string;
  taskCheckText: string;
  taskCheckColor: string;
  jobCreatedDateFormatted: string;
  consumerKey: string;
  agentUrl: string;
};

export type AppStatus = {
  status: 'OK' | 'ERROR' | 'DRIFT';
  errorMessage: string;
};

// ── Apps ──────────────────────────────────────────────────────────────────
export const APPS: AppListItem[] = [
  { appName: 'hello-world', taskName: 'hello-world-web', taskHost: 'sandbox-1', taskType: 'docker' },
  { appName: 'echo-server', taskName: 'echo-server-api', taskHost: 'sandbox-1', taskType: 'docker' },
  { appName: 'demo-clock', taskName: 'demo-clock-cron', taskHost: 'sandbox-2', taskType: 'systemd' },
  { appName: 'sample-counter', taskName: 'sample-counter-app', taskHost: 'sandbox-2', taskType: 'docker' },
  { appName: 'playground-cache', taskName: 'playground-cache-redis', taskHost: 'dev-box-a', taskType: 'docker' },
  { appName: 'acme-anvil', taskName: 'acme-anvil-worker', taskHost: 'dev-box-a', taskType: 'job' },
  { appName: 'widget-factory', taskName: 'widget-factory-svc', taskHost: 'dev-box-b', taskType: 'docker' },
  { appName: 'mock-notes', taskName: 'mock-notes-api', taskHost: 'dev-box-b', taskType: 'docker' },
];

const APP_STATUS: Record<string, AppStatus> = {
  'hello-world': { status: 'OK', errorMessage: '' },
  'echo-server': { status: 'OK', errorMessage: '' },
  'demo-clock': { status: 'DRIFT', errorMessage: 'Configuration drift detected' },
  'sample-counter': { status: 'OK', errorMessage: '' },
  'playground-cache': { status: 'ERROR', errorMessage: 'Container exited with code 1' },
  'acme-anvil': { status: 'DRIFT', errorMessage: 'Manifest is out of date' },
  'widget-factory': { status: 'OK', errorMessage: '' },
  'mock-notes': { status: 'OK', errorMessage: '' },
};

export function appStatusFor(appName: string): AppStatus {
  return APP_STATUS[appName] ?? { status: 'OK', errorMessage: '' };
}

export function appViewFor(appName: string): AppView {
  const app = APPS.find((a) => a.appName === appName);
  return {
    appName,
    taskName: app?.taskName ?? `${appName}-task`,
    taskType: app?.taskType ?? 'docker',
    taskHost: app?.taskHost ?? 'sandbox-1',
    taskCheckText: 'mock check ok',
    taskCheckColor: 'green',
    jobCreatedDateFormatted: 'Jul 10, 2026, 09:00 AM',
    consumerKey: `consumer-${appName}`,
    agentUrl: `http://sandbox-agent.local/${appName}`,
  };
}

// ── Agents ────────────────────────────────────────────────────────────────
function mockMetrics(over: Partial<AgentMetrics> = {}): AgentMetrics {
  return {
    systemCpuLoad: 0.22,
    systemCpuLoadText: '22%',
    processCpuLoad: 0.04,
    processCpuLoadText: '4%',
    loadAverage: 1.42,
    loadAverageText: '1.42',
    availableProcessors: 8,
    processCpuTimeNanos: 200_000_000_000,
    processCpuTimeText: '3m 20s',
    heapUsedBytes: 536_870_912,
    heapUsedText: '512.0 MB',
    heapCommittedBytes: 1_073_741_824,
    heapCommittedText: '1.0 GB',
    heapMaxBytes: 2_147_483_648,
    heapMaxText: '2.0 GB',
    heapUsedFraction: 0.25,
    heapUsedPercentText: '25%',
    nonHeapUsedBytes: 134_217_728,
    nonHeapUsedText: '128.0 MB',
    physicalUsedBytes: 12_884_901_888,
    physicalUsedText: '12.0 GB',
    physicalTotalBytes: 17_179_869_184,
    physicalTotalText: '16.0 GB',
    physicalFreeBytes: 4_294_967_296,
    physicalFreeText: '4.0 GB',
    physicalUsedFraction: 0.75,
    physicalUsedPercentText: '75%',
    swapTotalBytes: 2_147_483_648,
    swapTotalText: '2.0 GB',
    swapFreeBytes: 1_610_612_736,
    swapFreeText: '1.5 GB',
    threadCount: 42,
    gcCount: 1234,
    gcTimeMs: 1200,
    gcTimeText: '1s',
    ...over,
  };
}

export const AGENTS: AgentInfo[] = [
  {
    name: 'sandbox-1',
    url: 'http://sandbox-1.local:8051/dc-agent',
    reachable: true,
    appInstanceName: 'dc-agent',
    appVersion: '1.0.9',
    hostname: 'sandbox-1',
    port: 8051,
    uptimeMs: 936_000_000,
    uptimeFormatted: '10d 20h 0m',
    responseEpoch: 1_752_300_000_000,
    responseId: 'mock-sandbox-1',
    servicesTotal: 2,
    servicesUp: 2,
    services: [
      { serviceName: 'echo-svc', statusName: 'Running', statusIndicator: 'success' },
      { serviceName: 'demo-timer', statusName: 'Running', statusIndicator: 'success' },
    ],
    metrics: mockMetrics({ systemCpuLoad: 0.18, systemCpuLoadText: '18%', threadCount: 38 }),
  },
  {
    name: 'sandbox-2',
    url: 'http://sandbox-2.local:8051/dc-agent',
    reachable: true,
    appInstanceName: 'dc-agent',
    appVersion: '1.0.9',
    hostname: 'sandbox-2',
    port: 8051,
    uptimeMs: 5_400_000,
    uptimeFormatted: '1h 30m',
    responseEpoch: 1_752_300_000_000,
    responseId: 'mock-sandbox-2',
    servicesTotal: 1,
    servicesUp: 0,
    services: [{ serviceName: 'sample-queue', statusName: 'Paused', statusIndicator: 'warning' }],
    metrics: mockMetrics({
      systemCpuLoad: 0.63,
      systemCpuLoadText: '63%',
      heapUsedBytes: 1_610_612_736,
      heapUsedText: '1.5 GB',
      heapUsedFraction: 0.75,
      heapUsedPercentText: '75%',
      threadCount: 51,
    }),
  },
  {
    name: 'dev-box-a',
    url: 'http://dev-box-a.local:8051/dc-agent',
    reachable: true,
    appInstanceName: 'dc-agent',
    appVersion: '1.0.8',
    hostname: 'dev-box-a',
    port: 8051,
    uptimeMs: 777_600_000,
    uptimeFormatted: '9d 0h 0m',
    responseEpoch: 1_752_300_000_000,
    responseId: 'mock-dev-box-a',
    servicesTotal: 1,
    servicesUp: 1,
    services: [{ serviceName: 'sandbox-db', statusName: 'Running', statusIndicator: 'success' }],
    metrics: mockMetrics({ loadAverage: -1, loadAverageText: 'n/a', threadCount: 27 }),
  },
  {
    name: 'dev-box-b',
    url: 'http://dev-box-b.local:8051/dc-agent',
    reachable: false,
    error: 'Cannot get app-status: Connection refused',
    port: 0,
    uptimeMs: 0,
    responseEpoch: 0,
    servicesTotal: 0,
    servicesUp: 0,
    servicesError: 'Connection refused',
    metricsError: 'Connection refused',
  },
];

// ── Commands ────────────────────────────────────────────────────────────────
// Non-docker commands configured on each agent (dev-box-b is unreachable).
const COMMANDS_SEED: CommandInfo[] = [
  {
    host: 'sandbox-1',
    name: 'app-config',
    type: 'ZIP_ARCHIVE',
    parameters: { dir: '/opt/app-config', apiKeys: 'gitlab-ci' },
  },
  {
    host: 'sandbox-1',
    name: 'billing',
    type: 'JAR',
    parameters: {
      jarFilename: 'billing.jar',
      serviceName: 'billing',
      waitUrl: 'http://localhost:8080/health',
      apiKeys: 'gitlab-ci',
    },
  },
  {
    host: 'sandbox-1',
    name: 'fetch-url',
    type: 'FETCH_URL',
    parameters: { apiKeys: 'gitlab-ci' },
  },
  {
    host: 'sandbox-2',
    name: 'frontend',
    type: 'NODE',
    parameters: { jarFilename: 'server.js', serviceName: 'frontend', apiKeys: 'ci-bot' },
  },
  {
    host: 'sandbox-2',
    name: 'artifacts',
    type: 'SAVE_ARTIFACT',
    parameters: { dir: '/opt/artifacts', extension: 'tgz', replaceDirChars: '_', apiKeys: 'jenkins' },
  },
  {
    host: 'dev-box-a',
    name: 'legacy-portal',
    type: 'WAR',
    parameters: { warFilename: 'portal.war', serviceName: 'legacy-portal', apiKeys: 'jenkins' },
  },
  { host: 'dev-box-b', error: 'Connection refused' },
];

// Working command list, mutated by create/update so `yarn dev:mock` + e2e see live changes.
export const COMMANDS: CommandInfo[] = COMMANDS_SEED.map(cloneCommand);

// Per-command masked API keys (secrets never exist in the mock — only stable ids + owners).
const COMMAND_KEYS = new Map<string, MaskedApiKey[]>();

// Backend type segment → TaskType (mirrors COMMAND_TYPES[type].path).
const TYPE_BY_PATH: Record<string, string> = {
  jar: 'JAR',
  war: 'WAR',
  node: 'NODE',
  'save-artifact': 'SAVE_ARTIFACT',
  'zip-archive': 'ZIP_ARCHIVE',
  'zip-dirs': 'ZIP_DIRS',
  'fetch-url': 'FETCH_URL',
  docker: 'DOCKER',
};

export type CommandWriteBody = {
  host: string;
  name: string;
  config?: Record<string, unknown>;
  apiKeys?: { keep?: string[]; add?: { key: string; owner: string }[] };
};

function cloneCommand(command: CommandInfo): CommandInfo {
  return { ...command, parameters: command.parameters ? { ...command.parameters } : undefined };
}

// Deterministic fake masked id ("****" + 8 hex) so the same seed always yields the same id.
function fakeMaskedId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `****${hash.toString(16).padStart(8, '0').slice(0, 8)}`;
}

function commandKey(host: string, name: string): string {
  return `${host}/${name}`;
}

// Seed one masked key per owner label found in each seeded command's `apiKeys` summary.
function seedCommandKeys(): void {
  COMMAND_KEYS.clear();
  for (const command of COMMANDS) {
    if (!command.name || !command.parameters?.apiKeys) {
      continue;
    }
    const owners = command.parameters.apiKeys.split(', ').filter(Boolean);
    COMMAND_KEYS.set(
      commandKey(command.host, command.name),
      owners.map((owner) => ({ maskedId: fakeMaskedId(`${command.host}/${command.name}/${owner}`), owner })),
    );
  }
}
seedCommandKeys();

/** Reset the mutable command state — for test isolation. */
export function __resetCommandState(): void {
  COMMANDS.length = 0;
  COMMANDS.push(...COMMANDS_SEED.map(cloneCommand));
  seedCommandKeys();
}

function applyCommandWrite(host: string, name: string, type: string, body: CommandWriteBody): void {
  const key = commandKey(host, name);
  const existing = COMMAND_KEYS.get(key) ?? [];
  const keep = body.apiKeys?.keep ?? [];
  const kept = existing.filter((entry) => keep.includes(entry.maskedId));
  const added = (body.apiKeys?.add ?? []).map((entry) => ({ maskedId: fakeMaskedId(entry.key), owner: entry.owner }));
  const merged = [...kept, ...added];
  COMMAND_KEYS.set(key, merged);

  const parameters: Record<string, string> = {};
  for (const [field, value] of Object.entries(body.config ?? {})) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    parameters[field] = typeof value === 'string' ? value : String(value);
  }
  if (merged.length > 0) {
    parameters.apiKeys = merged.map((entry) => entry.owner).join(', ');
  }

  const item: CommandInfo = { host, name, type, parameters };
  const index = COMMANDS.findIndex((command) => command.host === host && command.name === name);
  if (index >= 0) {
    COMMANDS[index] = item;
  } else {
    COMMANDS.push(item);
  }
}

function commandDetailFor(host: string, name: string): CommandDetail | undefined {
  const command = COMMANDS.find((item) => item.host === host && item.name === name);
  if (!command || !command.name) {
    return undefined;
  }
  const parameters: Record<string, string> = {};
  for (const [field, value] of Object.entries(command.parameters ?? {})) {
    if (field !== 'apiKeys') {
      parameters[field] = value;
    }
  }
  return {
    host: command.host,
    name: command.name,
    type: command.type ?? '',
    parameters,
    apiKeys: COMMAND_KEYS.get(commandKey(host, name)) ?? [],
  };
}

type MockResult = { status: number; body: unknown };

function notFound(host: string, name: string): MockResult {
  return {
    status: 404,
    body: { title: `Command ${name} was not found on ${host}.`, type: 'CommandNotFoundError', status: 404 },
  };
}

/** GET a single command's detail (masked keys). */
export function mockCommandGet(host: string, name: string): MockResult {
  const detail = commandDetailFor(host, name);
  return detail ? { status: 200, body: { command: detail } } : notFound(host, name);
}

/** CREATE a command — 409 if one with the same name already exists on that host. */
export function mockCommandCreate(typePath: string, body: CommandWriteBody): MockResult {
  const { host, name } = body;
  if (COMMANDS.some((command) => command.host === host && command.name === name)) {
    return {
      status: 409,
      body: { title: `A command with this name already exists on ${host}.`, type: 'CommandConflictError', status: 409 },
    };
  }
  applyCommandWrite(host, name, TYPE_BY_PATH[typePath] ?? typePath.toUpperCase(), body);
  return { status: 200, body: { command: commandDetailFor(host, name) } };
}

/** UPDATE a command — 404 if it does not exist; type is immutable (kept from the on-disk row). */
export function mockCommandUpdate(typePath: string, body: CommandWriteBody): MockResult {
  const { host, name } = body;
  const existing = COMMANDS.find((command) => command.host === host && command.name === name);
  if (!existing) {
    return notFound(host, name);
  }
  applyCommandWrite(host, name, existing.type ?? TYPE_BY_PATH[typePath] ?? typePath.toUpperCase(), body);
  return { status: 200, body: { command: commandDetailFor(host, name) } };
}

// ── Services ──────────────────────────────────────────────────────────────
type ServiceSeed = {
  host: string;
  serviceName: string;
  state: ServiceStateType;
  statusIndicator: ServiceListItem['statusIndicator'];
  statusName: string;
  ageFormatted: string;
};

const SERVICE_SEEDS: ServiceSeed[] = [
  {
    host: 'sandbox-1',
    serviceName: 'echo-svc',
    state: 'UP',
    statusIndicator: 'success',
    statusName: 'Up',
    ageFormatted: '3 days',
  },
  {
    host: 'sandbox-1',
    serviceName: 'demo-timer',
    state: 'DOWN',
    statusIndicator: 'error',
    statusName: 'Down',
    ageFormatted: '12 minutes',
  },
  {
    host: 'sandbox-2',
    serviceName: 'sample-queue',
    state: 'UP_PAUSED',
    statusIndicator: 'warning',
    statusName: 'Paused',
    ageFormatted: '1 hour',
  },
  {
    host: 'dev-box-a',
    serviceName: 'sandbox-db',
    state: 'UP',
    statusIndicator: 'success',
    statusName: 'Up',
    ageFormatted: '9 days',
  },
  {
    host: 'dev-box-b',
    serviceName: 'playground-worker',
    state: 'DOWN_WANT_UP',
    statusIndicator: 'warning',
    statusName: 'Starting',
    ageFormatted: '30 seconds',
  },
];

function seedToItem(seed: ServiceSeed): ServiceListItem {
  return {
    fqsn: `${seed.host}/${seed.serviceName}`,
    host: seed.host,
    serviceName: seed.serviceName,
    serviceStatus: {
      state: seed.state,
      pid: seed.state.startsWith('UP') ? 4200 : undefined,
      when: '2026-07-10T09:00:00Z',
      superviseState: seed.statusName,
      errorMessage: seed.state === 'DOWN' ? 'service exited unexpectedly' : undefined,
    },
    statusIndicator: seed.statusIndicator,
    statusName: seed.statusName,
    ageFormatted: seed.ageFormatted,
    whenFormatted: 'Jul 10, 2026, 09:00 AM',
  };
}

export const SERVICES: ServiceListItem[] = SERVICE_SEEDS.map(seedToItem);

export function serviceViewFor(fqsn: string): ServiceView {
  const [host = 'sandbox-1', serviceName = 'echo-svc'] = fqsn.split('/');
  const service =
    SERVICES.find((s) => s.fqsn === fqsn) ??
    seedToItem({
      host,
      serviceName,
      state: 'UP',
      statusIndicator: 'success',
      statusName: 'Up',
      ageFormatted: '3 days',
    });

  return {
    service,
    runContent: `#!/bin/sh\nexec 2>&1\nexec ./${serviceName} --config /etc/${serviceName}/config.yml\n`,
    logRunContent: `#!/bin/sh\nexec logger -t ${serviceName}\n`,
    lastLogLines: [
      `[${serviceName}] starting up on ${host}`,
      `[${serviceName}] loaded mock configuration`,
      `[${serviceName}] listening — ready to serve requests`,
    ].join('\n'),
    canHangup: true,
    canTerminate: true,
    canUp: true,
    canDown: true,
  };
}

// ── Git ─────────────────────────────────────────────────────────────────────
const COMMITS: GitLogItem[] = [
  {
    dateFormatted: 'Jul 10, 2026, 09:00 AM',
    shortMessage: 'Add mock data for local dev',
    fullMessage: 'Add mock data for local dev\n\nSeed sandbox apps and services.',
    author: 'Dev Tester',
    commiter: 'Dev Tester',
    ageFormatted: '2 hours ago',
  },
  {
    dateFormatted: 'Jul 9, 2026, 04:30 PM',
    shortMessage: 'Wire up echo service',
    fullMessage: 'Wire up echo service',
    author: 'Grace Sandbox',
    commiter: 'Grace Sandbox',
    ageFormatted: '18 hours ago',
  },
  {
    dateFormatted: 'Jul 8, 2026, 11:15 AM',
    shortMessage: 'Add hello-world demo app',
    fullMessage: 'Add hello-world demo app',
    author: 'Ada Example',
    commiter: 'Ada Example',
    ageFormatted: '2 days ago',
  },
  {
    dateFormatted: 'Jul 7, 2026, 02:00 PM',
    shortMessage: 'Bump sample dependencies',
    fullMessage: 'Bump sample dependencies',
    author: 'Dev Tester',
    commiter: 'Dev Tester',
    ageFormatted: '3 days ago',
  },
  {
    dateFormatted: 'Jul 6, 2026, 10:05 AM',
    shortMessage: 'Fix typo in demo README',
    fullMessage: 'Fix typo in demo README',
    author: 'Ada Example',
    commiter: 'Ada Example',
    ageFormatted: '4 days ago',
  },
  {
    dateFormatted: 'Jul 5, 2026, 09:00 AM',
    shortMessage: 'Initial sandbox commit',
    fullMessage: 'Initial sandbox commit',
    author: 'Grace Sandbox',
    commiter: 'Grace Sandbox',
    ageFormatted: '5 days ago',
  },
];

export const GIT_LOG: GitLog = {
  currentBranch: 'sandbox-main',
  lastCommit: COMMITS[0],
  commits: COMMITS,
};

// Stateful git layer: a pull adds a commit so the App list "Pull from Git" action
// can demonstrate its success path (real backends grow the log the same way).
let mockPullCount = 0;

/** Reset the mock pull counter — for test isolation. */
export function __resetGitPullState(): void {
  mockPullCount = 0;
}

function syntheticPullCommit(n: number): GitLogItem {
  return {
    dateFormatted: 'Jul 10, 2026, 10:00 AM',
    shortMessage: `Pulled sandbox change #${n}`,
    fullMessage: `Pulled sandbox change #${n}\n\nSynthetic commit added by the dev mock on git pull.`,
    author: 'Dev Tester',
    commiter: 'Dev Tester',
    ageFormatted: 'just now',
  };
}

/** Git log grown by the pulls recorded so far (newest synthetic commit first). */
export function mockGitLog(): GitLog {
  const pulled: GitLogItem[] = [];
  for (let n = mockPullCount; n >= 1; n--) {
    pulled.push(syntheticPullCommit(n));
  }
  const commits = [...pulled, ...COMMITS];
  return { currentBranch: GIT_LOG.currentBranch, lastCommit: commits[0], commits };
}

/** Record a pull (adds one commit to `mockGitLog`) and acknowledge it. */
export function mockGitPull(): { success: boolean } {
  mockPullCount += 1;
  return { success: true };
}
