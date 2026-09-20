/**
 * Invariant Checker Middleware Hook
 * Trigger: post_transition
 * Purpose: Verify context constraints after each state transition
 * Rules: runtime/hooks/invariants.yaml
 */

const fs = require('fs');
const path = require('path');

const INVARIANTS = {
  'DISCOVER_APIS -> VALIDATION_PIPELINE': (ctx) => {
    return Boolean(ctx.api_spec_path) && Array.isArray(ctx.client_code_paths) && ctx.client_code_paths.length > 0;
  },
  'SCHEMA_VALIDATION -> DRIFT_DIFFING': (ctx) => {
    return Boolean(ctx.spec_schema);
  },
  'DRIFT_DIFFING -> DRIFT_ANALYSIS': (ctx) => {
    return Array.isArray(ctx.drift_findings) && Array.isArray(ctx.client_endpoints);
  },
  'DRIFT_ANALYSIS -> REPORT': (ctx) => {
    return Array.isArray(ctx.drift_findings);
  },
  'REPORT -> GATE': (ctx) => {
    return Array.isArray(ctx.coverage_matrix) || Object.keys(ctx.coverage_matrix || {}).length > 0;
  }
};

module.exports = async function invariantChecker(hookCtx) {
  const { from_state, to_state, context, on_violation } = hookCtx;
  const key = `${from_state} -> ${to_state}`;
  const rule = INVARIANTS[key];
  
  if (!rule) return; // No invariant for this transition
  
  const passed = rule(context);
  if (!passed && on_violation === 'halt') {
    throw new Error(`Invariant violated: transition ${key} failed context validation`);
  } else if (!passed) {
    console.warn(`WARNING: Invariant check failed for transition ${key}`);
  }
};
