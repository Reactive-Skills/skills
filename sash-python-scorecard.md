# Mutation Testing Scorecard

- **Target Directory:** `D:\brand\projects\sash\libs\python\python-core`
- **Runner Command:** `pytest`
- **Differential Scope:** Full Suite

## Summary Metrics

| Metric | Count | Rate |
| :--- | :--- | :--- |
| **Mutation Score** | **89.5%** | Effective Kill Rate |
| Total Mutants | 19 | 100.0% |
| Killed | 17 | 89.5% |
| Survived | 2 | 10.5% |
| Timed Out | 0 | 0.0% |
| Compile Errors | 0 | 0.0% |

## Quality Verdict

✅ **Pass:** Mutation score meets or exceeds the 80.0% quality gate threshold.

## Surviving Mutants (Test Gaps)

| ID | Location | Operator | Mutation |
| :--- | :--- | :--- | :--- |
| `MUT_0001` | `python_core\ddd\unique_id.py:12` | ArithmeticMul | `*` ➔ `/` |
| `MUT_0001` | `python_core\specifications.py:115` | ReturnBooleanFlip | `return True` ➔ `return False` |
