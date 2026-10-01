# Systems Diagnosis

## Purpose

Systems Diagnosis helps an agent explain recurring or surprising behavior in a human or ecological system.

It converts systems concepts into a repeatable workflow for mapping structure, forming causal hypotheses, and designing a bounded test.

## Use It When

- A user asks why a system repeatedly produces an unwanted result.
- A user wants to understand delayed or unexpected effects of a policy or intervention.
- A user needs candidate intervention points and a way to evaluate them.

## Workflow

1. Capture the behavior over time and the decision the user faces.
2. Confirm the system boundary, time horizon, actors, and desired outcome.
3. Map relevant elements, information, stocks, flows, feedback, delays, and rules.
4. Explain the pattern with evidence-backed causal hypotheses.
5. Compare feasible intervention points and likely side effects.
6. Design a bounded test with measures and a review condition.
7. Summarize the diagnosis, uncertainty, and next observation.

## Runtime

The shared runtime bootloader lives in the Reactive Skills runtime.

Place this directory in a registered reactive skills source, then use the AXI CLI or the runtime MCP tools.

    reactive-skills-axi invoke systems-diagnosis
    reactive-skills-axi state systems-diagnosis --job <job-id>
    reactive-skills-axi emit systems-diagnosis <signal> --job <job-id>

For a registered source, synchronization can link the skill into consumer runtimes.

    reactive-skills-axi sync --source <registered-source> --skill systems-diagnosis

## State List

- INIT verifies access to the reactive runtime.
- INTAKE captures the problem and behavior over time.
- DEFINE_BOUNDARY confirms scope, time horizon, actors, and outcome.
- MAP_STRUCTURE records relevant system structure.
- DIAGNOSE_DYNAMICS develops and checks causal hypotheses.
- SELECT_LEVERAGE compares intervention options.
- DESIGN_TEST defines measures, timing, and stop conditions.
- SYNTHESIZE presents the final diagnosis.
- BYPASS_DETECTED handles unavailable runtime access or an invalid signal path.

## Directory Layout

- skill.yaml defines states, context, transitions, and guards.
- SKILL.md contains invocation guidance and the runtime bootloader pointer.
- CONTEXT.md defines terms, scope, and invariants.
- STATECHART.md documents the state machine.
- states/ contains one prompt per active state.
- guards/ is reserved for deterministic guard helpers.
- templates/ contains bootloader, state, snapshot, and inventory templates.
