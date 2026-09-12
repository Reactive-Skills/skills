# State: REPORTING

## Goal
Present mutation testing score and surviving mutants review gate to human.

## Instructions
1. Present the mutation scorecard to the user:
   - Total Mutants evaluated
   - Kill rate percentage
   - Top surviving mutants and the lines of code they affected
2. Call `ask_question` with options:
   - `Accept Mutation Score` -> Emit `USER_ACCEPTED` (transitions to `SUCCESS`)
   - `Remediate Surviving Mutants` -> Emit `USER_REMEDIATE` (transitions back to `BASELINING` after adding tests)
3. STOP CALLING TOOLS to await user decision.

## Anti-Shortcut Checklist
- [ ] Were surviving mutants presented with constructive suggestions for new test assertions?
