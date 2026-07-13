import { API_KEY_LENGTH } from '@/libs/generate-api-key';
import type { FieldDef } from '@/pages/command-list/api/command-types';
import * as z from 'zod';

// Cloudscape validation: field messages are sentence-case and actionable. Rules mirror the
// backend `CommandValidator` so the client and server agree.

const NAME_RE = /^[0-9a-zA-Z._-]+$/;
const SERVICE_RE = /^[0-9a-zA-Z._-]+$/;
const EXTENSION_RE = /^[0-9a-zA-Z]+$/;
const API_KEY_RE = /^[A-Za-z0-9_]+$/;

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
      filled = z.string().regex(/^https?:\/\//, 'Enter a valid URL that starts with http:// or https://.');
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
  if (field.kind === 'boolean') {
    return undefined;
  }
  const value = (typeof raw === 'string' ? raw : '').trim();
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
