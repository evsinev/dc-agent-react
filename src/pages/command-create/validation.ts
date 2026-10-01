import { API_KEY_LENGTH } from '@/libs/generate-api-key';
import type { FieldDef } from '@/pages/command-list/api/command-types';
import * as z from 'zod';

// Cloudscape validation: field messages are sentence-case and actionable. Rules mirror the
// backend `CommandValidator` so the client and server agree.

const NAME_RE = /^[0-9a-zA-Z._-]+$/;
const SERVICE_RE = /^[0-9a-zA-Z._-]+$/;
const EXTENSION_RE = /^[0-9a-zA-Z]+$/;
const API_KEY_RE = /^[A-Za-z0-9_]+$/;

// zip-archive-version — the agent's `Units` and `SegmentNames`. Never stricter than the agent: a
// value it accepts must pass here (a false refusal would block saving an existing command); what
// only the agent can judge (positivity of a duration, a Java regex) is left to its 400.
const SIZE_RE = /^[0-9]{1,18}(?:[kmg]b?)?$/i;
const COUNT_RE = /^[0-9]{1,18}k?$/i;
const DURATION_RE = /^PT(?:[+-]?\d+H)?(?:[+-]?\d+M)?(?:[+-]?\d+(?:[.,]\d{0,9})?S)?$/;
const SEGMENT_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const HEADER_NAME_RE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const HEADER_VALUE_RE = /^[\t\x20-\x7e]*$/;
// Refused by the JDK HTTP client the agent uses for the reload call.
const RESTRICTED_HEADERS = new Set(['connection', 'content-length', 'expect', 'host', 'upgrade']);

/** As `Units.parseDuration`: upper-cased, `PT` prepended unless present, then the `Duration.parse` time part. */
export function isDuration(value: string): boolean {
  const upper = value.toUpperCase();
  const text = upper.startsWith('PT') ? upper : `PT${upper}`;
  return text !== 'PT' && DURATION_RE.test(text);
}

/** Lexical `Path.normalize()` of an absolute path: `//` collapsed, `.` dropped, `..` pops, no trailing `/`. */
export function normalizePath(path: string): string {
  const segments: string[] = [];
  for (const segment of path.split('/')) {
    if (segment === '' || segment === '.') {
      continue;
    }
    if (segment === '..') {
      segments.pop();
    } else {
      segments.push(segment);
    }
  }
  return `/${segments.join('/')}`;
}

/** zip-archive-version: `versionFile` must lie directly in `dir` and be one name segment. */
export function validateVersionFileInDir(dir: string, versionFile: string): string | undefined {
  if (!dir.trim().startsWith('/') || !versionFile.trim().startsWith('/')) {
    return undefined; // the per-field rule reports it
  }
  const file = normalizePath(versionFile.trim());
  const slash = file.lastIndexOf('/');
  const parent = slash === 0 ? '/' : file.slice(0, slash);
  if (parent !== normalizePath(dir.trim())) {
    return 'versionFile must lie directly in dir.';
  }
  if (!SEGMENT_RE.test(file.slice(slash + 1))) {
    return 'The file name must be 1–64 of A–Z a–z 0–9 . _ -, starting with a letter or digit.';
  }
  return undefined;
}

export type HeaderRow = { rowId: string; name: string; value: string };

/** Per-row errors of a headers editor, keyed `name-<rowId>` / `value-<rowId>`. Duplicates: exact names only. */
export function validateHeaders(rows: HeaderRow[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row.name) {
      errors[`name-${row.rowId}`] = 'Header name is required.';
    } else if (!HEADER_NAME_RE.test(row.name)) {
      errors[`name-${row.rowId}`] = "Use letters, digits and ! # $ % & ' * + - . ^ _ ` | ~ only.";
    } else if (RESTRICTED_HEADERS.has(row.name.toLowerCase())) {
      errors[`name-${row.rowId}`] = `${row.name} is set by the agent and cannot be configured.`;
    } else if (seen.has(row.name)) {
      errors[`name-${row.rowId}`] = `${row.name} is listed twice.`;
    }
    seen.add(row.name);
    if (!HEADER_VALUE_RE.test(row.value)) {
      errors[`value-${row.rowId}`] = 'Use visible ASCII characters, spaces and tabs only.';
    }
  }
  return errors;
}

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required.')
  .regex(NAME_RE, 'Only letters, digits, . _ - are allowed.');

function firstIssue(result: z.SafeParseReturnType<unknown, unknown>): string | undefined {
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateName(name: string): string | undefined {
  return firstIssue(nameSchema.safeParse(name));
}

// A per-field schema built from the registry entry: required fields must be non-empty and match
// their format; optional fields accept an empty string or a well-formed value.
function fieldSchema(field: FieldDef): z.ZodTypeAny {
  let filled: z.ZodTypeAny;
  switch (field.kind) {
    case 'path':
      filled = z.string().regex(/^\//, 'Enter an absolute path that starts with /.');
      break;
    case 'url':
      filled = z.string().regex(/^https?:\/\//i, 'Enter a valid URL that starts with http:// or https://.');
      break;
    case 'size':
      filled = z.string().regex(SIZE_RE, 'Enter a size like 50mb, 512k or 10 (bytes).');
      break;
    case 'count':
      filled = z.string().regex(COUNT_RE, 'Enter a count like 10k or 500.');
      break;
    case 'duration':
      filled = z.string().refine(isDuration, 'Enter a duration like 30s or 5m.');
      break;
    case 'text':
      if (field.key === 'serviceName') {
        filled = z.string().regex(SERVICE_RE, 'Only letters, digits, . _ - are allowed.');
      } else if (field.key === 'extension') {
        filled = z.string().regex(EXTENSION_RE, 'Only letters and digits are allowed (no dot).');
      } else {
        filled = z.string();
      }
      break;
    default:
      filled = z.string();
  }
  if (field.required) {
    return z.intersection(z.string().min(1, `${field.label} is required.`), filled);
  }
  return z.union([z.literal(''), filled]);
}

export function validateField(field: FieldDef, raw: string | boolean | undefined): string | undefined {
  if (field.kind === 'boolean' || field.kind === 'headers') {
    return undefined; // headers: per row, see validateHeaders
  }
  const text = typeof raw === 'string' ? raw : '';
  // a raw field is sent as typed, so it is checked as typed
  const value = field.raw ? text : text.trim();
  return firstIssue(fieldSchema(field).safeParse(value));
}

export function validateOwner(owner: string): string | undefined {
  return owner.trim() ? undefined : 'Owner label is required.';
}

export function validateApiKeySecret(secret: string): string | undefined {
  return secret.length === API_KEY_LENGTH && API_KEY_RE.test(secret)
    ? undefined
    : `API key must be ${API_KEY_LENGTH} characters: A–Z, a–z, 0–9, _.`;
}
