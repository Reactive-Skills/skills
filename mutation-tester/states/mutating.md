# State: MUTATING

## Goal
Synthesize candidate mutants across target source files by applying AST and token mutation operators.

## Instructions
1. From this skill's `engine/` directory, run `go run ./cmd/mutate -dir <absolute target_dir> -list`, adding `-diff <diff_ref>` when `diff_ref` is set.
   The engine prints each candidate mutant and a `Synthesized N candidate mutants` line.
2. The engine applies these operators:
   - Conditional Boundary (`<` <-> `<=`, `>` <-> `>=`)
   - Equality Swap (`==` <-> `!=`, `===` <-> `!==`)
   - Arithmetic Swap (`+` <-> `-`, `*` <-> `/`)
   - Logical Invert (`&&` <-> `||`)
   - Return Value Substitution (`true` -> `false`, `0` -> `1`, `nil` -> `err`)
3. With `-diff`, the engine already keeps only mutants inside changed line ranges.
4. Record `total_mutants` from the `Synthesized N` line and emit signal `MUTANTS_GENERATED`.
5. If no valid mutants could be generated, emit `MUTATION_FAILED`.

## Anti-Shortcut Checklist
- [ ] Were mutants generated using syntax/AST awareness rather than indiscriminate text replacement?
- [ ] Were generated mutations verified to be syntactically valid candidates?
