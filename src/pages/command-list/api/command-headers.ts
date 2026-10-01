// A `headers` config field (zip-archive-version `reloadHeaders`) as the operator returns it in
// `parameters`: the command detail (`command/get`) carries the stored object as JSON text
// (`{"Authorization":"Bearer …"}`); the command list carries only the names (`Authorization, X-Trace`)
// — the agent masks the values there, and the list shows them as they come.

export type HeaderPair = { name: string; value: string };

/** The stored headers of a command detail, or null when the text is not a JSON object of strings. */
export function parseStoredHeaders(raw: string | undefined): HeaderPair[] | null {
  if (raw === undefined || raw === '') {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }
  const pairs: HeaderPair[] = [];
  for (const [name, value] of Object.entries(parsed)) {
    if (typeof value !== 'string') {
      return null;
    }
    pairs.push({ name, value });
  }
  return pairs;
}

/**
 * Header names of a command detail, for display — never a value. A text that is not a JSON object
 * of strings is hidden whatever it looks like: a hand-written `reloadHeaders: tok_SECRET` is the
 * secret itself.
 */
export function headerNames(raw: string | undefined): string {
  if (raw === undefined || raw === '') {
    return '—';
  }
  const pairs = parseStoredHeaders(raw);
  if (pairs === null) {
    return '(hidden: not a name → value object)';
  }
  return pairs.length > 0 ? pairs.map((pair) => pair.name).join(', ') : '—';
}
