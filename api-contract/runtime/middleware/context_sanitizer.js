/**
 * Context Sanitizer Middleware Hook
 * Trigger: pre_transition
 * Purpose: Redact secrets and credentials before context is bound to LLM
 */

const PATTERNS = [
  /(["']?)(?:api[_-]?key|apikey)(["']?\s*[=:]\s*["']?)([^"'\s,]+)/gi,
  /(["']?)(?:secret|token|bearer|password|passwd|pwd)(["']?\s*[=:]\s*["']?)([^"'\s,]+)/gi,
  /(["']?)(?:_TOKEN|_KEY|_SECRET|_PASSWORD)(["']?\s*[=:]\s*["']?)([^"'\s,]+)/gi,
  /(Bearer|Basic)\s+[A-Za-z0-9._\-+/=]+/gi,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gi
];

function sanitizeValue(value) {
  if (typeof value !== 'string') return value;
  let sanitized = value;
  for (const pattern of PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  return sanitized;
}

function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeValue(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(obj)) {
      if (/token|key|secret|password/i.test(key)) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = sanitizeObject(val);
      }
    }
    return result;
  }
  return obj;
}

module.exports = async function contextSanitizer(hookCtx) {
  const { context } = hookCtx;
  const sanitized = sanitizeObject(context);
  
  // Return sanitized context — runtime replaces context before binding to LLM
  return { context: sanitized };
};
