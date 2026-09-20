/**
 * Context Sanitizer Middleware Hook
 * Trigger: pre_transition
 * Purpose: Redact secrets and credentials before context reaches LLM
 */

const REDACT_KEYS = [
  'staged_files', 'scan_results', 'secrets_found',
  'credentials_found', 'findings', 'critical_findings'
];

const PATTERNS = [
  /(["']?)(?:api[_-]?key|apikey)(["']?\s*[=:]\s*["']?)([^"'\s,]+)/gi,
  /(["']?)(?:secret|token|bearer|password|passwd|pwd)(["']?\s*[=:]\s*["']?)([^"'\s,]+)/gi,
  /(["']?)(?:_TOKEN|_KEY|_SECRET|_PASSWORD)(["']?\s*[=:]\s*["']?)([^"'\s,]+)/gi,
  /(Bearer|Basic)\s+[A-Za-z0-9._\-+/=]+/gi,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gi,
  /AKIA[0-9A-Z]{16}/gi,
  /ghp_[A-Za-z0-9]{36}/gi,
  /sk-[a-zA-Z0-9]{20,}/gi,
  /eyJ[A-Za-z0-9._-]+/gi
];

function sanitizeValue(value) {
  if (typeof value !== 'string') return value;
  let sanitized = value;
  for (const pattern of PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  return sanitized;
}

function sanitizeObject(obj, depth = 0) {
  if (depth > 5) return '[MAX_DEPTH]';
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeValue(obj);
  if (Array.isArray(obj)) return obj.map(v => sanitizeObject(v, depth + 1));
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(obj)) {
      if (/token|key|secret|password|credential/i.test(key)) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = sanitizeObject(val, depth + 1);
      }
    }
    return result;
  }
  return obj;
}

module.exports = async function contextSanitizer(hookCtx) {
  const { context } = hookCtx;
  const sanitized = sanitizeObject(context);
  for (const key of REDACT_KEYS) {
    if (sanitized[key] !== undefined) {
      sanitized[key] = '[REDACTED_BY_POLICY]';
    }
  }
  return { context: sanitized };
};
