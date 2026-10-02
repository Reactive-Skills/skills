# build-advisor

One reactive advisor for developing worthwhile products, challenging an existing idea or experience, and making builder decisions.
Inspired by Tony Fadell's *Build: An Unorthodox Guide to Making Things Worth Making* (2022).

## Choose the work

| Route | Trigger | Result |
| --- | --- | --- |
| Develop | A new product, service, or next generation needs a coherent direction. | Customer problem, product story, whole-experience map, and learning milestones. |
| Challenge | An existing proposal, prototype, product, or experience needs scrutiny. | Grounded findings, bounded tests, and a disposition with uncertainty. |
| Advise | A product, leadership, team, business, or career decision needs judgment. | Diagnosis, compared options, recommendation, owner, and communication needs. |

The routes share evidence and a decision record.
Change routes without recreating the evidence history.
Changed circumstances advance a revision number; old derived results must be reconsidered.
A waiting job resumes at its persisted nested state.

## Use

Ask an agent to use build-advisor with your actual situation.
For example: "Challenge this onboarding experience" or "Help us preserve quality while our team grows."
Provide the material you have; missing evidence stays visible.

Start through a compatible Reactive Skills runtime, version 0.16.0 or later.
No separate service or API key is required by this skill.

```powershell
rtk reactive-skills-axi invoke build-advisor --job my-product
rtk reactive-skills-axi state build-advisor --job my-product
```

Use the same job alias for every command.
MCP callers use reactive_state and reactive_emit_signal with the same run.
The active prompt supplies the next task and signal.
Signal data is persisted through payload.contextUpdates.
Do not manually write runtime-generated deliverables.

## Decisions and evidence

Evidence entries distinguish observed facts, interpretations, assumptions, and conviction.
The skill permits decisions under uncertainty and discloses their limits.
An experiment plan is never evidence that the experiment succeeded.
A human reviews the recommendation before the action plan is accepted.
The skill delivers advice and handoffs; it does not automatically execute implementation, contact people, or create monitors.

Fadell's recommendations are contextual lenses.
Three product generations do not guarantee profitability, and disruption is not a universal requirement.
The full experience includes discovery, evaluation, acquisition, onboarding, use, support, retention, and exit.
Each stage may be mapped, awaiting a test, or explicitly inapplicable.

## Deliverables

The runtime projects a decision memo and a machine-readable snapshot under .docs/build-advisor/<run-id>/.
Each run has an isolated projection path.
The memo includes the recommendation, decision, owner, action, review trigger, evidence, and applicable route artifacts.
The runtime ledger preserves prior revisions.

## Boundaries

Product-manager remains responsible for detailed requirements and vertical slices.
Build-advisor contributes contextual judgment, narrative coherence, whole-experience scrutiny, and organizational advice.
A completed handoff may identify a suitable existing skill without invoking it automatically.

## Package layout

- skill.yaml and skill-release.json: machine definition and package metadata.
- SKILL.md, README.md, CONTEXT.md, STATECHART.md: discovery, usage, contract, and full statechart.
- states/init.md, states/bypass_detected.md, states/completed.md, states/cancelled.md: runtime entry, recovery, and terminal prompts.
- states/active/: shared framing, decision, action, waiting, and parent policy.
- states/active/develop/: problem, story, experience, learning, and parent policy.
- states/active/challenge/: inspection, stress testing, verdict, and parent policy.
- states/active/advise/: diagnosis, options, recommendation, and parent policy.
- guards/workflow.test.cjs: actual-runtime acceptance scenarios.
- templates/: decision and snapshot projections plus canonical authoring templates.

## Validate

```powershell
rtk reactive-skills-axi validate build-advisor
rtk node scripts/validate-skills.js build-advisor --no-runtime
rtk node --test build-advisor/guards/workflow.test.cjs
```

The acceptance scenarios cover all routes, incomplete inputs, stale revisions, human approval, parent-event handling, evidence loops, rehydration, and projection isolation.
