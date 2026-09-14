# REVIEW_GATE State

## Goal
Present the consolidated Lean Product Charter, Eisenhower Matrix, and Vertical Slice Architecture to the human stakeholder for formal review and approval.

## Context Variables Read
- `context.product_name`
- `context.opportunity_type`
- `context.problem_statement`
- `context.worthwhileness_score`
- `context.strategic_goals`
- `context.anti_goals`
- `context.eisenhower_matrix`
- `context.vertical_slices`
- `context.mvp_slice_ids`

## Tools
- `ask_question`
- `view_file`

## Instructions
1. Present the consolidated synthesis:
   - **Product Summary**: Name, Opportunity Type, Problem Statement, Worthwhileness Score.
   - **Strategic Alignment**: Core OKRs & explicit Anti-Goals.
   - **Eisenhower Prioritization Summary**:
     - Q1 Do Now (MVP candidates)
     - Q2 Schedule (Next wave)
     - Q3 Delegate (Tooling / Ops)
     - Q4 Defer / Reject (Cut log)
   - **Vertical Slices Catalog**: Walking Skeleton through MVP boundary, with dependencies and acceptance criteria.
2. Solicit human decision via `ask_question`:
   - Choice 1: "Approve Product Slices & Prioritization" -> Emit `USER_APPROVED`
   - Choice 2: "Revise Vertical Slices" -> Emit `REVISE_SLICES`
   - Choice 3: "Revise Eisenhower Prioritization" -> Emit `REVISE_PRIORITIES`
   - Choice 4: "Abort Opportunity" -> Emit `ABORT`

## 🛑 Atomic Checklist & Anti-Shortcut Gate
- [ ] Rendered full summary covering Problem, Worthwhileness, Alignment, Eisenhower Matrix, and Vertical Slices.
- [ ] Awaited explicit human choice without assuming automatic approval.
- [ ] Handled human rejection, revisions, or approval cleanly.

## Stop Criteria
Human decision received. Emit corresponding signal.

## Signals
- `USER_APPROVED`
- `REVISE_SLICES`
- `REVISE_PRIORITIES`
- `ABORT`
