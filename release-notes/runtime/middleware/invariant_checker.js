const rules = {
  'INTAKE -> COLLECT': (context) => context.repository != null && context.release_version != null && Array.isArray(context.scope_refs) && context.scope_refs.length > 0,
  'COLLECT -> CLASSIFY': (context) => Array.isArray(context.commits) && context.commits.length > 0,
  'CLASSIFY -> COMPOSE': (context) => Array.isArray(context.changelog_entries) && context.changelog_entries.length > 0,
  'COMPOSE -> VALIDATE': (context) => context.release_notes != null && context.release_notes.length > 0,
  'VALIDATE -> REVIEW': (context) => context.validation_exit_code === 0,
  'REVIEW -> SUCCESS': (context) => context.review_decision === 'approved',
  'REVIEW -> BLOCKED': (context) => context.review_decision === 'blocked'
};

module.exports = async function invariantChecker(hookCtx) {
  const { from_state, to_state, context, on_violation } = hookCtx;
  const rule = rules[`${from_state} -> ${to_state}`];
  if (!rule) return;
  if (!rule(context) && on_violation === 'halt') throw new Error(`Invariant violated: ${from_state} -> ${to_state}`);
};
