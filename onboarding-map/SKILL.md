<!-- REACTIVE BOOTLOADER -->
> **REACTIVE SKILL: STRICT RUNTIME EXECUTION**
> This skill is an event-driven state machine. Manual execution is forbidden.
>
> **LOCAL-FIRST RUNTIME SELECTION**
> Select one compatible runtime during INIT, then reuse it for the full run.
> - To start a new task, use selected runtime `invoke onboarding-map [--payload JSON]`.
> - To resume an active task, use selected runtime `state onboarding-map`.
> - For named or parallel work, keep the same `--job <alias>` flag on every command.
> - The runtime resolves aliases to immutable UUID-backed `run_id` values.
> - To advance state, use selected runtime `emit onboarding-map <signal>`.
>
> **SELECTED RUNTIME COMMANDS**
> Use selected MCP or AXI path for every state and signal command.
> First check `reactive_capabilities` when this MCP tool is available.
> Otherwise check `reactive-skills-axi capabilities --json`, then use direct AXI.
> Otherwise use `npx -y @reactive-skills/axi capabilities --json`, then use zero-install AXI.
> MCP uses `reactive_state` and `reactive_emit_signal`.
> Direct AXI uses `reactive-skills-axi state|emit onboarding-map`.
> Zero-install AXI uses `npx -y @reactive-skills/axi state|emit onboarding-map`.
> Emit `RUNTIME_READY` with `transport`, `launcher`, `runtime_version`, `axi_version`, `compatible`, and `capabilities`.
> Persist the selected runtime in `payload.contextUpdates` so later states reuse it.
> AXI remains the runtime interface. `npx` is only its zero-install launcher.
> Do not repeat version or capability checks after INIT.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run selected runtime `reset onboarding-map` or `invoke onboarding-map`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# Onboarding Map

Reactive skill that guides a contributor through codebase onboarding using a
deterministic, event-sourced state machine.

```bash
npx -y @reactive-skills/axi invoke onboarding-map
```

## Operations

| Operation | Description |
|-----------|-------------|
| `CREATE` | Scaffold a new skill from this template |
| `UPDATE` | Modify an existing skill's states, guards, or templates |
| `DELETE` | Remove a skill entirely |
| `MIGRATE_LEGACY` | Convert a legacy `SKILL.md` to reactive v2.0.0 format |
| `MIGRATE_REACTIVE` | Upgrade a v1 reactive skill to v2.0.0 |

## Context Keys

| Key | Type | Description |
|-----|------|-------------|
| `repo_path` | `string` | Absolute path to the repository under onboarding |
| `user_role` | `string` | Contributor role (e.g. `frontend engineer`, `data engineer`) |
| `module_count` | `number` | Number of discovered modules/packages |
| `dependency_graph` | `object` | Parsed module dependency tree |
| `learning_path` | `array` | Ordered list of learning resources and exercises |
| `stakeholder_feedback` | `array` | Comments collected during review phase |

## States

`INTAKE → SCAN → MAP → PATH → REVIEW → SUCCESS`

Failure paths: `BLOCKED`, `ERROR`.

## Middleware Hooks

| Hook | Purpose |
|------|---------|
| `telemetry` | Logs transition events and durations |
| `invariant_checker` | Validates context key completeness before each transition |
| `audit` | Writes a snapshot to `templates/snapshot.md.hbs` on every state change |

## Deliverables

| Template | Output |
|----------|--------|
| `templates/onboarding_guide.md.hbs` | Personalized onboarding guide |
| `templates/state_snapshot.json.hbs` | Machine-readable state snapshot |

## Validation

```bash
node ../scripts/validate-skills.js onboarding-map
```
