import { COMMAND_TYPES } from '@/pages/command-list/api/command-types';
import { describe, expect, test } from '@rstest/core';
import {
  isDuration,
  normalizePath,
  validateApiKeySecret,
  validateField,
  validateHeaders,
  validateName,
  validateOwner,
  validateVersionFileInDir,
} from './validation';

// Registry order is fixed: JAR = [jarFilename, serviceName, waitUrl].
const [jarFilename, serviceName, waitUrl] = COMMAND_TYPES.JAR.fields;
// SAVE_ARTIFACT = [dir, extension, replaceDirChars].
const extension = COMMAND_TYPES.SAVE_ARTIFACT.fields[1];

describe('validateName', () => {
  test('requires a value', () => {
    expect(validateName('')).toBe('Name is required.');
    expect(validateName('   ')).toBe('Name is required.');
  });
  test('rejects disallowed characters', () => {
    expect(validateName('bad name')).toMatch(/Only letters/);
    expect(validateName('bad/name')).toMatch(/Only letters/);
  });
  test('accepts letters, digits, . _ -', () => {
    expect(validateName('billing')).toBeUndefined();
    expect(validateName('ok.name-1_2')).toBeUndefined();
  });
});

describe('validateField', () => {
  test('required path must be absolute', () => {
    expect(validateField(jarFilename, '')).toMatch(/required/);
    expect(validateField(jarFilename, 'relative/app.jar')).toMatch(/absolute path/);
    expect(validateField(jarFilename, '/srv/app.jar')).toBeUndefined();
  });
  test('serviceName enforces the name charset', () => {
    expect(validateField(serviceName, 'bad name')).toMatch(/Only letters/);
    expect(validateField(serviceName, 'billing')).toBeUndefined();
  });
  test('optional url is skipped when empty, validated when present', () => {
    expect(validateField(waitUrl, '')).toBeUndefined();
    expect(validateField(waitUrl, 'localhost:8080')).toMatch(/valid URL/);
    expect(validateField(waitUrl, 'http://127.0.0.1/health')).toBeUndefined();
  });
  test('optional extension rejects a dot', () => {
    expect(validateField(extension, '')).toBeUndefined();
    expect(validateField(extension, 'ap.k')).toMatch(/letters and digits/);
    expect(validateField(extension, 'apk')).toBeUndefined();
  });
});

describe('validateOwner / validateApiKeySecret', () => {
  test('owner is required', () => {
    expect(validateOwner('')).toBe('Owner label is required.');
    expect(validateOwner('gitlab-ci')).toBeUndefined();
  });
  test('secret must be exactly 48 chars from the charset', () => {
    expect(validateApiKeySecret('short')).toMatch(/48 characters/);
    expect(validateApiKeySecret(`bad*${'a'.repeat(44)}`)).toMatch(/48 characters/);
    expect(validateApiKeySecret('a'.repeat(48))).toBeUndefined();
  });
});

describe('zip-archive-version values (as the agent Units)', () => {
  const field = (key: string) => {
    const found = COMMAND_TYPES.ZIP_ARCHIVE_VERSION.fields.find((f) => f.key === key);
    if (!found) {
      throw new Error(key);
    }
    return found;
  };

  test('sizes', () => {
    for (const good of ['50mb', '50MB', '512k', '512kb', '10', '2g', '']) {
      expect(validateField(field('maxBytes'), good)).toBeUndefined();
    }
    for (const bad of ['5x', '-1', '1.5m', '10b', 'mb', '10 mb']) {
      expect(validateField(field('maxBytes'), bad)).toBeDefined();
    }
  });

  test('counts', () => {
    for (const good of ['10k', '10K', '500']) {
      expect(validateField(field('maxEntries'), good)).toBeUndefined();
    }
    for (const bad of ['1.5k', '10m', 'k', '-1']) {
      expect(validateField(field('maxEntries'), bad)).toBeDefined();
    }
  });

  test('durations: never stricter than Duration.parse with PT prepended', () => {
    for (const good of ['30s', '5m', '1h30m', 'PT5M', 'pt5m', 'PT+5M', 'PT1M-30S', '1.5s', '1,5s', '1.s']) {
      expect(isDuration(good)).toBe(true);
    }
    for (const bad of ['5x', '1.5m', '', 'PT', 'm', 'P1D', '5 m']) {
      expect(isDuration(bad)).toBe(false);
    }
    expect(validateField(field('waitTimeout'), 'PT5M')).toBeUndefined();
    expect(validateField(field('waitTimeout'), '1.5m')).toBeDefined();
  });

  test('a raw field is checked as typed, an optional empty one passes', () => {
    expect(validateField(field('reloadBody'), '  {"v":"${version}"}\n')).toBeUndefined();
    expect(validateField(field('reloadBody'), '')).toBeUndefined();
  });

  test('url scheme in any case, as the agent', () => {
    expect(validateField(field('reloadUrl'), 'HTTP://127.0.0.1/reload')).toBeUndefined();
    expect(validateField(field('reloadUrl'), 'ftp://x')).toBeDefined();
  });
});

describe('versionFile lies directly in dir', () => {
  test('after a lexical normalisation of both, as Path.normalize()', () => {
    expect(normalizePath('/opt//b/./c/../d/')).toBe('/opt/b/d');
    expect(validateVersionFileInDir('/opt/b', '/opt/b/current')).toBeUndefined();
    expect(validateVersionFileInDir('/opt/b/', '/opt/b/./current')).toBeUndefined();
    expect(validateVersionFileInDir('/opt//b', '/opt/x/../b/current')).toBeUndefined();
  });

  test('elsewhere or a bad name is refused', () => {
    expect(validateVersionFileInDir('/opt/b', '/opt/current')).toBe('versionFile must lie directly in dir.');
    expect(validateVersionFileInDir('/opt/b', '/opt/b/sub/current')).toBe('versionFile must lie directly in dir.');
    expect(validateVersionFileInDir('/opt/b', '/opt/b/.current')).toMatch(/file name/);
    expect(validateVersionFileInDir('/opt/b', '/opt/b/-current')).toMatch(/file name/);
    // relative paths: reported by the per-field rule, not here
    expect(validateVersionFileInDir('opt/b', 'opt/b/current')).toBeUndefined();
  });
});

describe('headers', () => {
  const row = (rowId: string, name: string, value: string) => ({ rowId, name, value });

  test('names are tokens, restricted ones and exact duplicates are refused', () => {
    const errors = validateHeaders([
      row('1', 'Authorization', 'Bearer t'),
      row('2', 'Bad Name', 'x'),
      row('3', 'Host', 'evil'),
      row('4', 'Authorization', 'again'),
      row('5', '', 'x'),
    ]);
    expect(Object.keys(errors).sort()).toEqual(['name-2', 'name-3', 'name-4', 'name-5']);
  });

  test('names differing only in case are two headers, as the agent keeps them', () => {
    expect(validateHeaders([row('1', 'X-Tag', 'a'), row('2', 'x-tag', 'b')])).toEqual({});
  });

  test('values: visible ASCII, spaces and tabs', () => {
    expect(validateHeaders([row('1', 'A', ' Bearer\tt ')])).toEqual({});
    expect(Object.keys(validateHeaders([row('1', 'A', 'x\r\nInjected: 1')]))).toEqual(['value-1']);
    expect(Object.keys(validateHeaders([row('1', 'A', 'x\u000b')]))).toEqual(['value-1']);
    expect(Object.keys(validateHeaders([row('1', 'A', 'é')]))).toEqual(['value-1']);
  });
});
