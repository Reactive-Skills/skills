# ROUTE

Build the routing and disposition plan.

## Actions
1. Order PRs by risk, dependency, and review urgency.
2. Assign each PR to an owner, reviewer, or rework queue.
3. Attach required actions and evidence links.
4. Produce the routing plan for human review.

Each route must include `route`, `required_actions`, and `evidence` fields.

## Atomic checklist
- [ ] Every assessed PR has a route.
- [ ] Priorities are deterministic.
- [ ] Required actions are explicit.
- [ ] Routing plan is non-empty.

## Signal
Emit `ROUTING_COMPLETE` with a non-empty `routing_plan` containing the required fields, or `ROUTING_FAILED` when routing is incomplete.
