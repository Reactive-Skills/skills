# VERIFYING State

## Goal
Validate that the operation succeeded by checking filesystem state, state machine integrity, and guard effectiveness.

## Logic

### Step 1: Filesystem Verification
- CREATE: verify skill.yaml exists at expected path
- UPDATE: verify modified files have new content
- DELETE: verify directory no longer exists

### Step 2: State Machine Integrity
For CREATE and UPDATE operations, verify the generated skill's state machine is internally consistent:

- [ ] **Prompt Template Existence**: Every `prompt_template` referenced in `skill.yaml` exists on disk at the expected path relative to the skill directory.
- [ ] **No Orphan State Files**: Every `.md` file under `states/` is referenced by at least one state in `skill.yaml`. No dead code.
- [ ] **No Empty Directories**: No directory under `states/` is empty (unless explicitly declared as a composite parent placeholder).
- [ ] **Transition Target Validity**: Every transition's `target` state is declared in `skill.yaml`'s `states` block.
- [ ] **Initial State Reachable**: The `initial_state` declared in `skill.yaml` exists in the `states` block.
- [ ] **Context Key Coverage**: All context variables referenced in guard expressions are declared under `context_keys` in `skill.yaml`.

### Step 3: Guard Circumvention Testing
Guard circumvention testing verifies that the state machine's guards actually enforce their intended constraints. This goes beyond file existence checks — it validates that transitions are *blocked* when guard conditions are not met.

#### Methodology

**3a. Static Guard Analysis**
Parse `skill.yaml` and extract all guard expressions. For each guard:
- [ ] **Deterministic**: The guard expression references only context variables (no side effects, no I/O).
- [ ] **Boolean Coercion**: The guard expression evaluates to a boolean (explicit `=== true`/`=== false` or implicitly coercible).
- [ ] **No Unresolved References**: All variables referenced in the guard exist in `context_keys` or are payload properties documented in the corresponding state's `Context Variables Set` section.

**3b. Runtime Guard Injection (when `@reactive-skills/axi` is available)**
For each guarded transition in the skill's state machine:

1. **Identify the guard**: Read the transition's guard expression from `skill.yaml`.
2. **Construct a violating payload**: Build a context payload where the guard condition evaluates to `false`.
3. **Attempt the transition**: Emit the signal with the violating payload via `npx -y @reactive-skills/axi emit <skill> <signal> --payload '<violating-payload>'`.
4. **Verify blocking**: Confirm the runtime rejects the transition (state does NOT advance). The runtime should return an error or remain in the current state.
5. **Construct a satisfying payload**: Build a context payload where the guard condition evaluates to `true`.
6. **Attempt the transition**: Emit the signal with the satisfying payload.
7. **Verify passage**: Confirm the runtime accepts the transition (state advances to the target).

**3c. Guard Circumvention Checklist**
- [ ] **No Unguarded Critical Transitions**: Any transition that moves from a non-terminal state to a state that performs irreversible actions (DELETE execution, file deletion, external API calls) MUST have a guard. Check: does the transition from `EXECUTING` → `VERIFYING` have a guard? (It should not — EXECUTED is unconditional, but VERIFYING → PROJECTING should be guarded by `exit_code == 0`.)
- [ ] **No Guard Bypass via Signal Spoofing**: The runtime must not allow emitting arbitrary signals from any state. Verify that only signals declared in the current state's `transitions` block are accepted.
- [ ] **No Guard Bypass via Payload Injection**: The runtime must not allow overriding guard-evaluated context variables via payload. Verify that context variables set by previous states (e.g., `skillExists`, `isLegacy`) cannot be overwritten by emit payloads.
- [ ] **No Guard Bypass via Direct State Jump**: The runtime must not allow skipping states. Verify that emitting a signal from a state other than the current one is rejected.
- [ ] **No Guard Bypass via Schema Manipulation**: The runtime must not allow modifying `skill.yaml` at runtime to weaken guards. Verify that the statechart is loaded from disk at startup and not re-read on each emit.

**3d. Guard Circvention Test Report**
Produce a `guard_circumvention_report` with:
- `total_guards`: Number of guard expressions in `skill.yaml`
- `guards_tested`: Number of guards where both violating and satisfying payloads were tested
- `guards_passed`: Number of guards where the violating payload was correctly blocked
- `guards_failed`: Number of guards where the violating payload incorrectly passed (CRITICAL — indicates a security hole)
- `unguarded_critical_transitions`: List of transitions that perform irreversible actions without guards
- `details`: Array of `{ signal, guard_expression, violating_payload, blocked: boolean, satisfying_payload, passed: boolean }`

### Step 4: Token Efficiency Verification
- [ ] **State Prompt Brevity**: Each `states/*.md` file is under 200 words. Use platform-appropriate word counting: `wc -w <file>` (Unix) or `($content -split '\s+').Count` (PowerShell).
- [ ] **Bootloader Efficiency**: `SKILL.md` bootloader section (between `<!-- REACTIVE BOOTLOADER -->` markers) is under 50 lines.

### Step 5: Middleware Hook Verification (for CREATE with middleware declared)
- [ ] **Hook Files Present**: All declared middleware hook modules exist at `runtime/middleware/*.js`.
- [ ] **Hook Signatures Valid**: Each hook module exports a function accepting `(hookCtx) => Promise<void> | void`.
- [ ] **Invariants File Present**: If `invariant_checker` is declared, `runtime/hooks/invariants.yaml` exists and references only declared context keys.
- [ ] **Sanitizer Patterns Valid**: If `context_sanitizer` is declared, all regex patterns in `config.patterns` are syntactically valid.

## Transition
- If all verification checks pass ? emit `VERIFIED_OK` (exit_code=0)
- If any check fails ? emit `VERIFIED_FAIL` (exit_code=1) with payload listing failed checks

## Signal
Emit: `VERIFIED_OK` (exit_code=0) or `VERIFIED_FAIL` (exit_code=1)