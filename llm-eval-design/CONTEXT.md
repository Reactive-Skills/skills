# LLM Eval Design context

## Purpose
This skill helps a builder decide how to measure an LLM application before and while they improve it.
It produces success criteria, an eval method for each criterion, grader designs, and a test-case plan.
It can then generate an eval harness and run it, each behind its own approval.

## Source
The method follows Anthropic's guidance "Define success criteria and build evaluations".
URL: https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
This skill paraphrases the ideas.
It does not reproduce the page text or its code samples.
Read the page for the original wording and examples.

## Terms
Criterion: one measurable statement of success with a numeric threshold and a population.
Eval: a set of test cases plus a method that scores outputs.
Grader: the code, model, or person that scores one output.
Rubric: explicit rules a grader applies. It is not the golden answer.
Held-out set: cases never used to tune prompts or rubrics.
Calibration: checking that an LLM grader agrees with human labels before its scores are trusted.
Grader error: a grader reply that cannot be parsed. It is counted and reported, never silently passed.

## Record protocol
Protected records change only through `contextUpdates` on a signal.
Guards validate shape and internal consistency. They cannot verify that a measurement or an approval is true.

| Signal | Record | Meaning |
| --- | --- | --- |
| RUNTIME_READY | selected_runtime | Runtime compatibility observed |
| INTAKE_READY | intake | Application facts from the user |
| CRITERIA_READY | criteria | Revisioned success criteria |
| EVAL_DESIGN_READY | eval_design | One method per criterion plus case plan |
| GRADING_READY | grading | Grader per criterion plus validation plan |
| PLAN_APPROVED_FINAL, PLAN_APPROVED_BUILD | plan_approval | Exit and the exact revisions approved |
| REVISE_PLAN | plan_approval = null | Return to criteria |
| HARNESS_READY | harness | Output directory, tests, verified model ids |
| RUN_APPROVED, RUN_DECLINED | run_approval | Cost estimate, limits, key variable name |
| CALIBRATION_PASSED, CALIBRATION_FAILED | calibration | Grader agreement from counts |
| SCORING_COMPLETE | results | Observed value per criterion |
| REPORT_READY, REPORT_BLOCKED | report | Outcome, claims, limitations |
| CANCEL, DEPENDENCY_FAILED | stop | Why the work ended early |

Criteria, eval_design, and grading carry a revision that must increase by one on each pass.
Downstream records name the revisions they were built on.
An approval is valid only for the exact revisions it names.

## Invariants
1. The default outcome is a design plan. Harness and run are reachable only through explicit opt-in.
2. No model API call happens before RUN_APPROVED, and the cost estimate is shown first.
3. A credential never enters a payload, prompt, ledger, or projection. Only an environment variable name does.
4. Model identifiers are verified from a current source at harness and run time.
5. The grader model differs from the model under test.
6. An LLM grader is calibrated on labeled examples before scoring. A failed calibration returns to GRADING and passes APPROVE_PLAN again.
7. Privacy style criteria score cases with and without sensitive data, so over-refusal is measured.
8. Grader output is parsed defensively. A bad reply is a counted grader error.
9. Held-out cases are never used to tune.
10. Results are reported per criterion. A conclusion never exceeds recorded evidence.

## Limits
Guards check the structure of records and the arithmetic inside them.
They do not prove that a number was measured or that a person approved.
Model tiers state capability intent only and do not prove which model ran a state.
Fixtures in guards/workflow.test.cjs are synthetic and show workflow behavior, not eval quality.
