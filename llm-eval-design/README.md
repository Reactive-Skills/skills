# LLM Eval Design

An Alpha reactive skill that helps you decide how to measure an LLM application.
It turns a fuzzy goal such as "the bot should be good" into measurable success criteria, picks an eval method for each, designs the graders, and plans the test cases.
The default result is an approved design plan.
You can then opt in to generating an eval harness and, separately, to running it.
It follows Anthropic's guidance on defining success criteria and building evaluations, paraphrased in [docs/methods.md](docs/methods.md).

## Workflow

Describe the application, its users, the model under test, and any labeled data.
Set criteria that are specific, measurable, achievable, and relevant, each with a numeric threshold, a population, and a cited source for the target.
Choose one eval method per criterion: exact or string match, embedding cosine, ROUGE-L, an operational measure, an LLM grader, or a person.
Design graders. An LLM grader gets a rubric, a constrained output, reasoning, and a model different from the model under test.
Approve the plan. Stop there, revise it, or continue.
If you continue, the skill generates a harness in a directory you name, outside the skill, and fixture-tests its deterministic scorers.
Before any model call, you approve a cost estimate, a spending cap, and the name of the environment variable that holds the API key.
The run calibrates each LLM grader against labeled examples first. A grader that disagrees too often sends you back to revise its rubric.
Scoring reports each criterion separately, with grader error counts.
See [CONTEXT.md](CONTEXT.md) for the record protocol and [STATECHART.md](STATECHART.md) for every transition.

## Installation and use

Install this package through the repository's supported source-aware sync workflow into the Reactive Skills runtime.
Runtime 0.16.0 or newer must support bootloader, transport handshake, and runtime.accepted_update_replay.
No evaluation library, paid service, or specific model vendor is required to produce a plan.
A harness run needs a model API key, which you provide through an environment variable of your choice.

```text
reactive-skills-axi bootloader llm-eval-design --json
reactive-skills-axi state llm-eval-design --job my-eval
reactive-skills-axi emit llm-eval-design SIGNAL --job my-eval --payload <JSON>
```

For MCP call reactive_bootloader, then reactive_state and reactive_emit_signal with skill_name llm-eval-design and the same job name.
Follow the returned state instructions. Do not run a static checklist outside the runtime.
Submit protected record updates inside contextUpdates.
Use one job per application or eval project.

## Safety and evidence

No model API call happens before you approve the run.
A credential never enters a payload, prompt, ledger, or projection. Guards refuse payloads that carry credential-like values.
Model identifiers are verified from a current source when the harness is built and again when the run is approved.
Guards validate record structure and arithmetic. They cannot prove a measurement is true or that a person approved.
This Alpha is verified with synthetic transition fixtures.
It does not show that the plans it produces improve any application.
Snapshot, inventory, plan, and report outputs are written under .docs/llm-eval-design/ and archived per job under .docs/llm-eval-design/jobs/<job>/.

## Related skills

experiment-loop is an optional handoff for bounded iterative improvement once an eval exists.
It is not a dependency.
