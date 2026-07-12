// Fake, obviously-non-production fixtures for the dev mock middleware.
// Shapes mirror the frontend API types (imported type-only, erased at build).
import type { AppListItem } from '../src/pages/app-list/api/app-list';
import type { GitLog, GitLogItem } from '../src/pages/git/api/git-log';
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
