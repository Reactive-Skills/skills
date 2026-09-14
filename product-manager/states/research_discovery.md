# RESEARCH_DISCOVERY State

## Goal
Investigate the opportunity's core problem space, target persona, jobs-to-be-done (JTBD), existing user workarounds, and competitive or internal landscape.

## Context Variables Read
- `context.opportunity_type` ("NEW_PRODUCT" | "PRODUCT_ENHANCEMENT")
- `context.product_name`

## Tools
- `search_web`
- `read_url_content`
- `view_file`
- `grep_search`
- `ask_question`

## Instructions
1. **Problem Exploration**:
   - What specific, tangible friction or pain point triggers this opportunity?
   - Who experiences this problem? Define the primary target persona / Ideal Customer Profile (ICP).
   - What are users currently doing to solve or endure this problem today (spreadsheets, manual scripts, competing tools, hacked workflows)?
2. **Context-Specific Research**:
   - For `NEW_PRODUCT`: Search external ecosystem, competitors, market validation signals, and user discussions to understand state-of-the-art expectations.
   - For `PRODUCT_ENHANCEMENT`: Search existing codebase architecture, current user flows, database schemas, and documentation to pinpoint where the enhancement touches existing seams.
3. **Synthesis**:
   - Formulate a crisp, 1-2 sentence Problem Statement.
   - Identify 2-3 primary User Jobs-to-be-Done (JTBD).
   - Document known constraints (regulatory, platform, latency, backward-compatibility).
4. Update context:
   - `problem_statement`: Crisp formulation of the core pain point.
   - `target_persona`: Concrete description of the beneficiary.

## 🛑 Atomic Checklist & Anti-Shortcut Gate
- [ ] Grounded problem statement in verifiable evidence or codebase realities (not generic AI platitudes).
- [ ] Identified the real existing alternative or workaround users rely on today.
- [ ] Documented at least two tangible user jobs-to-be-done.
- [ ] If research discovers this should actually be a different opportunity type, emit `PIVOT_INTAKE`.

## Stop Criteria
Discovery research complete. Emit `DISCOVERY_COMPLETED` to advance to worthwhileness validation.

## Signals
- `DISCOVERY_COMPLETED`
- `PIVOT_INTAKE`
