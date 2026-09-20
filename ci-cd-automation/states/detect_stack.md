# DETECT_STACK State — CI/CD Automation

## Goal
Detect repository language ecosystem, dependency manager, and caching strategy.

## Instructions
1. Inspect repository root for package manifests (`package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`).
2. Identify lockfiles to determine package managers (`pnpm-lock.yaml`, `package-lock.json`, `poetry.lock`).
3. Set `context.ecosystem` and determine cache directory paths.
4. Emit `DETECTED` upon resolution, or `FAIL` if repository type is unsupported.
