'use strict';
// Synthetic acceptance measurements establish workflow behavior, not optimization effectiveness.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const { test } = require('node:test');
const policy = require('./policy.cjs');
const skillDir = path.resolve(__dirname, '..');
const coverage = new Map();
let runtimePromise;
function runtime() {
  if (!runtimePromise) {
    let entry = process.env.EXPERIMENT_LOOP_RUNTIME;
    if (!entry) {
      try { entry = require.resolve('@reactive-skills/runtime'); }
      catch {
        const globalRoot = execFileSync('rtk', ['npm','root','-g'], { encoding:'utf8' }).trim();
        entry = createRequire(path.join(globalRoot,'@reactive-skills/axi/package.json')).resolve('@reactive-skills/runtime');
      }
    }
    runtimePromise = import(pathToFileURL(path.resolve(entry)).href);
  }
  return runtimePromise;
}
async function fixture(t) {
  const { FSMEngine } = await runtime();
  const workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(),'experiment-loop-test-'));
  const engines = [];
  const open = jobId => { const engine = new FSMEngine({skillDir,workspaceDir,jobId,initialContext:{}}); engines.push(engine); return engine; };
  t.after(() => {
    for (const engine of engines) engine.getEventStore().close();
    const target = fs.realpathSync(workspaceDir);
    assert.equal(path.dirname(target),fs.realpathSync(os.tmpdir()));
    assert.match(path.basename(target),/^experiment-loop-test-/);
    fs.rmSync(target,{recursive:true,force:true,maxRetries:3});
  });
  return { engine:open('synthetic-acceptance'),open,workspaceDir };
}
const clone = value => structuredClone(value);
const contract = () => ({
  id:'synthetic-contract',revision:1,goal:'Synthetic workflow acceptance, not an actual task improvement',
  hypothesis:'Synthetic bounded change improves the fixture metric while crucial criteria remain satisfied',
  metric:{name:'synthetic-score',direction:'max',minimum_improvement:1,comparison:'paired-margin'},
  development_cases:['dev-1'],selection_cases:['select-1'],confirmation_cases:['confirm-1'],
  editable_paths:['candidate/prompt.md'],protected_paths:['evaluator','confirmation'],
  evaluator:{id:'synthetic-evaluator',version:'1',digest:'fixture-digest',command:'fixture-only',environment_id:'fixture',
    evidence_method:'synthetic acceptance fixture',good_refs:['fixture:good'],bad_refs:['fixture:bad'],isolation:'enforced',isolation_ref:'fixture:host'},
  min_repeats:2,crucial_criteria:['correct'],
  budget:{max_trials:3,max_seconds:100,max_cost:10,trial_seconds:10,trial_cost:1,confirmation_seconds:10,confirmation_cost:1},
  promotion_policy:'Fixture only, never promote',stop_policy:'Stop after bounded synthetic trials'
});
const bound = c => ({contract_id:c.id,revision:c.revision});
const measurement = (c,id,values=[10,10],cases=c.selection_cases) => ({
  ...bound(c),kind:'observed',status:'measured',artifact_id:id,
  evaluator_id:c.evaluator.id,evaluator_version:c.evaluator.version,evaluator_digest:c.evaluator.digest,
  environment_id:c.evaluator.environment_id,case_ids:cases,evidence_refs:['fixture:raw-output'],
  samples:values.map((value,index)=>({key:'repeat-'+index,value})),criteria:[{id:'correct',passed:true}]
});
const payload = (updates,extra={}) => ({...extra,contextUpdates:updates});
async function signal(engine,name,updates,state,extra={}) {
  const from=engine.getCurrentState();
  const key=from+':'+name;
  assert.equal((await engine.handleSignal(name,{})).transitioned,false,name+' rejects incomplete inputs');
  const result=await engine.handleSignal(name,payload(updates,extra));
  assert.equal(result.transitioned,true,name+': '+JSON.stringify(result));
  assert.equal(engine.getCurrentState(),state,name);
  coverage.set(key,name);
  return result;
}
async function reject(engine,name,updates,extra={}) {
  const state=engine.getCurrentState(), before=clone(engine.getContext());
  assert.equal((await engine.handleSignal(name,payload(updates,extra))).transitioned,false,name);
  assert.equal(engine.getCurrentState(),state);
  assert.deepEqual(engine.getContext(),before,'rejection preserves live context');
}
async function boot(engine) {
  await signal(engine,'RUNTIME_READY',{selected_runtime:{compatible:true,runtime_version:'0.16.0',parent_dispatch_verified:true,
    capabilities:['runtime.bootloader','runtime.transport_handshake','runtime.accepted_update_replay']}},'ACTIVE.INTAKE',{compatible:true});
}
async function intake(engine,c=contract()) {
  await boot(engine);
  await signal(engine,'INTAKE_READY',{task:{question:c.goal,artifact:'fixture:original'},contract:c,progress:{trials:0,seconds:0,cost:0}},'ACTIVE.CONTRACT');
}
async function approve(engine) {
  const c=engine.getContext().contract;
  await signal(engine,'CONTRACT_APPROVED',{approval:{...bound(c),approved:true,owner:'Fixture user',source:'fixture:explicit-approval'}},'ACTIVE.CALIBRATE',{approved:true});
}
async function calibrate(engine) {
  const c=engine.getContext().contract;
  await signal(engine,'CALIBRATION_PASSED',{calibration:{...bound(c),kind:'observed',good_passed:true,bad_failed:true,evidence_refs:['fixture:calibration']},progress:engine.getContext().progress},'ACTIVE.BASELINE');
}
async function baseline(engine,progress={trials:0,seconds:1,cost:0}) {
  const c=engine.getContext().contract, m=measurement(c,'baseline');
  await signal(engine,'BASELINE_MEASURED',{baseline:m,incumbent:{id:'baseline',measurement:m},progress},'ACTIVE.TRIAL.DIAGNOSE');
}
async function ready(engine,c=contract()) { await intake(engine,c);await approve(engine);await calibrate(engine);await baseline(engine); }
async function propose(engine,id='candidate-1') {
  await signal(engine,'DIAGNOSIS_READY',{assessment:{diagnosis:'Synthetic failure diagnosis',evidence_refs:['fixture:diagnosis']}},'ACTIVE.TRIAL.PROPOSE');
  const c=engine.getContext().contract;
  await signal(engine,'PROPOSAL_READY',{proposal:{...bound(c),id,hypothesis:'Synthetic bounded intervention',changed_paths:['candidate/prompt.md'],artifact_ref:'fixture:'+id,reversible:true},trial:null},'ACTIVE.TRIAL.RUN');
}
async function measured(engine,values=[12,12],mutate=()=>{}) {
  const ctx=engine.getContext(),m=measurement(ctx.contract,ctx.proposal.id,values);mutate(m);
  await signal(engine,'TRIAL_MEASURED',{trial:m,progress:{trials:ctx.progress.trials+1,seconds:ctx.progress.seconds+1,cost:ctx.progress.cost}},'ACTIVE.TRIAL.ASSESS');
}
async function assess(engine,outcome='improved') {
  const ctx=engine.getContext();
  const u={assessment:{outcome},history:[...ctx.history,{candidate_id:ctx.proposal.id,outcome,evidence_refs:['fixture:comparison']}]};
  if(outcome==='improved')u.incumbent={id:ctx.proposal.id,measurement:ctx.trial};
  await signal(engine,outcome==='improved'?'CANDIDATE_ACCEPTED':'CANDIDATE_REJECTED',u,'ACTIVE.TRIAL.DIAGNOSE');
}
async function selected(engine) {await ready(engine);await propose(engine);await measured(engine);await assess(engine);}
async function confirmStart(engine) {await signal(engine,'SEARCH_FINISHED',{stop:{kind:'selected',reason:'Synthetic stopping condition'},
  consumed_confirmation_cases:[...engine.getContext().consumed_confirmation_cases,...engine.getContext().contract.confirmation_cases]},'ACTIVE.CONFIRM');}
async function confirm(engine,outcome='improved') {
  const ctx=engine.getContext(),c=ctx.contract;
  const values=outcome==='improved'?[12,12]:[10,10];
  await signal(engine,'CONFIRMATION_MEASURED',{confirmation:{...bound(c),candidate_id:ctx.incumbent.id,
    baseline:measurement(c,'baseline',[10,10],c.confirmation_cases),candidate:measurement(c,ctx.incumbent.id,values,c.confirmation_cases),outcome},
    progress:{...ctx.progress,seconds:ctx.progress.seconds+1}},'ACTIVE.FINALIZE');
}
async function report(engine,blocked=false,claim=false) {
  await signal(engine,blocked?'REPORT_BLOCKED':'REPORT_READY',{report:{summary:'Synthetic workflow acceptance only',
    incumbent_id:engine.getContext().incumbent?.id||'none',cleanup_complete:true,evidence_refs:['fixture:cleanup'],
    limitations:['Synthetic measurements, no empirical effectiveness claim'],claimed_improvement:claim},progress:engine.getContext().progress},blocked?'BLOCKED':'COMPLETE');
}
async function pause(engine,phase,pendingTrial=false,pendingConfirmation=false) {
  await signal(engine,'PAUSE',{pause:{reason:'Synthetic interruption',resume_phase:phase,pending_trial:pendingTrial,
    pending_confirmation:pendingConfirmation,reconciled:false}},'PAUSED');
}
async function resume(engine,phase,state) {
  const ctx=engine.getContext();
  await signal(engine,'RESUME_'+phase.toUpperCase(),{pause:{...ctx.pause,reconciled:true,evidence_refs:['fixture:reconciliation']},
    progress:{...ctx.progress,trials:ctx.progress.trials+(ctx.pause.pending_trial?1:0),seconds:ctx.progress.seconds+1}},state);
}

test('guard rejection preserves protected records after reopening the same job',async t=>{
  const {engine,open}=await fixture(t);await ready(engine);await propose(engine);
  const before=clone(engine.getContext());
  await reject(engine,'TRIAL_MEASURED',{contract:{...before.contract,goal:'Invalid attempted contract replacement'}});
  const restored=open('synthetic-acceptance');
  assert.equal(restored.getJobId(),engine.getJobId());
  assert.deepEqual(restored.getContext().contract,before.contract,'rejected nested updates must never become persistent context');
});

test('approval and complete nonoverlapping contracts are required',async t=>{
  const {engine}=await fixture(t);await boot(engine);
  for(const change of [c=>delete c.hypothesis,c=>delete c.evaluator,c=>c.confirmation_cases=c.selection_cases,c=>c.editable_paths=['EVALUATOR/tool.js'],c=>c.editable_paths=['../tool.js']]) {
    const c=contract();change(c);await reject(engine,'INTAKE_READY',{task:{question:'fixture',artifact:'fixture'},contract:c,progress:{trials:0,seconds:0,cost:0}});
  }
  await signal(engine,'INTAKE_READY',{task:{question:'fixture',artifact:'fixture'},contract:contract(),progress:{trials:0,seconds:0,cost:0}},'ACTIVE.CONTRACT');
  await reject(engine,'CONTRACT_APPROVED',{approval:{...bound(contract()),approved:false,owner:'fixture',source:'fixture'}},{approved:true});
  assert.equal((await engine.handleSignal('PROPOSAL_READY',{})).transitioned,false);
  await approve(engine);
  await reject(engine,'CALIBRATION_PASSED',{calibration:{...bound(contract()),kind:'simulated',good_passed:true,bad_failed:true,evidence_refs:['fixture']}});
  await calibrate(engine);await baseline(engine);
});
test('invalid measured evidence cannot advance or alter retained records',async t=>{
  const {engine}=await fixture(t);await ready(engine);await propose(engine);
  const changes=[m=>m.kind='predicted',m=>m.kind='simulated',m=>m.samples[0].value=NaN,m=>m.samples[0].value=Infinity,
    m=>m.evidence_refs=[],m=>m.case_ids=['confirm-1'],m=>m.evaluator_digest='changed',m=>m.environment_id='different',
    m=>m.revision=2,m=>m.artifact_id='different',m=>m.criteria=[]];
  for(const change of changes){const m=measurement(contract(),'candidate-1',[12,12]);change(m);
    await reject(engine,'TRIAL_MEASURED',{trial:m,progress:{trials:1,seconds:2,cost:0}});}
  const before=clone(engine.getContext());
  await reject(engine,'TRIAL_MEASURED',{}, {contract:{...before.contract,goal:'attempted bypass'}});
  await reject(engine,'TRIAL_MEASURED',{trial:measurement(contract(),'candidate-1',[12,12]),progress:{trials:1,seconds:2,cost:0}},{signal:'TRIAL_INVALID'});
  await measured(engine);await assess(engine);
});
for(const [name,values,mutate,outcome] of [
  ['crucial regression',[20,20],m=>m.criteria[0].passed=false,'worse'],
  ['mixed repeated differences',[12,9],()=>{},'inconclusive'],
  ['below practical margin',[10.5,10.5],()=>{},'inconclusive'],
  ['uniform deterioration',[9,9],()=>{},'worse'],
  ['mismatched paired keys',[20,20],m=>m.samples[0].key='other','invalid']
]) test(name+' does not replace incumbent',async t=>{
  const {engine}=await fixture(t);await ready(engine);await propose(engine);await measured(engine,values,mutate);
  await reject(engine,'CANDIDATE_ACCEPTED',{assessment:{outcome:'improved'},incumbent:{id:'candidate-1',measurement:engine.getContext().trial},
    history:[{candidate_id:'candidate-1',outcome:'improved',evidence_refs:['fixture']}]});
  await assess(engine,outcome);assert.equal(engine.getContext().incumbent.id,'baseline');
});
for(const status of ['failed','invalid'])test(status+' execution retains evidence without replacing incumbent',async t=>{
  const {engine}=await fixture(t);await ready(engine);await propose(engine);
  await signal(engine,'TRIAL_'+status.toUpperCase(),{trial:{...bound(contract()),artifact_id:'candidate-1',status,reason:'Synthetic failure',evidence_refs:['fixture:failure']},
    progress:{trials:1,seconds:2,cost:0}},'ACTIVE.TRIAL.ASSESS');await assess(engine,status);
  assert.equal(engine.getContext().incumbent.id,'baseline');
});
test('confirmed improvement reaches runtime report with isolated projections',async t=>{
  const {engine,workspaceDir,open}=await fixture(t);await selected(engine);await confirmStart(engine);await confirm(engine);await report(engine,false,true);
  assert.deepEqual(engine.getEventStore().query({type:'PROJECTION_FAILED'}).map(e=>e.payload),[],'all declared projections render');
  const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else files.push(p);}}
  walk(path.join(workspaceDir,'.docs'));
  const reports=files.filter(file=>file.endsWith('report.md'));assert.ok(reports.length>0);
  assert.match(fs.readFileSync(reports[0],'utf8'),/Synthetic workflow acceptance only/);
  assert.match(fs.readFileSync(reports[0],'utf8'),/Claimed confirmed improvement: true/);
  const inventories=files.filter(file=>file.endsWith('inventory.json'));assert.ok(inventories.length>0);
  for(const file of inventories) assert.equal(JSON.parse(fs.readFileSync(file,'utf8')).state,'COMPLETE');
  const another=open('second-synthetic-job');await boot(another);
  assert.notEqual(another.getJobId(),engine.getJobId());assert.equal(another.getContext().contract,null);
  assert.equal(engine.getCurrentState(),'COMPLETE');
});
test('failed confirmation cannot support an improvement claim or another confirmation',async t=>{
  const {engine}=await fixture(t);await selected(engine);await confirmStart(engine);await confirm(engine,'inconclusive');
  await reject(engine,'REPORT_READY',{report:{summary:'Unsupported claim',incumbent_id:'candidate-1',cleanup_complete:true,evidence_refs:['fixture'],limitations:[],claimed_improvement:true}});
  assert.equal((await engine.handleSignal('CONFIRMATION_MEASURED',{})).transitioned,false);
  await report(engine);
});
test('contract revisions cannot recycle consumed confirmation cases',async t=>{
  const {engine}=await fixture(t);await selected(engine);await confirmStart(engine);await confirm(engine);
  const ctx=clone(engine.getContext());const reset={contract:{...ctx.contract,revision:2},progress:ctx.progress,
    ...Object.fromEntries(['approval','calibration','baseline','incumbent','proposal','trial','confirmation'].map(key=>[key,null]))};
  await reject(engine,'CONTRACT_CHANGED',reset,{reason:'Unsafe reuse of confirmation'});
  reset.contract.confirmation_cases=['new-confirmation'];
  await signal(engine,'CONTRACT_CHANGED',reset,'ACTIVE.CONTRACT',{reason:'Fresh untouched cases'});
  assert.deepEqual(engine.getContext().consumed_confirmation_cases,['confirm-1']);
});
test('baseline budget overrun is recorded before stopping',async t=>{
  const {engine}=await fixture(t);await intake(engine);await approve(engine);await calibrate(engine);
  const progress={trials:0,seconds:99,cost:0};
  await signal(engine,'BUDGET_EXHAUSTED',{progress,stop:{kind:'budget',reason:'Actual baseline work exhausted allowance'}},'ACTIVE.FINALIZE');
  assert.deepEqual(engine.getContext().progress,progress);await report(engine);
});
for(const kind of ['trials','seconds','cost'])test(kind+' budget exhaustion prevents new trials',async t=>{
  const {engine}=await fixture(t);const c=contract();if(kind==='trials')c.budget.max_trials=1;
  await ready(engine,c);await propose(engine);
  const progress={trials:1,seconds:kind==='seconds'?90:2,cost:kind==='cost'?9:0};
  await signal(engine,'TRIAL_MEASURED',{trial:measurement(c,'candidate-1',[10,10]),progress},'ACTIVE.TRIAL.ASSESS');await assess(engine,'inconclusive');
  await signal(engine,'DIAGNOSIS_READY',{assessment:{diagnosis:'fixture',evidence_refs:['fixture']}},'ACTIVE.TRIAL.PROPOSE');
  await reject(engine,'PROPOSAL_READY',{proposal:{...bound(c),id:'candidate-2',hypothesis:'fixture',changed_paths:c.editable_paths,artifact_ref:'fixture',reversible:true},trial:null});
  await signal(engine,'BUDGET_EXHAUSTED',{stop:{kind:'budget',reason:'Fixture budget exhausted'}},'ACTIVE.FINALIZE');await report(engine);
});
test('reserved confirmation remains possible after trial count is exhausted',async t=>{
  const {engine}=await fixture(t);const c=contract();c.budget.max_trials=1;
  await ready(engine,c);await propose(engine);await measured(engine);await assess(engine);await confirmStart(engine);await confirm(engine);await report(engine,false,true);
});
test('parent cancellation reaches cleanup from active execution',async t=>{
  const {engine}=await fixture(t);await ready(engine);await propose(engine);
  const result=await signal(engine,'CANCEL',{stop:{kind:'cancelled',reason:'Fixture cancel'}},'ACTIVE.FINALIZE');
  assert.ok(result.handledAtDepth<4);assert.equal(engine.getContext().incumbent.id,'baseline');await report(engine);
});
test('dependency failure has a blocked report',async t=>{
  const {engine}=await fixture(t);await ready(engine);
  await signal(engine,'DEPENDENCY_FAILED',{stop:{kind:'blocked',reason:'Fixture missing evaluator'}},'ACTIVE.FINALIZE');await report(engine,true);
});
test('no candidate reports no improvement honestly',async t=>{
  const {engine}=await fixture(t);await ready(engine);
  await signal(engine,'NO_CANDIDATE',{stop:{kind:'no_improvement',reason:'Fixture has no supported candidate'}},'ACTIVE.FINALIZE');await report(engine);
});
test('revised contract invalidates dependent records and preserves spent budget',async t=>{
  const {engine}=await fixture(t);await selected(engine);const ctx=clone(engine.getContext()),c={...ctx.contract,revision:2};
  const reset={contract:c,progress:ctx.progress,...Object.fromEntries(['approval','calibration','baseline','incumbent','proposal','trial','confirmation'].map(key=>[key,null]))};
  await reject(engine,'CONTRACT_CHANGED',{...reset,progress:{trials:0,seconds:0,cost:0}},{reason:'Fixture revision'});
  await signal(engine,'CONTRACT_CHANGED',reset,'ACTIVE.CONTRACT',{reason:'Fixture revision'});
  assert.equal(engine.getContext().approval,null);assert.deepEqual(engine.getContext().progress,ctx.progress);await approve(engine);
});
for(const [phase,state,setup] of [
  ['intake','ACTIVE.INTAKE',boot],['contract','ACTIVE.CONTRACT',intake],
  ['calibration','ACTIVE.CALIBRATE',async e=>{await intake(e);await approve(e);}],
  ['baseline','ACTIVE.BASELINE',async e=>{await intake(e);await approve(e);await calibrate(e);}],
  ['search','ACTIVE.TRIAL.DIAGNOSE',ready],['finalize','ACTIVE.FINALIZE',async e=>{await ready(e);await signal(e,'CANCEL',{stop:{kind:'cancelled',reason:'fixture'}},'ACTIVE.FINALIZE');}]
])test('pause and recover '+phase+' only after reconciliation',async t=>{
  const {engine,open}=await fixture(t);await setup(engine);await pause(engine,phase);
  const restored=open('synthetic-acceptance');assert.equal(restored.getJobId(),engine.getJobId());assert.equal(restored.getCurrentState(),'PAUSED');
  await reject(restored,'RESUME_'+phase.toUpperCase(),{pause:{...restored.getContext().pause,reconciled:false},progress:restored.getContext().progress});
  await resume(restored,phase,state);
});
test('interrupted external trial counts once without blind replay',async t=>{
  const {engine,open}=await fixture(t);await ready(engine);await propose(engine);
  await pause(engine,'search',true);const restored=open('synthetic-acceptance');await resume(restored,'search','ACTIVE.TRIAL.DIAGNOSE');
  assert.equal(restored.getContext().progress.trials,1);
});
test('interrupted confirmation finalizes without reusing its cases',async t=>{
  const {engine}=await fixture(t);await selected(engine);await confirmStart(engine);
  await reject(engine,'PAUSE',{pause:{reason:'Skip to search',resume_phase:'search',pending_trial:false,pending_confirmation:true,reconciled:false}});
  await pause(engine,'finalize',false,true);await resume(engine,'finalize','ACTIVE.FINALIZE');await report(engine);
});
test('paused cancellation and dependency failure reach cleanup',async t=>{
  for(const blocked of [false,true]){const {engine}=await fixture(t);await ready(engine);await pause(engine,'search');
    await signal(engine,blocked?'DEPENDENCY_FAILED':'CANCEL',{stop:{kind:blocked?'blocked':'cancelled',reason:'fixture'}},'ACTIVE.FINALIZE');await report(engine,blocked);}
});
test('unsupported runtime requirements stop at setup',async t=>{
  const {engine}=await fixture(t);
  await reject(engine,'RUNTIME_READY',{selected_runtime:{compatible:true,runtime_version:'0.15.0',parent_dispatch_verified:true,capabilities:[]}},{compatible:true});
  await signal(engine,'SETUP_REQUIRED',{},'BYPASS_DETECTED',{compatible:false,reason:'Fixture unsupported runtime'});
});
test('nonfinite paired arithmetic is invalid rather than improved',()=>{
  const c=contract();assert.equal(policy.compare(measurement(c,'baseline',[-Number.MAX_VALUE,-Number.MAX_VALUE]),measurement(c,'candidate',[Number.MAX_VALUE,Number.MAX_VALUE]),c),'invalid');
});
test('manifest, state prompts, wrappers, and Mermaid topology match',async()=>{
  const {FSMEngine}=await runtime();assert.ok(FSMEngine);
  const globalRoot=execFileSync('rtk',['npm','root','-g'],{encoding:'utf8'}).trim();
  const yaml=createRequire(path.join(globalRoot,'@reactive-skills/axi/package.json'))('js-yaml');
  const m=yaml.load(fs.readFileSync(path.join(skillDir,'skill.yaml'),'utf8'));
  const diagram=fs.readFileSync(path.join(skillDir,'STATECHART.md'),'utf8');
  const declared=new Set(),arrows=[];function inspect(states,prefix=''){for(const [name,s]of Object.entries(states)){
    const full=prefix+name;declared.add(s.prompt_template);const text=fs.readFileSync(path.join(skillDir,s.prompt_template),'utf8');
    assert.ok(text.trim().split(/\s+/).length<200,s.prompt_template);assert.match(text,/Atomic Gate/);
    if(!s.substates)assert.ok(diagram.includes('state "'+full+'" as '+full.replaceAll('.','_')));
    for(const [signal,tr]of Object.entries(s.transitions||{})){assert.ok(fs.existsSync(path.join(skillDir,tr.guardFunction)));
      arrows.push(full.replaceAll('.','_')+' --> '+tr.target.replaceAll('.','_')+' : '+signal);assert.ok([...coverage.values()].includes(signal),signal+' has passing and rejecting installed-runtime scenarios');}
    if(s.substates){assert.ok(diagram.includes('state '+full.replaceAll('.','_')+' {'));inspect(s.substates,full+'.');}
  }}inspect(m.states);
  const actual=diagram.split('\n').filter(line=>line.includes(' --> ')&&!line.includes('[*]')).map(line=>line.trim());assert.deepEqual(actual.sort(),arrows.sort());
  const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else files.push(path.relative(skillDir,p).replaceAll('\\','/'));}}walk(path.join(skillDir,'states'));
  assert.deepEqual(files.sort(),[...declared].sort());assert.deepEqual(m.context_keys,[]);
  const boot=fs.readFileSync(path.join(skillDir,'templates/reactive_bootloader.md.hbs'),'utf8').trim().replaceAll('{{skill_name}}','experiment-loop');
  assert.ok(fs.readFileSync(path.join(skillDir,'SKILL.md'),'utf8').includes(boot));
});
