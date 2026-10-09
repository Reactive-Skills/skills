'use strict';

// Pure transition policies. The runtime owns persistence and applies accepted updates.
// Guards validate the shape and internal consistency of supplied records.
// They cannot verify that a measurement, an approval, or a model identifier is true.

const text = value => typeof value === 'string' && value.trim().length > 0;
const list = value => Array.isArray(value) && value.length > 0 && value.every(text);
const number = value => typeof value === 'number' && Number.isFinite(value);
const nonnegative = value => number(value) && value >= 0;
const count = value => Number.isInteger(value) && value >= 0;
const positive = value => Number.isInteger(value) && value > 0;
const unique = values => new Set(values).size === values.length;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sameSet = (a, b) => same([...a].sort(), [...b].sort());
const close = (a, b) => Math.abs(a - b) < 1e-9;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

const keys = ['selected_runtime', 'intake', 'criteria', 'eval_design', 'grading', 'plan_approval',
  'harness', 'run_approval', 'calibration', 'results', 'stop', 'report'];

const DIMENSIONS = ['task_fidelity', 'consistency', 'relevance_coherence', 'tone_style', 'privacy',
  'context_utilization', 'latency', 'price', 'custom'];
const TARGET_SOURCES = ['benchmark', 'baseline', 'expert'];
const METHOD_KIND = {
  exact_match: 'code', string_match: 'code', embedding_cosine: 'code', rouge_l: 'code', operational: 'code',
  llm_binary: 'llm', llm_likert: 'llm', llm_ordinal: 'llm', llm_rubric: 'llm',
  human: 'human'
};
const EDGE_CLASSES = ['missing_or_irrelevant_input', 'overlong_input', 'poor_or_harmful_user_input', 'ambiguous_cases'];
const ONLY_OPTIONAL_EDGE_CLASS = 'poor_or_harmful_user_input';
const PLAN_EXITS = ['plan_only', 'build_harness'];

// A credential must never enter context, the ledger, or projections.
// Only an environment variable name may be recorded.
const SECRET_PATTERN = /\bsk-[A-Za-z0-9_-]{16,}|\bsk-ant-|Bearer\s+[A-Za-z0-9._-]{20,}|(?:api[_-]?key|secret|token|password)["']?\s*[:=]\s*["']?[A-Za-z0-9._\-/+]{12,}/i;
const ENV_NAME = /^[A-Z][A-Z0-9_]*$/;
const absolutePath = value => text(value) && /^(\/|[A-Za-z]:[\\/])/.test(value)
  && !value.split(/[\\/]/).includes('..');
const insideSkill = value => /(^|[\\/])skills[\\/]llm-eval-design([\\/]|$)/.test(value);

function intakeValid(i) {
  return object(i) && text(i.app_task) && text(i.users) && text(i.model_under_test)
    && (i.baseline_prompt_ref === null || text(i.baseline_prompt_ref))
    && object(i.labeled_data) && typeof i.labeled_data.available === 'boolean' && count(i.labeled_data.count)
    && (!i.labeled_data.available || i.labeled_data.count > 0)
    && object(i.constraints) && (i.constraints.latency_ms === null || nonnegative(i.constraints.latency_ms))
    && (i.constraints.budget_usd === null || nonnegative(i.constraints.budget_usd))
    && Array.isArray(i.risk_areas) && i.risk_areas.every(text);
}

const nextRevision = (previous, next) => positive(next) && next === (previous ? previous.revision + 1 : 1);

function criterionValid(c) {
  if (!object(c) || !text(c.id) || !DIMENSIONS.includes(c.dimension) || !text(c.metric)) return false;
  if (!number(c.threshold) || !['>=', '<='].includes(c.comparator)) return false;
  if (!text(c.population) || !TARGET_SOURCES.includes(c.target_source) || !text(c.source_ref)) return false;
  if (!Array.isArray(c.fuzzy_terms) || !c.fuzzy_terms.every(text)) return false;
  if (!Array.isArray(c.definitions) || !c.definitions.every(d => object(d) && text(d.term) && text(d.meaning))) return false;
  if (!c.fuzzy_terms.every(term => c.definitions.some(d => d.term === term))) return false;
  if (c.dimension === 'privacy' && c.includes_negative_cases !== true) return false;
  return true;
}

function criteriaValid(c, intake) {
  return intake !== null && object(c) && Array.isArray(c.items) && c.items.length > 0
    && c.items.every(criterionValid) && unique(c.items.map(item => item.id));
}

function evalDesignValid(e, criteria) {
  if (!criteria || !object(e) || e.criteria_revision !== criteria.revision) return false;
  const ids = criteria.items.map(item => item.id);
  if (!Array.isArray(e.methods) || !sameSet(e.methods.map(m => m?.criterion_id), ids) || !unique(e.methods.map(m => m.criterion_id))) return false;
  if (!e.methods.every(m => METHOD_KIND[m.method] && m.grading === METHOD_KIND[m.method] && text(m.rationale))) return false;
  const cases = e.cases;
  if (!object(cases) || !positive(cases.total_target) || !positive(cases.seed_count) || cases.seed_count > cases.total_target
    || !number(cases.held_out_fraction) || cases.held_out_fraction <= 0 || cases.held_out_fraction > 0.5
    || !text(cases.expansion_plan) || !text(cases.distribution_basis)) return false;
  const edges = e.edge_cases;
  if (!Array.isArray(edges) || !sameSet(edges.map(x => x?.class), EDGE_CLASSES) || !unique(edges.map(x => x.class))) return false;
  return edges.every(x => typeof x.applicable === 'boolean'
    && (x.applicable ? positive(x.example_count) : x.class === ONLY_OPTIONAL_EDGE_CLASS && text(x.not_applicable_reason)));
}

function llmGraderValid(g, intake) {
  const l = g.llm;
  return object(l) && text(l.rubric) && l.rubric_is_golden_answer === false && text(l.output_format)
    && l.reasoning_enabled === true && text(l.grader_model) && l.grader_model !== intake.model_under_test
    && l.malformed_output_policy === 'count_as_grader_error';
}

function gradingValid(g, criteria, design, intake) {
  if (!criteria || !design || !intake || !object(g)) return false;
  if (g.criteria_revision !== criteria.revision || g.eval_design_revision !== design.revision) return false;
  const ids = criteria.items.map(item => item.id);
  if (!Array.isArray(g.graders) || !sameSet(g.graders.map(x => x?.criterion_id), ids) || !unique(g.graders.map(x => x.criterion_id))) return false;
  const methodFor = id => design.methods.find(m => m.criterion_id === id);
  const graders = g.graders.every(x => x.kind === methodFor(x.criterion_id).grading
    && (x.kind !== 'llm' || llmGraderValid(x, intake))
    && (x.kind !== 'human' || text(x.human_reason)));
  if (!graders) return false;
  const needsValidation = g.graders.some(x => x.kind === 'llm');
  if (!needsValidation) return g.validation === null;
  const v = g.validation;
  return object(v) && positive(v.labeled_set_size) && number(v.min_agreement) && v.min_agreement > 0 && v.min_agreement <= 1
    && text(v.method) && text(v.rationale);
}

const revisionsOf = ctx => ({ criteria: ctx.criteria?.revision, eval_design: ctx.eval_design?.revision, grading: ctx.grading?.revision });
const designComplete = ctx => gradingValid(ctx.grading, ctx.criteria, ctx.eval_design, ctx.intake)
  && evalDesignValid(ctx.eval_design, ctx.criteria) && criteriaValid(ctx.criteria, ctx.intake);
const planApproved = (ctx, exit) => designComplete(ctx) && object(ctx.plan_approval) && ctx.plan_approval.approved === true
  && ctx.plan_approval.exit === exit && same(ctx.plan_approval.revisions, revisionsOf(ctx))
  && text(ctx.plan_approval.owner) && text(ctx.plan_approval.source);

function approvalRecord(a, ctx, exit) {
  return object(a) && a.approved === true && PLAN_EXITS.includes(a.exit) && a.exit === exit
    && same(a.revisions, revisionsOf(ctx)) && text(a.owner) && text(a.source);
}

// Model identifiers are verified against current sources at harness and run time.
// The grader must be a different model from the model under test.
const modelIds = (m, ctx) => object(m) && text(m.under_test) && text(m.verified_on) && text(m.verification_source)
  && Array.isArray(m.graders) && m.graders.every(text) && !m.graders.includes(m.under_test)
  && ctx.grading.graders.filter(g => g.kind === 'llm').every(g => m.graders.includes(g.llm.grader_model));

function harnessValid(h, ctx) {
  if (!object(h) || !text(h.language) || !absolutePath(h.output_dir) || insideSkill(h.output_dir) || !list(h.files)) return false;
  if (!same(h.revisions, revisionsOf(ctx))) return false;
  const t = h.deterministic_tests;
  const llmUsed = ctx.grading.graders.some(g => g.kind === 'llm');
  if (!object(t) || t.exit_code !== 0 || !text(t.command) || !positive(t.passed) || t.failed !== 0 || !list(t.evidence_refs)) return false;
  return !llmUsed || modelIds(h.model_ids, ctx);
}

function estimateValid(e, ctx) {
  const llmCalls = ctx.grading.graders.filter(g => g.kind === 'llm').length;
  return object(e) && positive(e.cases) && count(e.grader_calls_per_case) && positive(e.repeats) && nonnegative(e.cost_usd)
    && e.grader_calls_per_case === llmCalls && e.total_calls === e.cases * (1 + e.grader_calls_per_case) * e.repeats
    && e.cases <= ctx.eval_design.cases.total_target;
}

function runApprovalRecord(r, ctx) {
  return object(r) && r.approved === true && estimateValid(r.estimate, ctx) && ENV_NAME.test(r.api_key_env || '')
    && nonnegative(r.max_cost_usd) && r.max_cost_usd >= r.estimate.cost_usd
    && modelIds(r.model_ids, ctx) && text(r.owner) && text(r.source)
    && same(r.revisions, revisionsOf(ctx));
}

const runApproved = ctx => ctx.harness !== null && harnessValid(ctx.harness, ctx) && runApprovalRecord(ctx.run_approval, ctx);
const llmGraders = ctx => ctx.grading.graders.filter(g => g.kind === 'llm');

function calibrationValid(c, ctx) {
  if (!object(c) || !list(c.evidence_refs)) return false;
  const llm = llmGraders(ctx).length > 0;
  if (c.grading_revision !== ctx.grading.revision) return false;
  if (!llm) return c.kind === 'not_required' && c.passed === true && text(c.reason);
  const v = ctx.grading.validation;
  return c.kind === 'observed' && positive(c.labeled_set_size) && c.labeled_set_size >= v.labeled_set_size
    && count(c.agreement_count) && c.agreement_count <= c.labeled_set_size
    && count(c.grader_error_count) && c.grader_error_count <= c.labeled_set_size - c.agreement_count
    && number(c.agreement) && close(c.agreement, c.agreement_count / c.labeled_set_size)
    && c.min_agreement === v.min_agreement && typeof c.passed === 'boolean'
    && c.passed === (c.agreement >= v.min_agreement);
}

function resultsValid(r, ctx) {
  if (!object(r) || r.kind !== 'observed' || !Array.isArray(r.criteria)) return false;
  const items = ctx.criteria.items;
  if (!sameSet(r.criteria.map(x => x?.criterion_id), items.map(item => item.id)) || !unique(r.criteria.map(x => x.criterion_id))) return false;
  const est = ctx.run_approval.estimate;
  if (!count(r.total_calls_made) || r.total_calls_made > est.total_calls || !nonnegative(r.cost_usd) || r.cost_usd > ctx.run_approval.max_cost_usd) return false;
  return r.criteria.every(x => {
    const item = items.find(i => i.id === x.criterion_id);
    const met = item.comparator === '>=' ? x.value >= item.threshold : x.value <= item.threshold;
    return number(x.value) && positive(x.n) && count(x.grader_error_count) && x.grader_error_count <= x.n
      && x.threshold === item.threshold && x.comparator === item.comparator && x.passed === met && list(x.evidence_refs);
  });
}

function reportValid(r, ctx, blocked) {
  if (!object(r) || !text(r.summary) || !Array.isArray(r.limitations) || r.limitations.length === 0 || !r.limitations.every(text)
    || !Array.isArray(r.evidence_refs) || !r.evidence_refs.every(text) || typeof r.claims_measured !== 'boolean') return false;
  if (blocked !== (r.outcome === 'blocked')) return false;
  if (blocked !== (ctx.stop?.kind === 'blocked')) return false;
  switch (r.outcome) {
    case 'plan_only':
      return planApproved(ctx, 'plan_only') && ctx.harness === null && r.claims_measured === false;
    case 'run_declined':
      return planApproved(ctx, 'build_harness') && ctx.harness !== null && ctx.run_approval?.approved === false && r.claims_measured === false;
    case 'run_scored':
      return runApproved(ctx) && calibrationValid(ctx.calibration, ctx) && ctx.calibration.passed === true
        && resultsValid(ctx.results, ctx) && r.claims_measured === true && r.evidence_refs.length > 0;
    case 'cancelled':
      return ctx.stop?.kind === 'cancelled' && r.claims_measured === false;
    case 'blocked':
      return r.claims_measured === false;
    default:
      return false;
  }
}

function check(name, { event, context: ctx }) {
  const p = event.payload || {}, u = p.contextUpdates || {};
  // context_keys deliberately stays empty: top-level fields must never be premerged before guards.
  if (keys.some(key => Object.hasOwn(p, key)) || Object.hasOwn(p, 'signal') && p.signal !== name) return false;
  // Refuse any payload that carries a credential-like value.
  if (SECRET_PATTERN.test(JSON.stringify(p))) return false;
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
        return allow(['intake']) && intakeValid(u.intake);
      case 'CRITERIA_READY':
        return allow(['criteria']) && intakeValid(ctx.intake) && nextRevision(ctx.criteria, u.criteria?.revision)
          && criteriaValid(u.criteria, ctx.intake);
      case 'EVAL_DESIGN_READY':
        return allow(['eval_design']) && criteriaValid(ctx.criteria, ctx.intake)
          && nextRevision(ctx.eval_design, u.eval_design?.revision) && evalDesignValid(u.eval_design, ctx.criteria);
      case 'GRADING_READY':
        return allow(['grading']) && criteriaValid(ctx.criteria, ctx.intake) && evalDesignValid(ctx.eval_design, ctx.criteria)
          && nextRevision(ctx.grading, u.grading?.revision) && gradingValid(u.grading, ctx.criteria, ctx.eval_design, ctx.intake);
      case 'PLAN_APPROVED_FINAL':
        return allow(['plan_approval']) && p.approved === true && designComplete(ctx) && approvalRecord(u.plan_approval, ctx, 'plan_only');
      case 'PLAN_APPROVED_BUILD':
        return allow(['plan_approval']) && p.approved === true && designComplete(ctx) && approvalRecord(u.plan_approval, ctx, 'build_harness');
      case 'REVISE_PLAN':
        return allow(['plan_approval']) && u.plan_approval === null && text(p.reason) && designComplete(ctx);
      case 'HARNESS_READY':
        return allow(['harness']) && planApproved(ctx, 'build_harness') && harnessValid(u.harness, ctx);
      case 'RUN_APPROVED':
        return allow(['run_approval']) && p.approved === true && planApproved(ctx, 'build_harness') && ctx.harness !== null
          && harnessValid(ctx.harness, ctx) && runApprovalRecord(u.run_approval, ctx);
      case 'RUN_DECLINED':
        return allow(['run_approval']) && planApproved(ctx, 'build_harness') && ctx.harness !== null
          && object(u.run_approval) && u.run_approval.approved === false && text(u.run_approval.owner) && text(u.run_approval.source);
      case 'CALIBRATION_PASSED':
        return allow(['calibration']) && runApproved(ctx) && calibrationValid(u.calibration, ctx) && u.calibration.passed === true;
      case 'CALIBRATION_FAILED':
        return allow(['calibration', 'plan_approval', 'harness', 'run_approval']) && runApproved(ctx)
          && calibrationValid(u.calibration, ctx) && u.calibration.passed === false
          && u.plan_approval === null && u.harness === null && u.run_approval === null && text(p.reason);
      case 'SCORING_COMPLETE':
        return allow(['results']) && runApproved(ctx) && calibrationValid(ctx.calibration, ctx) && ctx.calibration.passed === true
          && resultsValid(u.results, ctx);
      case 'CANCEL':
        return allow(['stop']) && u.stop?.kind === 'cancelled' && text(u.stop.reason) && event.state !== 'ACTIVE.FINALIZE';
      case 'DEPENDENCY_FAILED':
        return allow(['stop']) && u.stop?.kind === 'blocked' && text(u.stop.reason) && event.state !== 'ACTIVE.FINALIZE';
      case 'REPORT_READY':
        return allow(['report']) && reportValid(u.report, ctx, false);
      case 'REPORT_BLOCKED':
        return allow(['report']) && reportValid(u.report, ctx, true);
      default: return false;
    }
  } catch { return false; }
}

module.exports = { check, criteriaValid, evalDesignValid, gradingValid, harnessValid, calibrationValid, resultsValid, estimateValid };
