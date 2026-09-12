# Mutation Testing Scorecard

- **Target Directory:** `D:\brand\projects\sash\libs\go\go-core\ddd`
- **Runner Command:** `go test ./...`
- **Differential Scope:** Full Suite

## Summary Metrics

| Metric | Count | Rate |
| :--- | :--- | :--- |
| **Mutation Score** | **80.0%** | Effective Kill Rate |
| Total Mutants | 5 | 100.0% |
| Killed | 4 | 80.0% |
| Survived | 1 | 20.0% |
| Timed Out | 0 | 0.0% |
| Compile Errors | 0 | 0.0% |

## Quality Verdict

✅ **Pass:** Mutation score meets or exceeds the 80.0% quality gate threshold.

## Surviving Mutants (Test Gaps)

| ID | Location | Operator | Mutation |
| :--- | :--- | :--- | :--- |
| `MUT_0001` | `value_object.go:32` | EqualityInvert | `==` ➔ `!=` |
