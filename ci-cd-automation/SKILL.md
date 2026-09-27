---
name: ci-cd-automation
description: >-
  Automated CI/CD pipeline generator and linter that scaffolds production-ready workflows with caching, matrix builds, and security gates.
metadata:
  author: Reactive-Skills
  version: "1.0.0"
  type: reactive
---

<!-- REACTIVE BOOTLOADER -->
> The authoritative bootloader is served by the Reactive Skills runtime.
> Retrieve it before loading full skill context:
> - MCP: call `reactive_bootloader` with `skill_name: "ci-cd-automation"`.
> - AXI: run `reactive-skills-axi bootloader ci-cd-automation --json`.
> - Zero-install AXI: run `npx -y @reactive-skills/axi bootloader ci-cd-automation --json`.
> Follow the returned `instructions`, then call `reactive_context_prepare` before assembling prompt context when MCP is available.
> If bootloader retrieval is unavailable, continue with the directly requested runtime path and do not preload unrelated skill context.
<!-- END REACTIVE BOOTLOADER -->

# CI/CD Automation

`ci-cd-automation` scaffolds and verifies production-ready CI/CD workflows for GitHub Actions and GitLab CI. It inspects repository package manifests, configures optimal dependency caching, enforces least-privilege token permissions, and performs pre-deployment security audits.

## Workflow

`INTAKE -> DETECT_STACK -> GENERATE_PIPELINE -> LINT_WORKFLOW -> SECURITY_AUDIT -> GATE -> SUCCESS`

Failures terminate in `ERROR`; syntax or security violations terminate in `BLOCKED`.

## Usage

```bash
npx -y @reactive-skills/axi invoke ci-cd-automation --payload '{"provider":"github-actions","test_command":"npm test","build_command":"npm run build"}'
```

## Deliverables

Generated workflows land under `.github/workflows/` with auditing summaries projected into `.docs/ci-cd-automation/`.
