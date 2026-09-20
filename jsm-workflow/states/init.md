---
name: jsm-workflow
description: Verify reactive runtime before lifecycle execution.
type: reactive
---

# INIT

## Context

This skill must run through the reactive runtime.
Do not execute lifecycle work from this file.

## Objective

Confirm that either AXI CLI or MCP reactive tooling is available.

## Deliverables

Emit one runtime readiness signal.

## Constraints

Do not inspect the repo yet.
Do not create files yet.
Do not continue from memory.

## Atomic Gate

- Runtime check is complete.
- AXI CLI or MCP reactive tooling is available, or runtime setup is not available.
- No SDLC phase work has started.

## Task

If runtime execution is available, emit `RUNTIME_READY`.
If runtime execution is not available, emit `SETUP_REQUIRED`.
