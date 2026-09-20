const rules = {
  'INTAKE -> CONFIGURE': (context) => context.target_dir != null && context.test_command != null && context.coverage_command != null && context.thresholds != null,
  'BASELINE -> MEASURE': (context) => context.baseline_exit_code === 0,
  'MEASURE -> ANALYZE': (context) => context.coverage_report != null && context.coverage_metrics != null,
  'ANALYZE -> GATE': (context) => context.coverage_metrics != null && Array.isArray(context.coverage_gaps),
  'GATE -> SUCCESS': (context) => context.gate_decision === 'approved',
  'GATE -> BLOCKED': (context) => context.gate_decision === 'blocked'
};

module.exports = async function invariantChecker(hookCtx) {
  const { from_state, to_state, context, on_violation } = hookCtx;
  const rule = rules[`${from_state} -> ${to_state}`];
  if (!rule) return;
  if (!rule(context) && on_violation === 'halt') throw new Error(`Invariant violated: ${from_state} -> ${to_state}`);
};
