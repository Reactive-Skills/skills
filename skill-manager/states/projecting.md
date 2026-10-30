# PROJECTING State

## Goal
Write deliverable projections: skill manifest snapshot and inventory.

## Inputs and evidence
Consume the observed `context.target_type`, operation, changed file list and verification receipts.
A passive UPDATE snapshot identifies the passive target and actual files; it has no reactive topology or fabricated manifest.
After migration record the observed reactive target; after DELETE record missing.
Read the runtime-owned job archive and correlate it with the retained UUID before claiming completion.

## Outputs
The Reactive Skills engine handles the Handlebars template projections automatically in the background.

## Signal
Emit: `PROJECTED`
