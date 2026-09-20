const rules = {
  'INTAKE -> COLLECT': (context) => context.repository != null && Array.isArray(context.pull_requests) && context.pull_requests.length > 0 && context.triage_policy != null,
  'COLLECT -> CLASSIFY': (context) => Array.isArray(context.collected_items) && context.collected_items.length > 0,
  'CLASSIFY -> ASSESS': (context) => Array.isArray(context.classifications) && context.classifications.length > 0,
  'ASSESS -> ROUTE': (context) => Array.isArray(context.assessments) && context.assessments.length > 0,
  'ROUTE -> REVIEW': (context) => Array.isArray(context.routing_plan) && context.routing_plan.length > 0,
  'REVIEW -> SUCCESS': (context) => context.review_decision === 'approved',
  'REVIEW -> BLOCKED': (context) => context.review_decision === 'blocked'
};

module.exports = async function invariantChecker(hookCtx) {
  const { from_state, to_state, context, on_violation } = hookCtx;
  const rule = rules[`${from_state} -> ${to_state}`];
  if (!rule) return;
  if (!rule(context) && on_violation === 'halt') throw new Error(`Invariant violated: ${from_state} -> ${to_state}`);
};
