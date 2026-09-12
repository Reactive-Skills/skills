# State: MUTATING

## Goal
Synthesize candidate mutants across target source files by applying AST and token mutation operators.

## Instructions
1. Run the mutation generator (e.g. `mutate plan` or internal AST scanner).
2. Apply active operators:
   - Conditional Boundary (`<` <-> `<=`, `>` <-> `>=`)
   - Equality Swap (`==` <-> `!=`, `===` <-> `!==`)
   - Arithmetic Swap (`+` <-> `-`, `*` <-> `/`)
   - Logical Invert (`&&` <-> `||`)
   - Return Value Substitution (`true` -> `false`, `0` -> `1`, `nil` -> `err`)
3. If differential scoping is active, discard mutants outside changed line ranges.
4. Record `total_mutants` and emit signal `MUTANTS_GENERATED`.
5. If no valid mutants could be generated, emit `MUTATION_FAILED`.

## Anti-Shortcut Checklist
- [ ] Were mutants generated using syntax/AST awareness rather than indiscriminate text replacement?
- [ ] Were generated mutations verified to be syntactically valid candidates?
