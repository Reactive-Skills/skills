# SELECT_OPPORTUNITY_TYPE State

## Goal
Classify the product intake into either a brand-new green-field product/opportunity or a feature enhancement on an existing product, and bind the product identifier.

## Context Variables Read
- `context.opportunity_type`: null | "NEW_PRODUCT" | "PRODUCT_ENHANCEMENT"
- `context.product_name`: string identifier (lowercase, alphanumeric, hyphens)

## Tools
- `ask_question`
- `view_file`
- `list_dir`

## Instructions
1. Inspect the workspace and review user input to identify if this is:
   - `NEW_PRODUCT`: A brand-new product, standalone service, library, CLI tool, or independent application.
   - `PRODUCT_ENHANCEMENT`: A new feature, enhancement, subsystem, or major capability added to an existing codebase.
2. Confirm the canonical `product_name` identifier (e.g. `billing-dashboard`, `ai-code-reviewer`, `customer-portal`).
3. If not already provided in context, use `ask_question` to solicit or confirm the opportunity type and product name from the human.
4. Set context variables:
   - `opportunity_type`: `"NEW_PRODUCT"` or `"PRODUCT_ENHANCEMENT"`
   - `product_name`: clean kebab-case name string

## 🛑 Atomic Checklist & Anti-Shortcut Gate
- [ ] Confirmed whether the scope is green-field or an enhancement of an existing codebase.
- [ ] Validated that `product_name` is non-empty, lowercase, and hyphen-delimited.
- [ ] Ensured `opportunity_type` is strictly either `NEW_PRODUCT` or `PRODUCT_ENHANCEMENT`.

## Stop Criteria
Opportunity type and product name are confirmed and bound to context. Emit `OPPORTUNITY_SELECTED`.

## Signals
- `OPPORTUNITY_SELECTED` (guard: `context.opportunity_type != null`)
