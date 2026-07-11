import { describe, expect, test } from '@rstest/core';
import { APPS, GIT_LOG, SERVICES, appStatusFor, appViewFor, serviceViewFor } from './mock-data';

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

describe('serviceViewFor', () => {
  test('parses host/service out of the fqsn', () => {
    const view = serviceViewFor('sandbox-1/echo-svc');
    expect(view.service.host).toBe('sandbox-1');
    expect(view.service.serviceName).toBe('echo-svc');
    expect(view.lastLogLines).toContain('echo-svc');
    expect(view.canUp).toBe(true);
  });
});
