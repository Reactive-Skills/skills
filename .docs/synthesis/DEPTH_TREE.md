# Depth Tree Execution Gates (Unlazy)

## Leaves
- [ ] **[tdd_direct] leaf-1-scaffold-skill:** Scaffold mutation-tester reactive skill structure via skill-manager
  - `CHECK:` `powershell -Command &quot;Test-Path skills/mutation-tester/skill.yaml&quot;`
  - `EXPECT:` `True`
- [ ] **[tdd_direct] leaf-2-ast-mutator:** Implement pure-Go syntax mutator operators and tests
  - `CHECK:` `cd skills/mutation-tester/engine; go test -v ./pkg/mutant/...`
  - `EXPECT:` `exit code 0`
- [ ] **[tdd_direct] leaf-3-detector-scoper:** Implement runner auto-detection and git-diff line range scoping
  - `CHECK:` `cd skills/mutation-tester/engine; go test -v ./pkg/detector/... ./pkg/gitdiff/...`
  - `EXPECT:` `exit code 0`
- [ ] **[tdd_direct] leaf-4-runner-sandbox:** Implement atomic file swap, process execution timeout, and rollback
  - `CHECK:` `cd skills/mutation-tester/engine; go test -v ./pkg/runner/...`
  - `EXPECT:` `exit code 0`
- [ ] **[tdd_direct] leaf-5-scorecard-reporting:** Implement mutation score calculation and markdown/json scorecard reporting
  - `CHECK:` `cd skills/mutation-tester/engine; go test -v ./pkg/reporter/...`
  - `EXPECT:` `exit code 0`
- [ ] **[tdd_direct] leaf-6-skill-integration:** Complete reactive skill statechart and compile mutate CLI binary
  - `CHECK:` `cd skills/mutation-tester/engine; go build -o ../bin/mutate.exe ./cmd/mutate`
  - `EXPECT:` `exit code 0`
