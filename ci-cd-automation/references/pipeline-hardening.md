# CI/CD Pipeline Hardening & Performance Guide

Reference patterns for secure, rapid continuous integration workflows.

## 1. Supply Chain & Workflow Security
- **Action Pinning**: Pin third-party GitHub Actions to full 40-character commit SHAs with inline version comments:
  ```yaml
  uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
  ```
- **Untrusted Trigger Isolation**: Avoid using `pull_request_target` with explicit checkouts of fork code. Prefer `pull_request` to run forks in restricted permission sandboxes.
- **Secret Minimization**: Only inject secrets into the specific steps that require them, rather than defining them globally at the job level.

## 2. Pipeline Speed & Caching Strategies
- **Path Filtering**: Use `paths-ignore:` (e.g. `docs/**`, `*.md`) to prevent redundant CI runs on documentation-only commits.
- **Fail Fast Matrices**: Set `strategy: fail-fast: true` to abort matrix testing immediately upon the first platform failure.
- **Artifact Expiration**: Configure `retention-days: 7` or shorter on temporary build artifacts to conserve storage quotas.
