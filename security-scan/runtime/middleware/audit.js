/**
 * Audit Middleware Hook
 * Trigger: post_transition
 * Purpose: Immutable audit log for compliance (security scan results)
 * Destination: .reactive/security-scan.audit.log
 */

const fs = require('fs');
const path = require('path');

module.exports = async function audit(hookCtx) {
  const { skill_id, from_state, to_state, signal, event_id } = hookCtx;

  const logDir = path.resolve(process.cwd(), '.reactive');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const redactedContext = {};
  const redactKeys = ['staged_files', 'scan_results', 'secrets_found', 'credentials_found', 'findings'];

  for (const [key, val] of Object.entries(hookCtx.context || {})) {
    if (redactKeys.includes(key)) {
      redactedContext[key] = '[REDACTED]';
    } else {
      redactedContext[key] = val;
    }
  }

  const auditEntry = {
    skill_id,
    event_id,
    timestamp: new Date().toISOString(),
    transition: {
      from: from_state,
      to: to_state,
      signal
    },
    context: redactedContext
  };

  const logFile = path.resolve(logDir, `${skill_id}.audit.log`);
  fs.appendFileSync(logFile, JSON.stringify(auditEntry) + '\n');
};
