# Frame the situation

Capture context.situation: question, domain, stage, decision_owner, and constraints.
Domain is product, leadership, business, team, or career.
Record the actual stage; ask when it materially changes advice.
Choose context.route: develop, challenge, or advise from the user's intent.
Ask only missing questions needed to select or complete this route.
Record context.evidence as entries with id, claim, kind, and source.
Kinds are observed, interpretation, assumption, and conviction.
An empty evidence array is allowed; disclose that limitation.
Never invent customer interviews, metrics, or sources.
Reuse current-basis artifacts from other routes as inputs.
Retain context.basis_version unless circumstances changed.

## Atomic checklist

- [ ] Decision question, domain, stage, owner, and constraints are recorded.
- [ ] Evidence labels distinguish observation from belief.
- [ ] Selected route matches the requested work.

Emit: DEVELOP_SELECTED, CHALLENGE_SELECTED, or ADVISE_SELECTED with situation, route, and evidence in payload.contextUpdates.
