const fs = require('fs');
const path = require('path');

module.exports = async function audit(hookCtx) {
  const { skill_id, from_state, to_state, signal, event_id, context } = hookCtx;
  const logDir = path.resolve(process.cwd(), '.reactive');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const entry = { skill_id, event_id, timestamp: new Date().toISOString(), transition: { from: from_state, to: to_state, signal }, guard_evaluated: context._last_guard || null };
  fs.appendFileSync(path.resolve(logDir, `${skill_id}.audit.log`), JSON.stringify(entry) + '\n');
};
