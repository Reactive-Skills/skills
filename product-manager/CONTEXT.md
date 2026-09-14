# Product Manager — Ubiquitous Language & Domain Model

## Core Philosophy

`product-manager` enforces a lean, test-driven approach to product definition. It rejects speculative 40-page PRDs in favor of validated, prioritized, and incrementally deliverable vertical slices.

---

## Ubiquitous Language

| Term | Definition |
|---|---|
| **Opportunity** | A hypothesized business, technical, or user problem worth solving, taking the form of either a `NEW_PRODUCT` (green-field) or a `PRODUCT_ENHANCEMENT` (existing product extension). |
| **Worthwhileness Gate** | A multi-dimensional validation evaluating Desirability (do people want this?), Feasibility (can we build it?), Viability (does it pay off?), and Defensibility/Timing (why now? why us?). |
| **Anti-Goal** | An explicit, non-negotiable declaration of what the product or feature will **not** do. Serves as a defense shield against scope bloat. |
| **Falsification Test** | An adversarial validation test for every requirement: "What empirical evidence, user test, or metric would prove this requirement is unnecessary or mistaken?" |
| **SMART Requirement** | A requirement scoped with: Specific (unambiguous behavior), Measurable (concrete acceptance test), Achievable (realistic scope), Relevant (directly tied to a strategic goal), and Time-bound (sequencing/phase). |
| **Eisenhower Quadrants** | Prioritization matrix: <br>• **Q1 (Do Now / Core MVP)**: Urgent & Important (Walking Skeleton / Critical Path)<br>• **Q2 (Schedule)**: Not Urgent, but Important (Quality, Resilience, Deep Features)<br>• **Q3 (Delegate / Ops)**: Urgent, but Less Important (Automation, Tactical Scripting)<br>• **Q4 (Defer / Reject)**: Not Urgent & Not Important (Cut log, deferred items) |
| **Vertical Slice** | A thin, end-to-end slice of working functionality cutting across all necessary architectural layers (User Interface, Application/Domain Logic, Data Storage/Persistence, Integration, and Automated Tests). |
| **Walking Skeleton** | The absolute minimum end-to-end vertical slice (Q1) that connects all architectural boundaries and delivers a foundational complete loop. |
| **Lean Product Charter** | A compact deliverable that captures goals, scope, Eisenhower triage, and vertical slices without PRD fluff. |

---

## Domain Boundaries

1. **Strategic Intent vs Technical Execution**:
   - `product-manager` is responsible for problem definition, worthwhileness research, goal alignment, SMART scoping, Eisenhower prioritization, and vertical slice architecture.
   - It is **not** a task runner or code implementer. Downstream engineering execution delegates to skills like `synthesis`, `tdd-refactor`, or vertical slice builders.
2. **Lean Specification vs Monolithic PRD**:
   - Deliverables must focus on clear acceptance criteria (Given/When/Then), slice boundaries, and explicit cut logs. Speculative architecture essays are prohibited.
3. **Strict Statechart Invariants**:
   - A requirement cannot enter `EISENHOWER_PRIORITIZATION` without first passing the `GATHER_TEST_REQUIREMENTS` falsification check and being formatted into `FORMULATE_SMART`.
   - No vertical slice can be marked as part of the MVP without having its dependencies mapped to Q1 items.
