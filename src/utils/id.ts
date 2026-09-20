/**
 * Generates a unique id.
 *
 * crypto.randomUUID needs a secure context, which a plain-HTTP origin is not,
 * so fall back to the timestamp-plus-random form this app used previously.
 */
export const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString() + Math.random().toString(36).slice(2, 11);
};
