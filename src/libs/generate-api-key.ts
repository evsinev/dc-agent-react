// API keys authorize CI callers to invoke a command's deploy endpoint. New keys are generated
// client-side (the server stores them and only ever returns masked ids). Charset matches the
// backend validation `^[A-Za-z0-9_]+$`.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
export const API_KEY_LENGTH = 48;

/**
 * Generate a random API key of `length` characters from `[A-Za-z0-9_]` using
 * `crypto.getRandomValues`, with rejection sampling to keep the distribution unbiased.
 */
export function generateApiKey(length: number = API_KEY_LENGTH): string {
  // Largest multiple of the alphabet size that fits in a byte — bytes at/above it are rejected.
  const limit = Math.floor(256 / ALPHABET.length) * ALPHABET.length;
  const buffer = new Uint8Array(length);
  let out = '';
  while (out.length < length) {
    crypto.getRandomValues(buffer);
    for (let i = 0; i < buffer.length && out.length < length; i++) {
      if (buffer[i] < limit) {
        out += ALPHABET[buffer[i] % ALPHABET.length];
      }
    }
  }
  return out;
}
