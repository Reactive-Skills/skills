# Ubiquitous Domain Context: Mutation Tester

## Glossary

| Term | Definition |
| :--- | :--- |
| **Mutant** | A synthetic syntactic defect introduced into source code (e.g. changing `a < b` to `a <= b`). |
| **Mutation Score** | The primary quality metric: `Killed / (Total Mutants - Compile Errors) * 100%`. |
| **Killed Mutant** | The test suite failed when the mutant was injected. High kill rate indicates strong tests. |
| **Survived Mutant** | The test suite passed despite the mutant being injected. Indicates missing assertions or test gaps. |
| **Differential Mutation** | Constraining mutant generation strictly to lines modified in `git diff`. |
| **Atomic Swap** | In-place file modification with immediate defer restoration ensuring zero orphaned changes. |

## 4-Pillar Invariants

- **Security**: Subprocess test commands must execute with sanitized working directories and without arbitrary shell string concatenation.
- **Performance**: Every mutant execution is constrained by a strict timeout (default 5s) to eliminate hanging infinite loops.
- **Reliability**: Source code backups must guarantee 100% restoration of original source files even upon interruption.
- **Tooling**: Baseline test suite must pass completely before any mutants are generated.
