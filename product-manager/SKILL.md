<!-- REACTIVE BOOTLOADER -->
> **REACTIVE SKILL: STRICT RUNTIME EXECUTION**
> This skill is an event-driven state machine. Manual execution is forbidden.
>
> **DEFAULT EXECUTION: AXI CLI**
> AXI is the default runtime path, even when MCP tools are present.
> 1. Run `reactive-skills-axi state product-manager` to read the active job instructions.
> 2. Run `reactive-skills-axi invoke product-manager` only when you need a fresh isolated job.
> 3. For named or parallel work, keep the same `--job <job-id>` flag on every `state` and `emit` command.
> 4. Run `reactive-skills-axi emit product-manager <signal>` to advance the current job.
>
> **FALLBACK EXECUTION: MCP**
> Use `reactive_state` and `reactive_emit_signal` only when shell access to AXI is unavailable.
> Do not troubleshoot MCP before trying AXI.
>
> **TERMINAL STATE RECOVERY**
> If the current job is terminal, run `reactive-skills-axi reset product-manager` or `reactive-skills-axi invoke product-manager`.
>
> **STRICT INVARIANT**
> Do not manually author `.docs/` deliverables or guess next states.
> The runtime governs all transitions and projections.
<!-- END REACTIVE BOOTLOADER -->

# Product Manager

Event-driven product management and opportunity realization engine. Governs the complete lifecycle from opportunity discovery and worthwhileness research to strategic alignment, SMART requirement scoping, Eisenhower matrix prioritization, and deliverable vertical slice architecture.

## Overview

Traditional Product Requirements Documents (PRDs) often suffer from two major failure modes: they balloon into 40-page unread static documents that rapidly desynchronize from code, or they jump straight into technical implementation without validating whether an opportunity is worthwhile or aligned with core business strategy.

The `product-manager` skill enforces a lean, event-driven state machine built on four rigorous pillars:
1. **Research & Discovery**: Deep investigation of the problem space, target persona, jobs-to-be-done (JTBD), and alternative workarounds. Supports dual intake:
   - `NEW_PRODUCT`: Green-field venture, tool, or standalone product opportunity.
   - `PRODUCT_ENHANCEMENT`: Feature additions, capabilities, or major iterations on an existing codebase.
2. **Worthwhileness Validation**: A rigorous 4-axis assessment (Desirability, Feasibility, Viability, Defensibility) determining if the effort is genuinely worthwhile before committing engineering resources.
3. **Strategic Alignment**: Binding candidate capabilities to high-level strategic objectives, North Star metrics, measurable OKRs, and non-negotiable **anti-goals** ("What we are intentionally NOT doing").
4. **SMART Scoping & Eisenhower Prioritization**: Converting raw requests into verifiable SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound), triaged through the 4 Eisenhower quadrants:
   - **Q1 (Do Now / Core MVP)**: Critical path and walking skeleton increments.
   - **Q2 (Schedule / Depth & Polish)**: Foundational quality, durability, and follow-on slices.
   - **Q3 (Delegate / Ops & Scaffolding)**: Tactical friction-reduction and operational dependencies.
   - **Q4 (Defer / Reject)**: Explicitly dropped or deferred features to prevent scope creep.
5. **Vertical Slicing & MVP Boundary**: Decomposing prioritized requirements into thin, end-to-end deliverable vertical slices with strict Given/When/Then acceptance criteria and dependency ordering.

---

## State Machine Workflow

```
[INIT] ──────────────────────────► [SELECT_OPPORTUNITY_TYPE]
                                           │
                                           ▼
                                  [RESEARCH_DISCOVERY]
                                           │
                                           ▼
                               [VALIDATE_WORTHWHILENESS]
                                           │
                                           ▼
                                     [ALIGN_GOALS]
                                           │
                                           ▼
                              [GATHER_TEST_REQUIREMENTS]
                                           │
                                           ▼
                                  [FORMULATE_SMART]
                                           │
                                           ▼
                             [EISENHOWER_PRIORITIZATION]
                                           │
                                           ▼
                                  [VERTICAL_SLICING]
                                           │
                                           ▼
                                    [REVIEW_GATE] (Human-in-the-Loop)
                                           │
                                           ▼
                                      [PROJECTING]
                                           │
                                           ▼
                                       [SUCCESS]
```

---

## CLI & MCP Invocation

### Zero-Install Shell Mode (AXI CLI)
```bash
# Check current state prompt
npx -y @reactive-skills/axi state product-manager

# Advance state machine with signal
npx -y @reactive-skills/axi emit product-manager OPPORTUNITY_SELECTED --payload '{"opportunity_type":"NEW_PRODUCT","product_name":"my-app"}'
```

### Globally Installed Mode
```bash
reactive-skills-axi state product-manager
reactive-skills-axi emit product-manager OPPORTUNITY_SELECTED --payload '{"opportunity_type":"PRODUCT_ENHANCEMENT","product_name":"my-app"}'
```

### MCP Mode
Invoke `reactive_state` and `reactive_emit_signal` directly within your AI agent harness.

---

## Deliverables & Projections

Upon reaching `SUCCESS`, the skill generates structured, reproducible projections:
- `.docs/product-manager/<product_name>-spec.md`: The Lean Product Charter, strategic goals, SMART specifications, and vertical slices catalog.
- `.docs/product-manager/<product_name>-eisenhower.md`: 4-quadrant prioritization matrix with decision rationales, cuts log, and delegation backlog.
- `.docs/product-manager/inventory.json`: Machine-readable metadata catalog of all tracked opportunities.
