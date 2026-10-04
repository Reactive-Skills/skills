// Shared by both USER_APPROVED transitions: build work starts only from a structurally complete DoD.
// Guards read the stored context before this signal's contextUpdates merge, so check the record this signal would store.
const filled = value => typeof value === 'string' && value.trim().length > 0;

module.exports = ({ event, context }) => {
  const updates = event.payload && event.payload.contextUpdates;
  const record = (updates && updates.dod_record) || context.dod_record;
  if (!record || !filled(record.outcome) || !Array.isArray(record.criteria) || record.criteria.length === 0) return false;
  const ids = record.criteria.map(item => item && item.id);
  return new Set(ids).size === ids.length && record.criteria.every(item => item
    && filled(item.id)
    && filled(item.question)
    && filled(item.expected_result)
    && (item.check_type === 'exact' || item.check_type === 'semantic')
    && filled(item.evidence_method));
};
