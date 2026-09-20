# GATE State — Browser Verifier

## Goal
Evaluate end-to-end browser verification results and issue a final approval or block decision.

## Instructions
1. Review test scorecard: DOM assertion status, console errors count, network failure count, and artifact capture.
2. If all DOM assertions passed and zero console errors occurred, emit `APPROVE`.
3. If any assertion failed or console errors were encountered, emit `REJECT`.
