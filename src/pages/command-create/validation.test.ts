import { COMMAND_TYPES } from '@/pages/command-list/api/command-types';
import { describe, expect, test } from '@rstest/core';
import { validateApiKeySecret, validateField, validateName, validateOwner } from './validation';

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
