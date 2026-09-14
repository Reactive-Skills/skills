# VERTICAL_SLICING State

## Goal
Decompose the prioritized requirements (primarily Q1 and Q2) into thin, end-to-end deliverable vertical slices and establish the definitive MVP boundary.

## Context Variables Read
- `context.product_name`
- `context.eisenhower_matrix`
- `context.smart_requirements`

## Tools
- `view_file`
- `write_to_file`
- `ask_question`

## Instructions
1. **Vertical Slicing Principles**:
   - A slice is **not** an architectural layer (e.g. "build the database layer" is forbidden).
   - A slice must cut across all layers required to deliver tangible user or system value: UI/CLI entry -> domain logic -> data persistence/state -> external integration -> automated verification.
   - Slices must be independently deliverable, testable, and demonstrable.
2. **Decompose Scope into Slices**:
   - **Slice S01: Walking Skeleton**: The smallest possible end-to-end slice connecting the entry point to the exit point. Proves architectural viability.
   - **Follow-On Functional Slices (S02, S03...)**: Incremental capabilities delivering isolated, user-observable value.
   - For each slice, define:
     - `id`: e.g. `S01`, `S02`
     - `title`: Short descriptive name (e.g. `S01-core-intake-skeleton`)
     - `user_value`: "As a... I want to... so that..."
     - `in_scope`: Specific behaviors and capabilities delivered.
     - `out_of_scope`: Explicit exclusions left for future slices.
     - `layer_touchpoints`: UI/CLI, domain logic, data/storage, external services.
     - `acceptance_criteria`: Given/When/Then scenarios.
     - `verification_script`: Command or steps to test the slice.
     - `dependencies`: Array of prerequisite slice IDs (forming a directed acyclic graph, DAG).
3. **Define the MVP Gate**:
   - Mark the exact subset of slices that constitute the MVP boundary (e.g. `S01` and `S02`).
   - Slices past the MVP gate are scheduled for subsequent iterations.
4. Update context:
   - `vertical_slices`: Array of slice objects.
   - `mvp_slice_ids`: Array of slice IDs included in the MVP boundary.

## 🛑 Atomic Checklist & Anti-Shortcut Gate
- [ ] Confirmed that every slice is a true vertical slice spanning from entry point to verified output (no horizontal layer tickets).
- [ ] Slice S01 is an authentic walking skeleton proving the end-to-end loop.
- [ ] Each slice has clear Given/When/Then acceptance criteria and an execution verification script.
- [ ] Slice dependencies form a valid DAG without cycles.
- [ ] Explicitly marked the MVP boundary.

## Stop Criteria
Slices decomposed and bound to context. Emit `SLICES_DECOMPOSED`. If dependencies require altering the Eisenhower prioritization, emit `REVISE_PRIORITIES`.

## Signals
- `SLICES_DECOMPOSED`
- `REVISE_PRIORITIES`
