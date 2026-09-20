# CI/CD Automation Context & Invariants

## Core Invariants
1. **Least-Privilege Permissions**: Workflows must default to `permissions: contents: read` unless explicit write access is needed for release tagging.
2. **Deterministic Caching**: Cache keys must hash manifest and lockfiles (e.g. `${{ hashFiles('**/package-lock.json') }}`).
3. **Action Pinning**: Third-party actions must declare explicit versions or commit SHAs to prevent supply chain tampering.
