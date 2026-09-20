# CONTEXT — security-scan

## Ubiquitous Language

| Term | Definition |
|---|---|
| **Staged Files** | Git-tracked files that have been added to the index (`git add`) and are pending commit |
| **Secret** | A high-entropy string matching known credential patterns (API keys, tokens, private keys) |
| **Credential** | Hardcoded passwords, bearer tokens, or authentication keys embedded in source code |
| **Insecure Config** | Configuration that poses security risk: hardcoded IPs, debug mode enabled, weak crypto defaults |
| **Finding** | A specific security violation detected during scanning, classified by severity |
| **Severity** | Classification: critical (immediate risk), high (likely exploit), medium (potential risk), low (best practice) |
| **Scan** | A pass over staged files for a specific category of security issue |
| **Remediation** | Actionable fix recommendation for each finding |
| **Bubble Event** | A signal emitted from a substate that propagates to a parent composite state |

## Domain Boundaries

- **In scope**: Git staged file collection, regex-based secret detection, entropy heuristics, credential scanning, insecure config detection, findings classification, remediation checklist generation
- **Out of scope**: Runtime security monitoring, vulnerability scanning of dependencies, network security scanning, live API testing

## Statechart Invariants

1. **Staged Files Before Scan**: `SCAN_PIPELINE` must not be entered unless `staged_files` is non-empty (enforced by `STAGED_FILES` guard: `staged_files.length > 0`).
2. **Scan Completes Before Report**: `REPORT` must not be entered unless all scan sub-states pass (enforced by `exit_code === 0` guards).
3. **Critical Secrets Block**: Any scan sub-state finding a critical-severity secret must emit `CRITICAL_SECRET_FOUND` → `BLOCKED`.
4. **Report Before Gate**: `GATE` human review must not be reached unless `REPORT.REMEDIATION` has completed.
5. **Remediation Returns to Scan**: If user requests remediation at `GATE`, the skill must return to `SCAN_PIPELINE` (re-run all scans), not skip any.
6. **No Orphaned State Prompts**: Every `.md` file under `states/` must be referenced by an active state in `skill.yaml`.

## Secrets Handling

This skill processes secrets and credentials as its primary input. The `context_sanitizer` middleware hook is mandatory and must:
- Redact all values matching `*_TOKEN`, `*_KEY`, `*_SECRET`, `*_PASSWORD` before any LLM context binding
- Redact `-----BEGIN PRIVATE KEY-----` blocks in their entirety
- Redact `bearer` tokens and `api_key` values

## Schema Version

This skill uses `schema_version: "2.0.0"` of the Reactive Skills manifest format. Middleware hooks (telemetry, audit, metrics, invariant_checker, context_sanitizer) are declared in the v2.2.0-compatible `middleware` block but are processed by the runtime engine.
