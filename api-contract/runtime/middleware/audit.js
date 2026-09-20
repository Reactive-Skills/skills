/**
 * Audit Middleware Hook
 * Trigger: post_transition
 * Purpose: Immutable transition audit log for compliance
 * Destination: .reactive/api-contract.audit.log
 */

const fs = require('fs');
const path = require('path');

module.exports = async function audit(hookCtx) {
  const { skill_id, from_state, to_state, signal, event_id, context } = hookCtx;
  
  const logDir = path.resolve(process.cwd(), '.reactive');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
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
    guard_evaluated: context._last_guard || null
  };
  
  const logFile = path.resolve(logDir, `${skill_id}.audit.log`);
  fs.appendFileSync(logFile, JSON.stringify(auditEntry) + '\n');
};
