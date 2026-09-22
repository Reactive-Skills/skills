# CLASSIFY

Classify each PR using the triage policy.

## Actions
1. Assign risk: low, medium, or high.
2. Assign size: small, medium, or large.
3. Identify owning team and required reviewer classes.
4. Record the evidence and rule used for each classification.

Each classification must include `risk`, `size`, `owner`, `reviewer_classes`, and `evidence` fields.

## Atomic checklist
- [ ] Every item has risk and size.
- [ ] Ownership is explicit.
- [ ] Reviewer requirements are explicit.
- [ ] Classification evidence is recorded.

## Signal
Emit `CLASSIFICATION_COMPLETE` with a non-empty `classifications` array containing the required fields, or `CLASSIFICATION_FAILED` when classification is incomplete.
