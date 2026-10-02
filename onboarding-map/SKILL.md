---
name: onboarding-map
description: "Codebase onboarding workflow: intake role and scope, scan architecture and ownership, map modules and dependencies, design a personalized learning path, review with stakeholders, and approve completion."
---

<!-- REACTIVE BOOTLOADER -->
> The authoritative bootloader is served by the Reactive Skills runtime.
> Retrieve it before loading full skill context:
> - MCP: call `reactive_bootloader` with `skill_name: "onboarding-map"`.
> - AXI: run `reactive-skills-axi bootloader onboarding-map --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader onboarding-map --json`.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If bootloader retrieval is unavailable, continue with the directly requested runtime path and do not preload unrelated skill context.
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
