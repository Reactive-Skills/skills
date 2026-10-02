'use strict';

// Pure transition policies. The runtime owns persistence and applies accepted updates.
const text = value => typeof value === 'string' && value.trim().length > 0;
const list = value => Array.isArray(value) && value.length > 0 && value.every(text);
const number = value => typeof value === 'number' && Number.isFinite(value);
const nonnegative = value => number(value) && value >= 0;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const unique = values => new Set(values).size === values.length;
const safePath = value => text(value) && !/[\\:]/.test(value) && !value.startsWith('/')
  && value.split('/').every(part => part !== '' && part !== '.' && part !== '..');
const contains = (root, file) => file.toLowerCase() === root.toLowerCase()
  || file.toLowerCase().startsWith(root.toLowerCase() + '/');
const keys = ['selected_runtime', 'task', 'contract', 'approval', 'calibration', 'baseline', 'incumbent',
  'proposal', 'trial', 'assessment', 'progress', 'history', 'pause', 'confirmation', 'consumed_confirmation_cases', 'stop', 'report'];

function contractValid(c) {
  if (!c || !text(c.id) || !Number.isInteger(c.revision) || c.revision < 1 || !text(c.goal) || !text(c.hypothesis)) return false;
  if (!c.metric || !text(c.metric.name) || !['min', 'max'].includes(c.metric.direction)
    || !nonnegative(c.metric.minimum_improvement) || c.metric.comparison !== 'paired-margin') return false;
  const groups = [c.development_cases, c.selection_cases, c.confirmation_cases];
  if (!groups.every(list) || !unique(groups.flat())) return false;
  if (!list(c.editable_paths) || !list(c.protected_paths)
    || ![...c.editable_paths, ...c.protected_paths].every(safePath)
    || c.editable_paths.some(file => c.protected_paths.some(root => contains(root, file) || contains(file, root)))) return false;
  const e = c.evaluator;
  if (!e || !text(e.id) || !text(e.version) || !text(e.digest) || !text(e.command)
    || !text(e.environment_id) || !text(e.evidence_method) || !list(e.good_refs) || !list(e.bad_refs)
    || !['enforced', 'reviewed_limitations'].includes(e.isolation) || !text(e.isolation_ref)) return false;
  const b = c.budget;
  return Number.isInteger(c.min_repeats) && c.min_repeats >= 2 && list(c.crucial_criteria) && unique(c.crucial_criteria)
    && Number.isInteger(b?.max_trials) && b.max_trials > 0 && number(b.max_seconds) && b.max_seconds > 0
    && nonnegative(b.max_cost) && number(b.trial_seconds) && b.trial_seconds > 0 && nonnegative(b.trial_cost)
    && number(b.confirmation_seconds) && b.confirmation_seconds > 0 && nonnegative(b.confirmation_cost)
    && b.trial_seconds + b.confirmation_seconds <= b.max_seconds
    && b.trial_cost + b.confirmation_cost <= b.max_cost && text(c.promotion_policy) && text(c.stop_policy);
}
const bound = (record, c) => record && record.contract_id === c?.id && record.revision === c.revision;
const approved = ctx => contractValid(ctx.contract) && bound(ctx.approval, ctx.contract)
  && ctx.approval.approved === true && text(ctx.approval.owner) && text(ctx.approval.source);
function progressValid(p) {
  return p && Number.isInteger(p.trials) && p.trials >= 0 && nonnegative(p.seconds) && nonnegative(p.cost);
}
function withinBudget(ctx, trial = false) {
  const p = ctx.progress, b = ctx.contract?.budget;
  return progressValid(p) && b && (!trial || p.trials < b.max_trials)
    && p.seconds + b.confirmation_seconds + (trial ? b.trial_seconds : 0) <= b.max_seconds
    && p.cost + b.confirmation_cost + (trial ? b.trial_cost : 0) <= b.max_cost;
}
const zero = p => progressValid(p) && p.trials === 0 && p.seconds === 0 && p.cost === 0;
function progressAdvanced(old, next, increment) {
  return progressValid(old) && progressValid(next) && next.trials === old.trials + increment
    && next.seconds >= old.seconds && next.cost >= old.cost;
}
function measurementValid(m, c, cases) {
  return bound(m, c) && m.kind === 'observed' && m.status === 'measured'
    && m.evaluator_id === c.evaluator.id && m.evaluator_version === c.evaluator.version
    && m.evaluator_digest === c.evaluator.digest && m.environment_id === c.evaluator.environment_id
    && list(m.case_ids) && same([...m.case_ids].sort(), [...cases].sort())
    && list(m.evidence_refs) && text(m.artifact_id)
    && Array.isArray(m.samples) && m.samples.length >= c.min_repeats
    && m.samples.every(s => s && text(s.key) && number(s.value)) && unique(m.samples.map(s => s.key))
    && Array.isArray(m.criteria) && same([...m.criteria.map(s => s?.id)].sort(), [...c.crucial_criteria].sort())
    && m.criteria.every(s => typeof s.passed === 'boolean');
}
const crucialPass = m => m.criteria.every(s => s.passed === true);
function compare(base, candidate, c) {
  if (!crucialPass(candidate)) return 'worse';
  if (!same(base.samples.map(s => s.key).sort(), candidate.samples.map(s => s.key).sort())) return 'invalid';
  const sign = c.metric.direction === 'max' ? 1 : -1;
  const deltas = candidate.samples.map(s => sign * (s.value - base.samples.find(b => b.key === s.key).value));
  const mean = deltas.reduce((sum, value) => sum + value / deltas.length, 0);
  if (!deltas.every(number) || !number(mean)) return 'invalid';
  if (mean > 0 && mean >= c.metric.minimum_improvement && deltas.every(value => value > 0)) return 'improved';
  if (mean < 0 && deltas.every(value => value <= 0)) return 'worse';
  return 'inconclusive';
}
const selected = ctx => ctx.incumbent && ctx.incumbent.id !== 'baseline';
function historyValid(ctx, u, outcome) {
  const h = u.history;
  return Array.isArray(h) && h.length === ctx.history.length + 1
    && same(h.slice(0, -1), ctx.history) && h.at(-1)?.candidate_id === ctx.proposal.id
    && h.at(-1)?.outcome === outcome && list(h.at(-1)?.evidence_refs);
}

function check(name, { event, context: ctx }) {
  const p = event.payload || {}, u = p.contextUpdates || {}, c = ctx.contract;
  // context_keys deliberately stays empty: top-level fields must never be premerged before guards.
  if (keys.some(key => Object.hasOwn(p, key)) || Object.hasOwn(p, 'signal') && p.signal !== name) return false;
  const allow = names => Object.keys(u).every(key => names.includes(key));
  try {
    switch (name) {
      case 'RUNTIME_READY':
        return allow(['selected_runtime']) && p.compatible === true && u.selected_runtime?.compatible === true
          && /^\d+\.\d+\.\d+$/.test(u.selected_runtime.runtime_version)
          && (() => { const v = u.selected_runtime.runtime_version.split('.').map(Number); return v[0] > 0 || v[1] >= 16; })()
          && ['runtime.bootloader', 'runtime.transport_handshake', 'runtime.accepted_update_replay']
            .every(cap => u.selected_runtime.capabilities?.includes(cap))
          && u.selected_runtime.parent_dispatch_verified === true;
      case 'SETUP_REQUIRED': return allow([]) && p.compatible === false && text(p.reason);
      case 'INTAKE_READY':
        return allow(['task', 'contract', 'progress']) && text(u.task?.question) && text(u.task?.artifact)
          && contractValid(u.contract) && zero(u.progress);
      case 'CONTRACT_APPROVED':
        return allow(['approval']) && contractValid(c) && p.approved === true && bound(u.approval, c)
          && u.approval.approved === true && text(u.approval.source) && text(u.approval.owner);
      case 'CALIBRATION_PASSED':
        return allow(['calibration', 'progress']) && approved(ctx) && bound(u.calibration, c)
          && u.calibration.good_passed === true && u.calibration.bad_failed === true
          && u.calibration.kind === 'observed' && list(u.calibration.evidence_refs)
          && progressAdvanced(ctx.progress, u.progress, 0);
      case 'BASELINE_MEASURED':
        return allow(['baseline', 'incumbent', 'progress']) && approved(ctx) && ctx.calibration?.good_passed === true
          && measurementValid(u.baseline, c, c.selection_cases) && crucialPass(u.baseline)
          && u.incumbent?.id === 'baseline' && same(u.incumbent.measurement, u.baseline)
          && progressAdvanced(ctx.progress, u.progress, 0) && withinBudget({ ...ctx, progress: u.progress }, true);
      case 'DIAGNOSIS_READY':
        return allow(['assessment']) && approved(ctx) && text(u.assessment?.diagnosis) && list(u.assessment.evidence_refs);
      case 'PROPOSAL_READY':
        return allow(['proposal', 'trial']) && approved(ctx) && withinBudget(ctx, true) && u.trial === null
          && bound(u.proposal, c) && text(u.proposal.id) && u.proposal.id !== 'baseline' && text(u.proposal.hypothesis)
          && !ctx.history.some(h => h.candidate_id === u.proposal.id) && list(u.proposal.changed_paths)
          && u.proposal.changed_paths.every(file => safePath(file) && c.editable_paths.includes(file))
          && text(u.proposal.artifact_ref) && u.proposal.reversible === true;
      case 'TRIAL_MEASURED':
        return allow(['trial', 'progress']) && approved(ctx) && ctx.proposal
          && measurementValid(u.trial, c, c.selection_cases) && u.trial.artifact_id === ctx.proposal.id
          && progressAdvanced(ctx.progress, u.progress, 1);
      case 'TRIAL_FAILED':
      case 'TRIAL_INVALID':
        return allow(['trial', 'progress']) && approved(ctx) && bound(u.trial, c)
          && u.trial.artifact_id === ctx.proposal?.id && u.trial.status === (name === 'TRIAL_FAILED' ? 'failed' : 'invalid')
          && text(u.trial.reason) && list(u.trial.evidence_refs) && progressAdvanced(ctx.progress, u.progress, 1);
      case 'CANDIDATE_ACCEPTED': {
        return allow(['assessment', 'incumbent', 'history']) && approved(ctx)
          && measurementValid(ctx.trial, c, c.selection_cases)
          && compare(ctx.incumbent.measurement, ctx.trial, c) === 'improved'
          && u.incumbent?.id === ctx.proposal.id && same(u.incumbent.measurement, ctx.trial)
          && u.assessment?.outcome === 'improved' && historyValid(ctx, u, 'improved');
      }
      case 'CANDIDATE_REJECTED': {
        const outcome = ['failed', 'invalid'].includes(ctx.trial?.status) ? ctx.trial.status
          : measurementValid(ctx.trial, c, c.selection_cases) ? compare(ctx.incumbent.measurement, ctx.trial, c) : 'invalid';
        return allow(['assessment', 'history']) && ['worse', 'inconclusive', 'invalid', 'failed'].includes(outcome)
          && u.assessment?.outcome === outcome && historyValid(ctx, u, outcome);
      }
      case 'SEARCH_FINISHED':
        return allow(['stop', 'consumed_confirmation_cases']) && approved(ctx) && selected(ctx) && withinBudget(ctx)
          && c.confirmation_cases.every(id => !ctx.consumed_confirmation_cases.includes(id))
          && same(u.consumed_confirmation_cases, [...ctx.consumed_confirmation_cases, ...c.confirmation_cases])
          && u.stop?.kind === 'selected'
          && text(u.stop.reason) && event.state !== 'ACTIVE.TRIAL.ASSESS'
          && event.state !== 'ACTIVE.TRIAL.RUN';
      case 'NO_CANDIDATE':
        return allow(['stop']) && !selected(ctx) && text(u.stop?.reason) && u.stop.kind === 'no_improvement';
      case 'BUDGET_EXHAUSTED':
        return allow(['stop', 'progress']) && c && (u.progress === undefined || progressAdvanced(ctx.progress, u.progress, 0))
          && !withinBudget({ ...ctx, progress: u.progress || ctx.progress }, true)
          && text(u.stop?.reason) && u.stop.kind === 'budget';
      case 'CONFIRMATION_MEASURED': {
        const result = u.confirmation;
        return allow(['confirmation', 'progress']) && approved(ctx) && selected(ctx) && ctx.confirmation === null
          && bound(result, c) && result.candidate_id === ctx.incumbent.id
          && measurementValid(result.baseline, c, c.confirmation_cases) && crucialPass(result.baseline)
          && measurementValid(result.candidate, c, c.confirmation_cases)
          && result.baseline.artifact_id === 'baseline' && result.candidate.artifact_id === ctx.incumbent.id
          && result.outcome === compare(result.baseline, result.candidate, c)
          && progressAdvanced(ctx.progress, u.progress, 0);
      }
      case 'CANCEL': return allow(['stop']) && u.stop?.kind === 'cancelled' && text(u.stop.reason);
      case 'DEPENDENCY_FAILED': return allow(['stop']) && u.stop?.kind === 'blocked' && text(u.stop.reason);
      case 'CONTRACT_CHANGED':
        return allow(['contract', 'approval', 'calibration', 'baseline', 'incumbent', 'proposal', 'trial', 'confirmation', 'progress'])
          && contractValid(u.contract) && u.contract.id === c?.id && u.contract.revision === c.revision + 1 && text(p.reason)
          && !['ACTIVE.TRIAL.RUN', 'ACTIVE.CONFIRM'].includes(event.state)
          && u.contract.confirmation_cases.every(id => !ctx.consumed_confirmation_cases.includes(id))
          && ['approval', 'calibration', 'baseline', 'incumbent', 'proposal', 'trial', 'confirmation'].every(key => u[key] === null)
          && same(u.progress, ctx.progress);
      case 'PAUSE': {
        const leaf = event.state;
        const phase = { 'ACTIVE.INTAKE': 'intake', 'ACTIVE.CONTRACT': 'contract', 'ACTIVE.CALIBRATE': 'calibration',
          'ACTIVE.BASELINE': 'baseline', 'ACTIVE.CONFIRM': 'finalize', 'ACTIVE.FINALIZE': 'finalize' }[leaf]
          || (leaf?.startsWith('ACTIVE.TRIAL.') ? 'search' : null);
        return allow(['pause']) && phase && text(u.pause?.reason) && u.pause.resume_phase === phase
          && u.pause.reconciled === false && u.pause.pending_trial === (leaf === 'ACTIVE.TRIAL.RUN')
          && u.pause.pending_confirmation === (leaf === 'ACTIVE.CONFIRM');
      }
      case 'RESUME_INTAKE':
      case 'RESUME_CONTRACT':
      case 'RESUME_CALIBRATION':
      case 'RESUME_BASELINE':
      case 'RESUME_SEARCH':
      case 'RESUME_FINALIZE': {
        const phase = name.slice(7).toLowerCase();
        const increment = ctx.pause?.pending_trial ? 1 : 0;
        return allow(['pause', 'progress']) && ctx.pause?.resume_phase === phase && u.pause?.reconciled === true
          && same({ ...u.pause, reconciled: false, evidence_refs: undefined }, { ...ctx.pause, evidence_refs: undefined })
          && list(u.pause.evidence_refs) && progressAdvanced(ctx.progress, u.progress, increment)
          && (['intake','contract','finalize'].includes(phase) || approved(ctx))
          && (phase !== 'baseline' || ctx.calibration?.good_passed === true && ctx.calibration.bad_failed === true)
          && (phase !== 'search' || ctx.baseline);
      }
      case 'REPORT_READY':
      case 'REPORT_BLOCKED': {
        const r = u.report;
        const isBlocked = name === 'REPORT_BLOCKED';
        return allow(['report', 'progress']) && r?.cleanup_complete === true && list(r.evidence_refs) && Array.isArray(r.limitations)
          && text(r.summary) && r.incumbent_id === (ctx.incumbent?.id || 'none')
          && typeof r.claimed_improvement === 'boolean'
          && progressValid(u.progress) && u.progress.trials >= ctx.progress.trials
          && u.progress.seconds >= ctx.progress.seconds && u.progress.cost >= ctx.progress.cost
          && (!r.claimed_improvement || ctx.confirmation?.outcome === 'improved')
          && (isBlocked ? ctx.stop?.kind === 'blocked' : ctx.stop?.kind !== 'blocked');
      }
      default: return false;
    }
  } catch { return false; }
}

module.exports = { check, contractValid, compare, measurementValid, withinBudget };
