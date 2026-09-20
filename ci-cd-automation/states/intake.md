# INTAKE State — CI/CD Automation

## Goal
Collect target CI provider, project build instructions, and verification requirements.

## Instructions
1. Verify target provider (`github-actions` or `gitlab-ci`).
2. Identify target branches for triggers (`main`, `master`, pull requests).
3. Confirm test and build commands to execute within the workflow.
4. Emit `CONFIGURE` to proceed to stack detection, or `ABORT` to terminate.
