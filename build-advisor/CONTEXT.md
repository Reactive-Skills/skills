# build-advisor contract

Schema version is 2.1.0.
Package version is 1.0.2.
The supported operation is contextual advisory work through develop, challenge, and advise routes.
Use substates and initial_substate for hierarchy supported by the runtime.

## Context

| Key | Meaning |
| --- | --- |
| selected_runtime | Compatible transport, launcher, version, capabilities, and verified parent dispatch selected at INIT. |
| basis_version | Positive revision number for the current situation and evidence. |
| route | develop, challenge, or advise. |
| situation | question, domain, stage, decision_owner, and constraints. |
| evidence | Entries with unique id, claim, kind, and source. |
| problem | Current-basis customer, pain, why_now, and alternatives. |
| story | Current-basis narrative, promise, and traceable or explicitly untested claims. |
| experience | Current-basis touchpoints spanning all eight journey stages. |
| learning_plan | Current-basis experiments, milestones, launch_criteria, and next_generation. |
| assessment | Current-basis artifact, summary, and findings from inspected material. |
| uncertainty_plan | Current-basis tests or an explicit no_test_reason. |
| diagnosis | Current-basis issue, decision_type, and relevant principles. |
| options | Current-basis choices with consequences. |
| recommendation | Current-basis route, direction, rationale, and limitations. |
| decision | Current-basis direction, rationale, and owner reflecting human input. |
| action | Current-basis type, owner, next_step, and review_trigger. |

Every derived route record includes basis_version.
Direction is proceed, revise, investigate, defer, or stop.
Action type is experiment, review, handoff, or stop.
Evidence kind is observed, interpretation, assumption, or conviction.
An observed entry needs an actual source; an assumption is not an observation.
Do not store credentials or unnecessary personal information.

## Projection identity

jobId, skillName, currentState, events, and lastUpdated are supplied by the runtime's ProjectionContext outside skill context.
jobId is the job label when named, otherwise the runtime job identifier; do not declare or synthesize it in context_keys.
Output paths are scoped to that job label, including the runtime archive under jobs/<jobId>/.
The snapshot's job_id records the label, while run_id comes from events.[0].run_id and identifies the immutable SQLite event stream.
The decision memo records both identities.
Reusing a label updates its projected view; use distinct labels for separate projects and the event ledger for immutable run history.

## Revision and scope rules

ROUTE_CHANGED retains the current basis and evidence and returns to framing.
SITUATION_CHANGED requires a reason and advances basis_version by exactly one.
RESULTS_RECEIVED requires genuinely new observed entry IDs and also advances basis_version by one.
FRAME clears pending recommendation, decision, and action while retaining evidence and prior route artifacts.
Prior artifacts may be reused only after their assumptions remain valid under the current basis.
Old-basis route records cannot satisfy fresh output guards.
The runtime preserves the active leaf and ledger; no history pseudo-state extension is assumed.
CANCEL, ROUTE_CHANGED, and SITUATION_CHANGED are declared once on ACTIVE and inherited by every active descendant.
REVISE_PROBLEM, REVISE_REVIEW, and REVISE_DIAGNOSIS belong to their respective route parents.
All cancellations use one nonempty reason guard and one CANCELLED destination.
Unmodified runtime 0.16.0 has a SQLite ancestor-dispatch version conflict.
Use a runtime build containing the repair and set selected_runtime.parent_dispatch_verified only after its inherited-cancellation acceptance test passes.
Nested states still express the three independent routes and their local revision loops.

## Human responsibility

DECISION_ACCEPTED requires explicit human approval, its actual source, a current recommendation, and a recorded decision.
Silence is never approval.
A human may choose a different direction; capture the reason.
Global CANCEL follows an explicit cancellation request.
Waiting for evidence does not create an automation.
A completed handoff means advice was delivered, not that the proposed experiment, implementation, or launch happened.

## Source principles

These are paraphrased lenses from Tony Fadell's *Build* (Harper Business, 2022).
The state topology and revision guards are this skill's adaptation.

| Chapters | Lens | Operational use |
| --- | --- | --- |
| 1.1-1.4, 2.4 | Learn through work, value mentors, retain mission perspective, and recognize when to leave. | Career and builder-readiness diagnosis. |
| 2.1 | Management changes the work; demand quality while leaving room for others to deliver it. | Leadership responsibility and delegation. |
| 2.2 | Decisions combine evidence and judgment; novel products cannot offer perfect proof in advance. | Label uncertainty and avoid endless analysis. |
| 3.1 | Prototype the entire customer experience. | Examine discovery through exit, including support and marketing. |
| 3.2 | Explain why the product should exist; its narrative helps shape it. | Match the promise to the actual experience. |
| 3.3-3.4 | Balance meaningful change with execution and adapt learning between first versions and iterations. | Stage-aware recommendations. |
| 3.5 | Use constraints and regular checkpoints to maintain movement. | Bounded experiments and delivery milestones. |
| 3.6 | Product and business learning take multiple iterations. | Consider later generations without promising a fixed path to profit. |
| 4.1-4.2 | Research compelling ideas before committing and assess builder readiness. | Examine recurring pain, alternatives, timing, and commitment. |
| 4.3-4.4 | Business relationships and customer focus shape the organization. | Consider alignment and identify the primary customer for this decision. |
| 4.5-4.6 | Capacity and crisis response need deliberate organization. | Review workload, containment, accountability, and communication. |
| 5.1-5.3 | Teams need complementary people, changing structures, and design attention beyond visuals. | Hiring, growth, and neglected-experience questions. |
| 5.4-5.6 | Messaging, product ownership, and incentives should support the same customer experience. | Find mismatches between promises, delivery, and rewards. |
| 5.7, 6.1-6.5 | Leaders remain accountable while seeking counsel and planning organizational transitions. | Executive options, business questions, governance, and succession. |

Do not convert historical anecdotes, staffing thresholds, compensation preferences, or work intensity into universal rules.
When current law, investment terms, or employment details matter, obtain authoritative current sources.
The source book is not redistributed with this package.
