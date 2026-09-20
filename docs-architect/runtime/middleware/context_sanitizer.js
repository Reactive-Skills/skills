const PATTERNS = [
  /(["']?)(?:api[_-]?key|apikey)(["']?\s*[=:]\s*["']?)([^"'\s,]+)/gi,
  /(["']?)(?:secret|token|bearer|password|passwd|pwd)(["']?\s*[=:]\s*["']?)([^"'\s,]+)/gi,
  /(["']?)(?:_TOKEN|_KEY|_SECRET|_PASSWORD)(["']?\s*[=:]\s*["']?)([^"'\s,]+)/gi,
  /(Bearer|Basic)\s+[A-Za-z0-9._\-+/=]+/gi,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gi
];

function sanitize(value) {
  if (typeof value !== 'string') return value;
  return PATTERNS.reduce((result, pattern) => result.replace(pattern, '[REDACTED]'), value);
}

function sanitizeObject(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return sanitize(value);
  if (Array.isArray(value)) return value.map(sanitizeObject);
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      /token|key|secret|password/i.test(key) ? key : key,
      /token|key|secret|password/i.test(key) ? '[REDACTED]' : sanitizeObject(item)
    ]));
  }
  return value;
}

module.exports = async function contextSanitizer(hookCtx) {
  return { context: sanitizeObject(hookCtx.context) };
};
