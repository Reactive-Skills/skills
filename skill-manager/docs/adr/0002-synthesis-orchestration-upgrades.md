# ADR 0002 � Synthesis: Ingestion of Matt Skills and Parallel Ticket Orchestration

## Status
Proposed

## Context

Synthesis (skill: synthesis, type: reactive) is an event-driven Senior Staff pairing engine for full-lifecycle software delivery. It currently delegates to external skills for specialized workflows:
- wayfinder (decision mapping)
- grill-with-docs (Socratic discovery)
- slice-architect (vertical slicing)
- platform-assessment (baseline audit)
- unlazy (depth tree execution)
- tdd (test-first development)
- code-review (standards + spec review)

Several concerns have emerged:

**1. Skill-manager is not an orchestration engine.**
Skill-manager manages the lifecycle of skills (CREATE, UPDATE, DELETE, MIGRATE_LEGACY, MIGRATE_REACTIVE) locally on the machine. It is not designed to orchestrate multi-ticket workflow execution across a codebase.

**2. Synthesis needs significant upgrades to be a proper inception-to-deployment engine.**

### 2a. Internalize wayfinder
Wayfinder should be internalized as synthesis states rather than an external skill. The wayfinder pattern (decision tickets, blocking edges, resolving one at a time) should become synthesis-native HSM states.

### 2b. Parallel ticket orchestration
Synthesis should be able to monitor an issue tracker, track which tickets have their blockers resolved, and dispatch subagents to the frontier in parallel. When multiple tickets become unblocked simultaneously, they should be dispatched concurrently rather than sequentially.

### 2c. Concurrency model
When multiple subagents run in parallel, synthesis must track their individual completion signals without blocking. This may require:
- A composite state for parallel subagent execution
- Per-subagent completion signals (SUBAGENT_DONE_1, SUBAGENT_DONE_2, etc.)
- A collecting state that waits for all parallel results before transitioning

### 2d. Bridge with Matt skills workflow
The ask-matt skill describes the main flow: grill-with-docs ? to-spec ? to-tickets ? implement per ticket. Synthesis should be able to consume this workflow natively while also supporting direct invocation.

### 2e. Self-contained operation
Synthesis should not rely on external skills for its core operations. The entire delivery lifecycle should be representable as synthesis HSM states without requiring external skill invocations.

### 2f. Orchestrator-agnostic execution
Synthesis must be able to delegate work to any orchestrator without binding to a specific implementation. The choice of orchestrator is a runtime configuration, not a hard dependency. Supported orchestrators should be swappable:
- **subagent** (default): native subagent dispatch within the current harness
- **crewai**: CrewAI flow or crew for parallel agent execution
- **firstmate-like**: supervisor + worktree-isolated agents with zero-token event-driven supervision
- Future: any harness that exposes a task dispatch interface

This follows a snap-on/off principle: synthesis owns the state machine, sequencing, and decision-making; the orchestrator handles only task execution. If the orchestrator changes, only the execution layer of synthesis changes � the HSM topology does not.

### 2g. Brand voice alignment
When wayfinder is internalized and converted to HSM states, the Matt skill's language and framing should be replaced with Brandon's / ByteQuilt's own voice and terminology. Synthesis should speak with ByteQuilt's brand voice, not borrowed vocabulary.

### 2h. Repository relocation
Synthesis currently lives in the firstmate/ByteQuilt ecosystem. It should be moved to the ByteQuilt/skills repo alongside other ByteQuilt skills, so it is installable via `npx skills add` and versioned alongside the skill ecosystem.

### 2i. Vet against latest Reactive Skills spec
Before synthesis is moved to ByteQuilt/skills, it must be vetted against the latest thinking in `<workspace> Skills`. The Reactive Skills architecture (FSMEngine, EventStore, MCP server, JIT prompt loading) is the foundation synthesis should build on. Any gaps between current synthesis design and Reactive Skills v2.0.0 must be resolved before the move.

## Decision

1. Skill-manager is out of scope for workflow orchestration. It remains a CRUD skill for local skill lifecycle management.

2. Synthesis requires a significant upgrade effort before it can serve as the primary orchestration engine. This effort should be the subject of a dedicated grill/lavish session to design the v2 synthesis architecture.

3. Synthesis must be orchestrator-agnostic by design. The execution backend is a runtime configuration, not a hard dependency. The snap-on/off principle applies: any orchestrator that exposes a dispatch interface can be plugged in.

4. When wayfinder is internalized, ByteQuilt brand voice replaces Matt's language throughout.

5. Synthesis moves to ByteQuilt/skills repo once vetted against Reactive Skills latest.

6. For now, proceed with skill-manager implementation using manual frontier tracking for the T1-T7 tickets.

## Consequences

- skill-manager tickets (T1-T7) proceed using manual orchestration
- A new effort is needed to design synthesis v2 (with grill/lavish session)
- The synthesis v2 design must include the orchestrator-agnostic abstraction
- Brand voice alignment is a requirement, not optional
- Synthesis move to ByteQuilt/skills is blocked on Reactive Skills vetting
- The gap between skill-manager (local CRUD) and synthesis (orchestration) is understood and documented

## References

- ask-matt SKILL.md � main flow description
- synthesis SKILL.md � current architecture
- wayfinder skill � decision ticket pattern
- firstmate README.md � supervisor + worktree isolation model (inspiration, not dependency)
- ByteQuilt/skills issues #1-8 � skill-manager spec and tickets
- <workspace> Skills � Reactive Skills latest architecture
- <workspace> � firstmate repo (reference for patterns, not dependency)
