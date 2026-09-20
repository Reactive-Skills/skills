/**
 * Invariant Checker Middleware Hook
 * Trigger: post_transition
 * Purpose: Verify context constraints after each state transition
 * Rules: runtime/hooks/invariants.yaml
 */

const INVARIANTS = {
  'COLLECT_STAGED -> SCAN_PIPELINE': (ctx) => {
    return Array.isArray(ctx.staged_files) && ctx.staged_files.length > 0;
  },
  'SCAN_PIPELINE -> REPORT': (ctx) => {
    return Array.isArray(ctx.scan_results) &&
           Array.isArray(ctx.findings) &&
           Array.isArray(ctx.secrets_found) &&
           Array.isArray(ctx.credentials_found);
  },
  'REPORT -> GATE': (ctx) => {
    return Array.isArray(ctx.findings) && Array.isArray(ctx.remediation_steps);
  }
};

module.exports = async function invariantChecker(hookCtx) {
  const { from_state, to_state, context, on_violation } = hookCtx;
  const key = `${from_state} -> ${to_state}`;
  const rule = INVARIANTS[key];

  if (!rule) return;

  const passed = rule(context);
  if (!passed && on_violation === 'halt') {
    throw new Error(`Invariant violated: transition ${key} failed context validation`);
  } else if (!passed) {
    console.warn(`WARNING: Invariant check failed for transition ${key}`);
  }
};
