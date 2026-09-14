# product-manager

> **Event-driven Product Management, Strategic Alignment, SMART Scoping & Vertical Slicing Engine**

Part of the **ByteQuilt Reactive Skills** ecosystem. Built on finite state machines to turn ideas, opportunities, and product feature requests into worthwhile, aligned, prioritized, and incrementally deliverable vertical slices.

---

## Why `product-manager`?

Most software projects suffer from two opposing extremes:
1. **The Bloated PRD Trap**: 30-page speculative documents that take weeks to write, are never read by engineers, and become obsolete after the first pull request.
2. **The Aimless Feature Trap**: Jumping directly to coding without validating user demand, verifying worthwhileness, checking strategic alignment, or setting clear anti-goals.

`product-manager` bridges this gap with an event-driven, verifiable workflow that produces **Lean Product Specifications** organized as **independent, testable vertical slices**.

---

## Core Capabilities

- **Dual Intake Modes**:
  - `NEW_PRODUCT`: Green-field product concepts, startup MVPs, or standalone CLI/GUI tools.
  - `PRODUCT_ENHANCEMENT`: Feature additions, UX overhauls, architectural extensions, or optimization epics on an existing product.
- **The "Worthwhile" Gate**:
  - Quantifies and tests **Desirability** (user pain & evidence), **Feasibility** (technical & architectural constraints), **Viability** (business model, unit economics, ROI), and **Defensibility** (timing & moat).
- **Strategic Goal & Anti-Goal Alignment**:
  - Directly anchors initiatives to core North Star metrics and measurable OKRs while explicitly documenting anti-goals to avoid feature sprawl.
- **SMART Requirement Scoping**:
  - Upgrades ambiguous statements into verifiable requirements: Specific, Measurable (Given/When/Then), Achievable, Relevant, and Time-bound.
- **Eisenhower Matrix Prioritization**:
  - **Q1 (Do Now / Core MVP)**: Walking skeleton and critical path essentials.
  - **Q2 (Schedule / Quality & Depth)**: Foundational infrastructure, performance, and follow-on slices.
  - **Q3 (Delegate / Ops)**: Low-hanging fruit, automation tooling, and operational tasks.
  - **Q4 (Defer / Reject)**: Documented cut log with justifications for why requests were declined.
- **Vertical Slicing Engine**:
  - Decomposes scopes into self-contained vertical slices crossing all application layers (UI, logic, data, tests) with clear MVP boundaries and dependency graphs.

---

## Directory Structure

```
product-manager/
├── SKILL.md                          # Universal reactive bootloader & CLI instructions
├── README.md                         # Human-facing documentation & catalog navigation
├── CONTEXT.md                        # Ubiquitous language, domain boundaries & invariants
├── STATECHART.md                     # Visual statechart with Mermaid diagram
├── skill.yaml                        # Authoritative state machine manifest (v2.1.0)
├── states/                           # Isolated state prompt templates
│   ├── init.md                       # Runtime environment verification
│   ├── setup_runtime.md              # Auto-configuration fallback
│   ├── select_opportunity_type.md    # New product vs feature enhancement selection
│   ├── research_discovery.md         # Problem space & market exploration
│   ├── validate_worthwhileness.md    # Desirability, feasibility, viability check
│   ├── align_goals.md                # Strategic goals, OKRs, anti-goals
│   ├── gather_test_requirements.md   # Requirement collection & falsification tests
│   ├── formulate_smart.md            # SMART specification drafting
│   ├── eisenhower_prioritize.md      # 4-quadrant prioritization & cuts log
│   ├── vertical_slicing.md           # End-to-end vertical slice decomposition
│   ├── review_gate.md                # Human-in-the-loop review gate
│   ├── projecting.md                 # Deliverable projection rendering
│   ├── success.md                    # Terminal success state
│   └── error.md                      # Terminal error state
├── guards/
│   └── .gitkeep
└── templates/                        # Handlebars projection templates
    ├── product_spec.md.hbs           # Lean product specification template
    ├── eisenhower_matrix.md.hbs      # Prioritization matrix template
    └── inventory.json.hbs            # Machine-readable catalog template
```

---

## Quickstart

### 1. In Your Shell (Zero-Install CLI)
```bash
# Check current state
npx -y @reactive-skills/axi state product-manager

# Start an opportunity assessment
npx -y @reactive-skills/axi emit product-manager OPPORTUNITY_SELECTED --payload '{
  "product_name": "ai-code-reviewer",
  "opportunity_type": "NEW_PRODUCT"
}'
```

### 2. In Your AI Agent Harness (MCP)
Use the `reactive_state` and `reactive_emit_signal` tools to step through each phase of the state machine.

---

## Output Artifacts

- `.docs/product-manager/<product_name>-spec.md`: The Lean Product Charter, alignment goals, SMART requirements, and vertical slices breakdown.
- `.docs/product-manager/<product_name>-eisenhower.md`: Complete Eisenhower matrix with decision rationales and cuts log.
- `.docs/product-manager/inventory.json`: Catalog record indexed by product name.
