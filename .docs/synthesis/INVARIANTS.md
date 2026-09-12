# Architectural Stealth Invariants

- [x] **Security:** Subprocess test command execution must be strictly scoped to the repository directory with sanitized environment variables and no arbitrary shell interpolation.
- [x] **Performance:** Per-mutant test execution must enforce an aggressive timeout ceiling (default 5s) to terminate infinite loops promptly, and file swap/restore overhead must stay under 5ms per mutant.
- [x] **Reliability:** Source code integrity is paramount: pristine original files must be backed up before mutation and restored via atomic defer/signal handlers with zero surviving side-effects on disk.
- [x] **Tooling:** Baseline test suite must pass 100% with exit code 0 before mutant generation begins; skill package must pass strict reactive validator with valid skill.yaml v2.2.0 schema.
