const fs = require('fs');
const path = require('path');

let helpersRegistered = false;

function computeDerivedValues(context) {
  if (!context || typeof context !== 'object') return;

  const findings = Array.isArray(context.findings) ? context.findings : [];
  const secrets = Array.isArray(context.secrets_found) ? context.secrets_found : [];
  const credentials = Array.isArray(context.credentials_found) ? context.credentials_found : [];
  const insecure = Array.isArray(context.insecure_configs) ? context.insecure_configs : [];

  context.critical_count = findings.filter(f => f && f.severity === 'critical').length;
  context.high_count = findings.filter(f => f && f.severity === 'high').length;
  context.medium_count = findings.filter(f => f && f.severity === 'medium').length;
  context.low_count = findings.filter(f => f && f.severity === 'low').length;
  context.findings_count = findings.length;

  context.secrets_counts = {
    critical: secrets.filter(f => f && f.severity === 'critical').length,
    high: secrets.filter(f => f && f.severity === 'high').length,
    medium: secrets.filter(f => f && f.severity === 'medium').length,
    low: secrets.filter(f => f && f.severity === 'low').length,
  };
  context.secrets_total = secrets.length;

  context.credentials_counts = {
    critical: credentials.filter(f => f && f.severity === 'critical').length,
    high: credentials.filter(f => f && f.severity === 'high').length,
    medium: credentials.filter(f => f && f.severity === 'medium').length,
    low: credentials.filter(f => f && f.severity === 'low').length,
  };
  context.credentials_total = credentials.length;

  context.config_counts = {
    critical: insecure.filter(f => f && f.severity === 'critical').length,
    high: insecure.filter(f => f && f.severity === 'high').length,
    medium: insecure.filter(f => f && f.severity === 'medium').length,
    low: insecure.filter(f => f && f.severity === 'low').length,
  };
  context.config_total = insecure.length;

  context.timestamp = new Date().toISOString();
  context.total_count = context.critical_count + context.high_count + context.medium_count + context.low_count;
  context.scanned_files_count = Array.isArray(context.staged_files) ? context.staged_files.length : 0;
}

const GUARD_LOGIC = {
  STAGED_FILES: (payload) => Array.isArray(payload.staged_files) && payload.staged_files.length > 0,
  CRITICAL_SECRET_FOUND: (payload) => payload.severity === 'critical',
  SECRETS_SCANNED: (payload) => payload.exit_code === 0,
  CREDENTIALS_SCANNED: (payload) => payload.exit_code === 0,
  CONFIG_SCANNED: (payload) => payload.exit_code === 0,
  USER_APPROVED: (payload) => payload.approved === true,
  REQUEST_REMEDIATION: (payload) => payload.remediation_requested === true,
  USER_REJECTED: (payload) => payload.rejected === true,
};

function runAuditLog(evalContext) {
  try {
    const logDir = path.resolve(process.cwd(), '.reactive');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const redactKeys = ['staged_files', 'scan_results', 'secrets_found', 'credentials_found', 'findings'];
    const redactedContext = {};
    for (const [key, val] of Object.entries(evalContext.context || {})) {
      redactedContext[key] = redactKeys.includes(key) ? '[REDACTED]' : val;
    }

    const auditEntry = {
      skill_id: 'security-scan',
      event_id: evalContext.event.id,
      timestamp: new Date().toISOString(),
      transition: {
        from: evalContext.currentState,
        to: 'pending',
        signal: evalContext.event.payload?.signal || evalContext.event.type,
      },
      context: redactedContext,
    };

    const logFile = path.resolve(logDir, 'security-scan.audit.log');
    fs.appendFileSync(logFile, JSON.stringify(auditEntry) + '\n');
  } catch (err) {
    console.warn('[security-scan] Audit log write failed:', err.message);
  }
}

function runMetrics(evalContext) {
  try {
    const metricsDir = path.resolve(process.cwd(), '.reactive', 'metrics');
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }

    const metricsFile = path.resolve(metricsDir, 'security-scan.prom');
    if (!fs.existsSync(metricsFile)) {
      const header =
        '# TYPE reactive_skill_security_scan_transitions counter\n' +
        '# TYPE reactive_skill_security_scan_current_state gauge\n';
      fs.writeFileSync(metricsFile, header);
    }

    const metricsLine =
      'reactive_skill_security_scan_transitions_total{from="' + (evalContext.currentState || '') + '"} 1\n' +
      'reactive_skill_security_scan_current_state{state="' + (evalContext.currentState || '') + '"} 1\n';

    fs.appendFileSync(metricsFile, metricsLine);
  } catch (err) {
    console.warn('[security-scan] Metrics write failed:', err.message);
  }
}

module.exports = async function guardFunction(evalContext) {
  computeDerivedValues(evalContext.context);
  runAuditLog(evalContext);
  runMetrics(evalContext);

  const payload = evalContext.event.payload || {};
  const signal = payload.signal || evalContext.event.type;

  const guardFn = GUARD_LOGIC[signal];
  if (guardFn) {
    return guardFn(payload);
  }

  return true;
};
