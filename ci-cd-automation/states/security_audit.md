# SECURITY_AUDIT State — CI/CD Automation

## Goal
Audit pipeline for credential leakage risks, unpinned third-party actions, and dangerous trigger contexts.

## Instructions
1. Check that third-party actions are pinned to full commit SHAs or verified major versions.
2. Confirm untrusted pull requests do not execute with elevated write permissions (`pull_request_target` audit).
3. Ensure secrets are passed exclusively via explicit `env:` mappings, never logged to stdout.
4. If zero security findings exist, emit `SECURE`. Otherwise, record in `context.security_findings` and emit `VULNERABILITY_FOUND`.
