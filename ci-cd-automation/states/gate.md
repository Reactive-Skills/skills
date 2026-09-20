# GATE State — CI/CD Automation

## Goal
Evaluate pipeline generation scorecard and issue release approval or block decision.

## Instructions
1. Review generated workflow, lint status, and security audit findings.
2. If zero security vulnerabilities and zero syntax errors exist, emit `APPROVE`.
3. If findings remain unresolved, emit `REJECT`.
