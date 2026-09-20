# 🧪 TDD Refactor

> Hierarchical TDD & Refactoring state machine with nested micro-cycles, regression detection, event bubbling, and live projections.

---

## Overview

`tdd-refactor` enforces the strict Red-Green-Refactor discipline as an event-driven reactive state machine. It prevents implementation without failing tests, prevents committing with broken suites, and ensures clean refactoring passes without behavioral regression.

## Workflow

```mermaid
flowchart LR
    INIT --> SETUP_RUNTIME
    SETUP_RUNTIME --> RED_SPEC
    RED_SPEC --> VERIFY_FAIL
    VERIFY_FAIL --> GREEN_IMPL
    GREEN_IMPL --> VERIFY_PASS
    VERIFY_PASS --> REFACTOR_DISCIPLINE
    REFACTOR_DISCIPLINE --> VERIFY_REFACTOR
    VERIFY_REFACTOR -->|Pass| COMPLETED
    VERIFY_REFACTOR -->|Fail| REGRESSION_DETECTED
```

## Quick Start

```bash
npx -y @reactive-skills/axi invoke tdd-refactor --payload '{
  "target_file": "src/service.ts",
  "test_file": "tests/service.test.ts"
}'
```
