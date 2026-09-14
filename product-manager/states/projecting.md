# PROJECTING State

## Goal
Verify and project all deliverable markdown artifacts and catalog inventory files using Handlebars templates declared in `skill.yaml`.

## Context Variables Read
- `context.product_name`
- `deliverable_projections`

## Tools
- `write_to_file`
- `view_file`

## Instructions
1. Ensure the output directory `.docs/product-manager/` exists.
2. The reactive runtime compiles and renders the templates defined in `deliverable_projections`:
   - `.docs/product-manager/{{context.product_name}}-spec.md` (Lean Product Specification)
   - `.docs/product-manager/{{context.product_name}}-eisenhower.md` (Prioritization Matrix & Cuts Log)
   - `.docs/product-manager/inventory.json` (Structured JSON catalog)
3. Verify that the output files exist on disk and are non-empty.
4. Set context variables:
   - `spec_path`: `.docs/product-manager/{{context.product_name}}-spec.md`
   - `matrix_path`: `.docs/product-manager/{{context.product_name}}-eisenhower.md`

## 🛑 Atomic Checklist & Anti-Shortcut Gate
- [ ] Checked that output files are written to `.docs/product-manager/`.
- [ ] Confirmed that projections contain rendered context rather than raw template tags.
- [ ] Verified inventory table entry.

## Stop Criteria
All projections generated and verified on disk. Emit `PROJECTED`.

## Signals
- `PROJECTED`
