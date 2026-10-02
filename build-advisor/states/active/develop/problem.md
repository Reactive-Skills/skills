# Identify the problem

Use context.situation and context.evidence to describe the customer and recurring pain.
Evaluate existing alternatives, including doing nothing or solving the problem without creating a new product.
Explain why this problem matters now.
Ask for missing customer or pain information rather than inventing a persona.
Record unverified demand as an assumption.
Save context.problem with basis_version, customer, pain, why_now, and alternatives.
Use context.basis_version as the record's basis_version.

## Atomic checklist

- [ ] Customer and pain are concrete.
- [ ] Alternatives include an existing or simpler approach.
- [ ] Demand claims cite evidence or remain labeled unverified.
- [ ] Record uses the current basis.

Emit: PROBLEM_FRAMED with problem in payload.contextUpdates.
