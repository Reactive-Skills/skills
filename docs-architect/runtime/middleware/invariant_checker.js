const fs = require('fs');
const path = require('path');

const rules = {
  'INTAKE -> DISCOVER': (context) => Array.isArray(context.source_paths) && context.source_paths.length > 0 && context.audience != null,
  'EXTRACT -> DESIGN': (context) => Array.isArray(context.extracted_facts) && context.extracted_facts.length > 0,
  'DIAGRAM -> VALIDATE': (context) => Array.isArray(context.diagram_inventory) && context.diagram_inventory.length > 0,
  'VALIDATE -> REVIEW': (context) => context.validation_exit_code === 0,
  'REVIEW -> SUCCESS': (context) => context.review_decision === 'approved',
  'REVIEW -> BLOCKED': (context) => context.review_decision === 'rejected'
};

module.exports = async function invariantChecker(hookCtx) {
  const { from_state, to_state, context, on_violation } = hookCtx;
  const rule = rules[`${from_state} -> ${to_state}`];
  if (!rule) return;
  if (!rule(context) && on_violation === 'halt') {
    throw new Error(`Invariant violated: ${from_state} -> ${to_state}`);
  }
};
