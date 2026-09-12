# Ubiquitous Domain Glossary

> Authoritative definitions for core business concepts and domain vocabulary.

| Term | Definition & Context |
| :--- | :--- |
| **Mutant** | A syntactic modification introduced into source code to verify test suite efficacy. |
| **Mutation Score** | The percentage of killed mutants over total valid mutants: Killed / (Killed + Survived). |
| **Differential Mutation** | Targeting mutations strictly to lines modified in the current git working tree or PR diff. |
| **Mutant State** | Execution outcome of a mutant: KILLED (test caught it), SURVIVED (test missed it), TIMED_OUT, or COMPILE_ERROR. |
| **Mutator Operator** | An AST transformation rule (e.g., ConditionalBoundary, EqualityReplacement, MathOperator, ReturnFlip). |
| **Test Runner Adapter** | Subprocess execution contract specifying test invocation command, timeout, and regex/exit code interpretation. |
