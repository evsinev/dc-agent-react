import { afterEach, beforeEach, describe, expect, test } from '@rstest/core';
import {
  APPS,
  GIT_LOG,
  SERVICES,
  __resetGitPullState,
  appStatusFor,
  appViewFor,
  mockGitLog,
  mockGitPull,
  serviceViewFor,
} from './mock-data';

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

describe('serviceViewFor', () => {
  test('parses host/service out of the fqsn', () => {
    const view = serviceViewFor('sandbox-1/echo-svc');
    expect(view.service.host).toBe('sandbox-1');
    expect(view.service.serviceName).toBe('echo-svc');
    expect(view.lastLogLines).toContain('echo-svc');
    expect(view.canUp).toBe(true);
  });
});
