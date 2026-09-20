# GENERATE_PIPELINE State — CI/CD Automation

## Goal
Scaffold production-ready workflow definition with caching, matrix execution, and least-privilege tokens.

## Instructions
1. Generate workflow YAML file under `.github/workflows/ci.yml` (or `.gitlab-ci.yml`).
2. Configure explicit least-privilege permissions (`permissions: contents: read`).
3. Wire dependency caching actions (`actions/cache`, `actions/setup-node` with cache flag).
4. Save target path to `context.workflow_path` and emit `GENERATED`.
