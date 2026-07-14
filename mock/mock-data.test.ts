import type { CommandDetail } from '../src/pages/command-list/api/command-mutations';
import { afterEach, beforeEach, describe, expect, test } from '@rstest/core';
import {
  APPS,
  COMMANDS,
  GIT_LOG,
  SERVICES,
  __resetCommandState,
  __resetGitPullState,
  appStatusFor,
  appViewFor,
  commandListItems,
  mockCommandCreate,
  mockCommandGet,
  mockCommandUpdate,
  mockGitLog,
  mockGitPull,
  serviceViewFor,
} from './mock-data';

function detailOf(body: unknown): CommandDetail {
  return (body as { command: CommandDetail }).command;
}

describe('mock-data fixtures', () => {
  test('ships non-empty fixtures', () => {
    expect(APPS.length).toBeGreaterThan(0);
    expect(SERVICES.length).toBeGreaterThan(0);
    expect(GIT_LOG.commits.length).toBeGreaterThan(0);
    expect(GIT_LOG.lastCommit).toEqual(GIT_LOG.commits[0]);
  });
});

describe('appStatusFor', () => {
  test('returns the mapped status for a known app', () => {
    expect(appStatusFor('demo-clock')).toEqual({
      status: 'DRIFT',
      errorMessage: 'Configuration drift detected',
    });
  });

  test('defaults unknown apps to OK', () => {
    expect(appStatusFor('does-not-exist')).toEqual({ status: 'OK', errorMessage: '' });
  });
});

describe('appViewFor', () => {
  test('derives details from the matching app', () => {
    const view = appViewFor('demo-clock');
    expect(view.appName).toBe('demo-clock');
    expect(view.taskName).toBe('demo-clock-cron');
    expect(view.taskHost).toBe('sandbox-2');
  });

  test('falls back for unknown apps', () => {
    const view = appViewFor('ghost-app');
    expect(view.appName).toBe('ghost-app');
    expect(view.taskName).toBe('ghost-app-task');
  });
});

describe('stateful git mock', () => {
  beforeEach(() => __resetGitPullState());
  afterEach(() => __resetGitPullState());

  test('starts at the base log with no pulls', () => {
    expect(mockGitLog().commits).toHaveLength(GIT_LOG.commits.length);
    expect(mockGitLog().lastCommit).toEqual(GIT_LOG.commits[0]);
  });

  test('a pull adds one commit at the top of the log', () => {
    expect(mockGitPull()).toEqual({ success: true });

    const log = mockGitLog();
    expect(log.commits).toHaveLength(GIT_LOG.commits.length + 1);
    expect(log.lastCommit).toEqual(log.commits[0]);
    expect(log.commits[0].shortMessage).toBe('Pulled sandbox change #1');
  });

  test('successive pulls stack newest-first', () => {
    mockGitPull();
    mockGitPull();

    const log = mockGitLog();
    expect(log.commits).toHaveLength(GIT_LOG.commits.length + 2);
    expect(log.commits[0].shortMessage).toBe('Pulled sandbox change #2');
    expect(log.commits[1].shortMessage).toBe('Pulled sandbox change #1');
  });
});

describe('stateful command mock', () => {
  beforeEach(() => __resetCommandState());
  afterEach(() => __resetCommandState());

  test('get returns config + masked keys and hides the apiKeys summary', () => {
    const result = mockCommandGet('sandbox-1', 'billing');
    expect(result.status).toBe(200);
    const detail = detailOf(result.body);
    expect(detail.type).toBe('JAR');
    expect(detail.parameters.jarFilename).toBe('billing.jar');
    expect(detail.parameters.apiKeys).toBeUndefined();
    expect(detail.apiKeys[0].owner).toBe('gitlab-ci');
    expect(detail.apiKeys[0].maskedId.startsWith('****')).toBe(true);
  });

  test('get and list attach server-derived service state joined on serviceName', () => {
    const detail = detailOf(mockCommandGet('sandbox-1', 'billing').body);
    expect(detail.serviceStatusName).toBe('Up');
    expect(detail.serviceStatusIndicator).toBe('success');

    const commands = commandListItems();
    const billing = commands.find((command) => command.host === 'sandbox-1' && command.name === 'billing');
    expect(billing?.serviceStatusName).toBe('Up');
    expect(billing?.serviceStatusIndicator).toBe('success');

    // legacy-portal names a service that does not exist on its host → no state.
    const legacy = commands.find((command) => command.name === 'legacy-portal');
    expect(legacy?.serviceStatusName).toBeUndefined();
    expect(legacy?.serviceStatusIndicator).toBeUndefined();
  });

  test('get 404s for an unknown command', () => {
    expect(mockCommandGet('sandbox-1', 'nope').status).toBe(404);
  });

  test('create adds a command visible in the list and via get', () => {
    const before = COMMANDS.length;
    const result = mockCommandCreate('jar', {
      host: 'sandbox-1',
      name: 'new-svc',
      config: { jarFilename: '/srv/x.jar', serviceName: 'new-svc' },
      apiKeys: { keep: [], add: [{ key: 'k'.repeat(48), owner: 'ci' }] },
    });
    expect(result.status).toBe(200);
    expect(COMMANDS.length).toBe(before + 1);
    const detail = detailOf(mockCommandGet('sandbox-1', 'new-svc').body);
    expect(detail.parameters.jarFilename).toBe('/srv/x.jar');
    expect(detail.apiKeys).toHaveLength(1);
    expect(detail.apiKeys[0].owner).toBe('ci');
  });

  test('create conflicts (409) on a duplicate name for the same host', () => {
    expect(mockCommandCreate('jar', { host: 'sandbox-1', name: 'billing', config: {}, apiKeys: {} }).status).toBe(409);
  });

  test('update merges config and keeps/adds keys (write-only)', () => {
    const keepId = detailOf(mockCommandGet('sandbox-1', 'billing').body).apiKeys[0].maskedId;
    const result = mockCommandUpdate('jar', {
      host: 'sandbox-1',
      name: 'billing',
      config: { jarFilename: '/srv/new.jar', serviceName: 'billing' },
      apiKeys: { keep: [keepId], add: [{ key: 'z'.repeat(48), owner: 'bot' }] },
    });
    expect(result.status).toBe(200);
    const after = detailOf(mockCommandGet('sandbox-1', 'billing').body);
    expect(after.parameters.jarFilename).toBe('/srv/new.jar');
    expect(after.apiKeys.map((key) => key.owner).sort()).toEqual(['bot', 'gitlab-ci']);
  });

  test('update 404s for an unknown command', () => {
    expect(mockCommandUpdate('jar', { host: 'sandbox-1', name: 'ghost', config: {}, apiKeys: {} }).status).toBe(404);
  });

  test('reset restores the seeded commands', () => {
    mockCommandCreate('jar', { host: 'sandbox-1', name: 'temp', config: {}, apiKeys: {} });
    __resetCommandState();
    expect(COMMANDS.some((command) => command.name === 'temp')).toBe(false);
  });
});

describe('serviceViewFor', () => {
  test('parses host/service out of the fqsn', () => {
    const view = serviceViewFor('sandbox-1/echo-svc');
    expect(view.service.host).toBe('sandbox-1');
    expect(view.service.serviceName).toBe('echo-svc');
    expect(view.lastLogLines).toContain('echo-svc');
    expect(view.canUp).toBe(true);
  });
});
