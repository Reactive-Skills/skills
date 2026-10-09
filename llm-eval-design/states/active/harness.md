# HARNESS
Generate a runnable eval harness for the approved plan. This state is reached only by PLAN_APPROVED_BUILD.
## Consumed context
context.plan_approval, context.criteria, context.eval_design, context.grading, context.intake.
## Ask the user
The implementation language and an absolute output directory.
The output directory must be outside this skill directory. Use no ".." segment.
## Build
A case loader with a held-out split that tuning code cannot read.
One scorer per criterion, using the approved method.
For LLM graders: the approved rubric, the constrained output, and defensive parsing. A non-parsable reply becomes a grader error, never an exception and never a pass.
For privacy criteria: score sensitive and non-sensitive cases alike so over-refusal shows up.
A model identifier taken from a current source. Verify with the claude-api skill or the official model list and record the source and date. Do not copy identifiers from examples.
The API key read from an environment variable at run time. Do not print, log, or store it.
A report writer that lists each criterion, its value, threshold, case count, and grader error count.
Add fixture tests for every deterministic scorer. Run them.
## Exit
Emit HARNESS_READY with contextUpdates.harness:
```json
{ "language": "text", "output_dir": "/absolute/path", "files": ["relative/path"],
  "revisions": { "criteria": 1, "eval_design": 1, "grading": 1 },
  "deterministic_tests": { "command": "text", "exit_code": 0, "passed": 1, "failed": 0, "evidence_refs": ["text"] },
  "model_ids": { "under_test": "text", "graders": ["text"], "verified_on": "date", "verification_source": "text" } }
```
model_ids is required when any grader is LLM graded.
## Atomic Gate
Tests exit 0 with no failures. No credential appears in any file or payload.
