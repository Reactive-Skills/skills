# Research Design Planner

A single reactive skill for users who know their next research task and users who are still exploring.
It routes into a small relevant section of Creswell and Creswell's research design framework.
The hierarchical state machine keeps the active prompt focused on the current question.

## What it helps with

- Explore a topic and shape a research problem.
- Relate a literature gap and theory or conceptual framework to the study.
- Choose or refine a quantitative, qualitative, or mixed methods approach.
- Plan surveys, experiments, qualitative strategies, or mixed methods procedures.
- Draft an introduction, purpose or aim, and research questions or hypotheses.
- Review a design and identify missing information, alignment issues, ethics considerations, and next steps.

The skill accepts uncertainty and asks one focused question at a time.
A user can enter with a broad goal, an unfinished idea, a specific method question, a proposal section, or an existing plan.

## Design principles

Explicit user choices remain deterministic.
Semantic recommendations use bounded categorical choices with an `other` option.
The minimum confidence for a recommendation is 0.7.
Low confidence, invalid choice shapes, or judgment errors route to clarification.
Generation states are separate from decision states.
The skill stores only relevant, non-identifying study context.

## Source

Creswell, J. W., & Creswell, J. D. (2023).
*Research Design: Qualitative, Quantitative, and Mixed Methods Approaches* (6th ed.).
SAGE Publications.

The skill paraphrases the book's approach-selection, proposal, quantitative, qualitative, and mixed methods guidance.
It does not replace program requirements, an ethics review process, or current institutional rules.

## Runtime use

The installed Reactive Skills runtime serves the authoritative bootloader.
Use the runtime's `invoke`, `state`, and `emit` workflow to start or continue a run.
MCP users should load the skill through the runtime's bootloader and context router.
Do not treat this README as a substitute for state prompts.

## State layout

```text
research-design-planner/
|-- skill.yaml
|-- SKILL.md
|-- CONTEXT.md
|-- STATECHART.md
|-- README.md
|-- guards/
|   |-- .gitkeep
|-- states/
|   |-- init.md
|   |-- setup_runtime.md
|   |-- bypass_detected.md
|   |-- intake.md
|   |-- clarify.md
|   |-- decisions/
|   |   |-- _parent.md
|   |   |-- route_task.md
|   |   |-- choose_approach.md
|   |   |-- choose_quantitative_design.md
|   |   |-- choose_qualitative_strategy.md
|   |   |-- choose_mixed_methods_design.md
|   |-- foundations/
|   |   |-- _parent.md
|   |   |-- topic_and_problem.md
|   |   |-- literature_and_theory.md
|   |   |-- writing_and_ethics.md
|   |-- proposal/
|   |   |-- _parent.md
|   |   |-- introduction.md
|   |   |-- purpose_and_aim.md
|   |   |-- questions_and_hypotheses.md
|   |-- quantitative/
|   |   |-- _parent.md
|   |   |-- survey.md
|   |   |-- experiment.md
|   |   |-- analysis_preregistration_validity.md
|   |-- qualitative/
|   |   |-- _parent.md
|   |   |-- access_sampling_collection.md
|   |   |-- analysis_validation_reporting.md
|   |-- mixed_methods/
|   |   |-- _parent.md
|   |   |-- strand_procedures.md
|   |   |-- integration_and_interpretation.md
|   |-- synthesize.md
|-- templates/
|   |-- snapshot.md.hbs
|   |-- inventory.json.hbs
|   |-- reactive_bootloader.md.hbs
|   |-- init_state.md.hbs
|   |-- bypass_detected.md.hbs
```
