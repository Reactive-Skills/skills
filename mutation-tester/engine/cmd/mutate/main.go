package main

import (
	"context"
	"flag"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/reactive-skills/mutation-tester/pkg/detector"
	"github.com/reactive-skills/mutation-tester/pkg/gitdiff"
	"github.com/reactive-skills/mutation-tester/pkg/mutant"
	"github.com/reactive-skills/mutation-tester/pkg/reporter"
	"github.com/reactive-skills/mutation-tester/pkg/runner"
)

func main() {
	targetDir := flag.String("dir", ".", "Target repository directory to mutate")
	runnerCmd := flag.String("runner", "", "Test runner command (auto-detected if blank)")
	diffRef := flag.String("diff", "", "Git diff reference for differential mutation (e.g. HEAD, HEAD~1)")
	timeoutSec := flag.Int("timeout", 5, "Per-mutant test execution timeout in seconds")
	outMd := flag.String("out-md", ".docs/mutation-scorecard.md", "Output markdown scorecard path")
	outJSON := flag.String("out-json", ".docs/mutation-report.json", "Output JSON report path")
	listOnly := flag.Bool("list", false, "Scan and list candidate mutants without running test suite")

	flag.Parse()

	absTargetDir, err := filepath.Abs(*targetDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error resolving target directory: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("🔍 Inspecting workspace: %s\n", absTargetDir)

	// 1. Detect test runner if not provided
	activeRunner := *runnerCmd
	if activeRunner == "" {
		cfg, err := detector.DetectWorkspace(absTargetDir)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error detecting workspace: %v\n", err)
			os.Exit(1)
		}
		activeRunner = cfg.TestCommand
		fmt.Printf("📦 Detected ecosystem: %s -> Default runner: %s\n", cfg.Type, activeRunner)
	} else {
		fmt.Printf("⚙️ Using explicit runner: %s\n", activeRunner)
	}

	// 2. Resolve differential line ranges if diffRef is set
	var diffMap map[string][]gitdiff.LineRange
	if *diffRef != "" {
		fmt.Printf("🌿 Computing differential changes against %s...\n", *diffRef)
		gitCmd := exec.Command("git", "diff", *diffRef)
		gitCmd.Dir = absTargetDir
		diffOut, err := gitCmd.CombinedOutput()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error running git diff: %v\n%s\n", err, string(diffOut))
			os.Exit(1)
		}
		diffMap, err = gitdiff.ParseUnifiedDiff(string(diffOut))
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error parsing git diff: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("   Found modifications in %d files\n", len(diffMap))
	}

	// 3. Collect source files
	var filesToScan []string
	err = filepath.WalkDir(absTargetDir, func(path string, d fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if d.IsDir() {
			name := d.Name()
			if name == ".git" || name == "node_modules" || name == "vendor" || name == ".reactive" || name == "dist" || name == "build" || name == "target" || name == "bin" || name == "obj" || name == ".pytest_cache" || name == ".nx" {
				return filepath.SkipDir
			}
			return nil
		}

		ext := filepath.Ext(path)
		// Multi-language extension check (Go, TS, JS, Python, Rust, C#, Java)
		if ext == ".go" || ext == ".ts" || ext == ".js" || ext == ".py" || ext == ".rs" || ext == ".cs" || ext == ".java" {
			baseName := d.Name()
			// Skip test and declaration files from mutation
			if strings.HasSuffix(path, ".d.ts") || strings.HasSuffix(path, ".min.js") ||
				strings.HasSuffix(path, "_test.go") ||
				strings.HasSuffix(path, ".test.ts") || strings.HasSuffix(path, ".spec.ts") ||
				strings.HasSuffix(path, ".test.js") || strings.HasSuffix(path, ".spec.js") ||
				strings.HasPrefix(baseName, "test_") || strings.HasSuffix(baseName, "_test.py") ||
				strings.HasSuffix(baseName, "Test.cs") || strings.HasSuffix(baseName, "Tests.cs") ||
				strings.HasSuffix(baseName, "Test.java") || strings.HasSuffix(baseName, "Tests.java") ||
				strings.Contains(path, "/tests/") || strings.Contains(path, "\\tests\\") ||
				strings.Contains(path, "/test/") || strings.Contains(path, "\\test\\") {
				return nil
			}
			filesToScan = append(filesToScan, path)
		}
		return nil
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error scanning source files: %v\n", err)
		os.Exit(1)
	}

	// 4. Synthesize mutants
	var allMutants []mutant.Mutant
	for _, f := range filesToScan {
		content, err := os.ReadFile(f)
		if err != nil {
			continue
		}
		relPath, _ := filepath.Rel(absTargetDir, f)
		fileMutants, err := mutant.ScanSource(relPath, content)
		if err != nil {
			continue
		}
		allMutants = append(allMutants, fileMutants...)
	}

	// 5. Apply diff filter if requested
	if len(diffMap) > 0 {
		allMutants = gitdiff.FilterMutantsByDiff(allMutants, diffMap)
	}

	fmt.Printf("🧬 Synthesized %d candidate mutants across %d source files\n", len(allMutants), len(filesToScan))

	if *listOnly {
		for _, m := range allMutants {
			fmt.Printf("  [%s] %s:%d - %s: '%s' -> '%s'\n", m.ID, m.FilePath, m.LineNumber, m.Operator, m.OriginalToken, m.MutatedToken)
		}
		return
	}

	if len(allMutants) == 0 {
		fmt.Println("⚠️ Zero valid mutants found in scope.")
		return
	}

	// 6. Verify Baseline (clean suite run)
	fmt.Printf("🧪 Running baseline test suite without mutations...\n")
	timeoutDur := time.Duration(*timeoutSec) * time.Second
	baselineRes, err := runner.ExecuteTestCommand(context.Background(), activeRunner, absTargetDir, timeoutDur*2)
	if err != nil || baselineRes.ExitCode != 0 {
		fmt.Fprintf(os.Stderr, "❌ Baseline test run failed (exit code %d). Codebase must pass all tests before mutating.\nOutput:\n%s\n", baselineRes.ExitCode, baselineRes.Stdout)
		os.Exit(1)
	}
	fmt.Println("✅ Baseline tests passed cleanly.")

	// 7. Execute Mutants
	fmt.Printf("⚡ Evaluating %d mutants (timeout: %v per mutant)...\n", len(allMutants), timeoutDur)
	for i := range allMutants {
		m := &allMutants[i]
		outcome, _, err := runner.EvaluateMutant(*m, absTargetDir, activeRunner, timeoutDur)
		if err != nil {
			m.Outcome = mutant.OutcomeCompileError
		} else {
			m.Outcome = outcome
		}

		symbol := "💥"
		if m.Outcome == mutant.OutcomeSurvived {
			symbol = "⚠️"
		} else if m.Outcome == mutant.OutcomeTimedOut {
			symbol = "⏳"
		} else if m.Outcome == mutant.OutcomeCompileError {
			symbol = "🚫"
		}

		fmt.Printf("  %s [%s] %s:%d (%s) -> %s\n", symbol, m.ID, m.FilePath, m.LineNumber, m.Operator, m.Outcome)
	}

	// 8. Calculate Scorecard
	scorecard := reporter.CalculateScorecard(allMutants)
	fmt.Println("\n=======================================================")
	fmt.Printf("📊 FINAL MUTATION SCORE: %.1f%%\n", scorecard.MutationScore)
	fmt.Printf("   Total: %d | Killed: %d | Survived: %d | Timed Out: %d | Compile Errors: %d\n",
		scorecard.TotalMutants, scorecard.Killed, scorecard.Survived, scorecard.TimedOut, scorecard.CompileErrors)
	fmt.Println("=======================================================")

	// 9. Write deliverables
	mdContent := reporter.GenerateMarkdownReport(scorecard, *targetDir, activeRunner, *diffRef)
	if *outMd != "" {
		_ = os.MkdirAll(filepath.Dir(*outMd), 0755)
		if err := os.WriteFile(*outMd, []byte(mdContent), 0644); err == nil {
			fmt.Printf("📝 Wrote markdown scorecard to: %s\n", *outMd)
		}
	}

	jsonBytes, err := reporter.GenerateJSONReport(scorecard)
	if err == nil && *outJSON != "" {
		_ = os.MkdirAll(filepath.Dir(*outJSON), 0755)
		if err := os.WriteFile(*outJSON, jsonBytes, 0644); err == nil {
			fmt.Printf("💾 Wrote JSON report to: %s\n", *outJSON)
		}
	}
}
