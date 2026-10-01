---
name: systems-diagnosis
description: Design a bounded intervention test
type: reactive
---

# DESIGN_TEST

Turn the selected option into a bounded, reversible test.

State the expected effect, leading and lagging indicators, observation period, likely delay, side effects to watch, and stop condition.

Store the test_plan in contextUpdates.

Keep the test advisory. The user decides whether to run it.

## Anti-Shortcut Gate

- Do not recommend a test without an observable outcome.
- Do not ignore delayed or harmful side effects.
- Return to leverage selection if the test is unsafe or cannot be evaluated.

Emit TEST_DESIGNED when the plan has measures, timing, and a stop condition.

Emit TEST_UNSAFE when those conditions cannot be met.

## Signals

- TEST_DESIGNED
- TEST_UNSAFE
