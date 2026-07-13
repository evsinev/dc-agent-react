import { describe, expect, test } from '@rstest/core';
import { buildDeployUrl, buildUsageSnippets, isUploadType } from './usage-snippets';

describe('isUploadType', () => {
  test('true for binary-upload types, false for fetch-url/docker/unknown', () => {
    expect(isUploadType('JAR')).toBe(true);
    expect(isUploadType('ZIP_DIRS')).toBe(true);
    expect(isUploadType('FETCH_URL')).toBe(false);
    expect(isUploadType('DOCKER')).toBe(false);
    expect(isUploadType(undefined)).toBe(false);
    expect(isUploadType('NONSENSE')).toBe(false);
  });
});

describe('buildDeployUrl', () => {
  test('appends the endpoint path with /dc-agent exactly once', () => {
    expect(buildDeployUrl('http://sandbox-1:8051/dc-agent', 'JAR', 'billing')).toBe(
      'http://sandbox-1:8051/dc-agent/jar/billing',
    );
    // agent url without the context — still yields a single /dc-agent
    expect(buildDeployUrl('http://sandbox-1:8051', 'JAR', 'billing')).toBe(
      'http://sandbox-1:8051/dc-agent/jar/billing',
    );
    // trailing slash on the context is tolerated
    expect(buildDeployUrl('http://sandbox-1:8051/dc-agent/', 'WAR', 'portal')).toBe(
      'http://sandbox-1:8051/dc-agent/war/portal',
    );
  });

  test('keeps {version}/{subdir} placeholders and drops the HTTP method', () => {
    expect(buildDeployUrl('http://h/dc-agent', 'SAVE_ARTIFACT', 'artifacts')).toBe(
      'http://h/dc-agent/save-artifact/artifacts/{version}',
    );
    expect(buildDeployUrl('http://h/dc-agent', 'ZIP_DIRS', 'app')).toBe('http://h/dc-agent/zip-dirs/app/{subdir}');
  });

  test('falls back to a placeholder when the agent url is unknown', () => {
    expect(buildDeployUrl(undefined, 'JAR', 'billing')).toBe('<agent-url>/dc-agent/jar/billing');
  });
});

describe('buildUsageSnippets', () => {
  const url = 'http://sandbox-1:8051/dc-agent/jar/billing';
  const snippets = buildUsageSnippets(url);

  test('every snippet embeds the url, the api-key header, and the artifact', () => {
    for (const snippet of Object.values(snippets)) {
      expect(snippet).toContain(url);
      expect(snippet.toLowerCase()).toContain('api-key:');
      expect(snippet).toContain('package.zip');
    }
  });

  test('gitlab snippets use the folded-YAML block', () => {
    expect(snippets.gitlabCurl).toContain('- >');
    expect(snippets.gitlabCurl).toContain('curl');
    expect(snippets.gitlabWget).toContain('- >');
    expect(snippets.gitlabWget).toContain('wget');
  });
});
