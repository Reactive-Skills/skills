<!-- REACTIVE BOOTLOADER -->
> **REACTIVE SKILL: STRICT RUNTIME EXECUTION**
> This skill is an event-driven state machine. Manual execution is forbidden.
>
> **DEFAULT EXECUTION: AXI CLI**
> AXI is the default runtime path, even when MCP tools are present.
> - To start a new task: Run `reactive-skills-axi invoke onboarding-map [--payload JSON]`
> - To resume an active task: Run `reactive-skills-axi state onboarding-map`
> - For named or parallel work: Keep the same `--job <job-id>` flag on every command.
> - To advance state: Run `reactive-skills-axi emit onboarding-map <signal>`
>
> **FALLBACK EXECUTION: MCP**
> Use `reactive_state` and `reactive_emit_signal` only when shell access to AXI is unavailable.
> Do not troubleshoot MCP before trying AXI.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run `reactive-skills-axi reset onboarding-map` or `reactive-skills-axi invoke onboarding-map`.
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
