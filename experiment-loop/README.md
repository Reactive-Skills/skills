# Experiment Loop

An Alpha reactive skill for bounded improvement experiments with approval, repeated baselines, fixed evaluation, separate confirmation, budgets, and recovery.
Use it when a question has an observable outcome and a credible evaluator.
It works across prompts, code, and workflow artifacts using your existing evaluation tools.
It does not claim universal research capability or demonstrated superiority over another optimizer.

## Workflow

Clarify the question, approve a contract, calibrate the evaluator, and measure the preserved baseline.
Diagnose failures, propose a reversible intervention, measure it, and retain only evidence-backed selection improvement.
Crucial regressions override aggregate scores; uncertain results remain inconclusive.
Reserve confirmation work before starting another trial.
After search ends, compare the selected candidate with the baseline on untouched cases once.
Clean owned temporary resources and report observed conclusions and limitations.

The initial comparison policy is paired-margin: every repeated paired difference must favor the candidate and their mean must meet the approved practical threshold.
This is a conservative screening rule, not a significance test.
For subjective outcomes, calibrate a fixed rubric and inspect agreement with labeled examples.
For literature, causal questions, or slow outcomes, obtain a suitable research design first.
See [CONTEXT.md](CONTEXT.md) for supported records and limitations and [STATECHART.md](STATECHART.md) for every transition.

## Installation and use

Install this package through the repository's supported source-aware sync workflow into the Reactive Skills runtime.
Runtime 0.16.0 or newer must support bootloader, transport handshake, and runtime.accepted_update_replay.
The installed 0.16.0 package lacks the last capability and is incompatible; use the repaired local source build until distribution.
No evaluator SDK, paid service, or specific model vendor is required by this skill.

Use a repaired runtime source checkout that advertises runtime.accepted_update_replay.
Build its runtime package and AXI application before invoking the local AXI entry point below.
The unrepaired published runtime is not supported by this experimental package.
For acceptance tests, set EXPERIMENT_LOOP_RUNTIME to the absolute path of that checkout's `packages/runtime/dist/index.js`.

```text
node <repaired-runtime-checkout>/apps/axi/dist/cli/index.js bootloader experiment-loop --json
node <repaired-runtime-checkout>/apps/axi/dist/cli/index.js state experiment-loop --job my-experiment
node <repaired-runtime-checkout>/apps/axi/dist/cli/index.js emit experiment-loop SIGNAL --job my-experiment --payload <JSON>
```

For MCP call reactive_bootloader, then reactive_state and reactive_emit_signal with skill_name experiment-loop and the same job name.
Follow returned state instructions; do not run a static checklist outside the runtime.
Submit protected record updates inside contextUpdates.
Keep the same job to recover an interrupted run, and use a distinct job for another experiment.

Only execute external actions covered by the accepted contract.
Promotion of installed reactive skill changes uses skill-manager and the registered authoring source.
The host remains responsible for actual execution isolation, timeouts, spending controls, and trustworthy evidence.
Guards validate records and cannot verify measurement truth or enforce operating-system isolation.

## Recovery and evidence

Pause records the real interrupted phase and requires reconciliation before continuation.
Interrupted trials are counted before search resumes.
Interrupted confirmation finalizes with limitations rather than silently reusing its cases.
Cancellation and dependency failures reach cleanup through parent handlers.
The runtime retains run identity, ledger, job isolation, and generated projections.
Snapshot, inventory, and report outputs live under .docs/experiment-loop/<job>/ with runtime job archives.
The event ledger supplies audit metadata; no separate persistence layer is introduced.

## Verification

```text
node --test experiment-loop/guards/workflow.test.cjs
node scripts/validate-skills.js experiment-loop
reactive-skills-axi inspect <path-to-experiment-loop>
node scripts/validate-skill-releases.js
node scripts/update-toc.js --check
```

Acceptance tests use explicitly synthetic fixture measurements and the runtime selected by EXPERIMENT_LOOP_RUNTIME.
The verified results use the repaired local build.
They verify guards, outcomes, budgets, cancellation, recovery, case separation, and projections.
They do not measure real task gains, causal validity, or superiority over Karpathy's autoresearch.
Representative empirical evaluation remains separate work.

## Directory layout

```text
experiment-loop/
  SKILL.md
  skill.yaml
  skill-release.json
  README.md
  CONTEXT.md
  STATECHART.md
  guards/
    policy.cjs
    <signal-name>.cjs
    workflow.test.cjs
  states/
    init.md
    bypass_detected.md
    paused.md
    complete.md
    blocked.md
    active/
      parent.md
      intake.md
      contract.md
      calibrate.md
      baseline.md
      confirm.md
      finalize.md
      trial/
        parent.md
        diagnose.md
        propose.md
        run.md
        assess.md
  templates/
    reactive_bootloader.md.hbs
    init_state.md.hbs
    bypass_detected.md.hbs
    snapshot.md.hbs
    inventory.json.hbs
    report.md.hbs
```

Each signal wrapper binds its declared signal to the shared policy.
All state prompts include an atomic gate and stay below 200 words.
