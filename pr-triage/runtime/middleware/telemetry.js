module.exports = async function telemetry(hookCtx) {
  const { skill_id, from_state, to_state, signal, event_id, timestamp } = hookCtx;
  console.log(JSON.stringify({ type: 'telemetry', skill_id, from_state, to_state, signal, event_id, timestamp: timestamp || new Date().toISOString() }));
};
