# SUCCESS State

## Goal
Terminal success state. Provide the human with an executive summary of generated deliverables, approved vertical slices, and concrete commands for downstream engineering execution.

## Context Variables Read
- `context.product_name`
- `context.opportunity_type`
- `context.spec_path`
- `context.matrix_path`
- `context.vertical_slices`
- `context.mvp_slice_ids`

## Instructions
1. Present deliverable locations:
   - Lean Product Spec: `context.spec_path`
   - Eisenhower Matrix & Cuts Log: `context.matrix_path`
   - Inventory Catalog: `.docs/product-manager/inventory.json`
2. Summarize the approved MVP slices ready for implementation.
3. Recommend next downstream skills for technical delivery:
   - For interactive vertical slice implementation: recommend `/synthesis` or `/slice-architect`.
   - For test-driven development on Slice S01: recommend `/tdd`.
   - For UI design or design tokens: recommend `/interface-craft` or `/design-taste-frontend`.

## 🛑 Atomic Checklist & Anti-Shortcut Gate
- [ ] Listed absolute or relative paths to all generated artifacts.
- [ ] Summarized slice IDs constituting the approved MVP.
- [ ] Provided clear transition guidance to engineering and execution skills.

## Stop Criteria
Execution complete.
