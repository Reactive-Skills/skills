module.exports = ({ event, context }) => {
  const updates = event.payload && event.payload.contextUpdates;
  const runId = (updates && updates.run_id) || context.run_id;
  return typeof runId === 'string' && runId.trim().length > 0;
};
