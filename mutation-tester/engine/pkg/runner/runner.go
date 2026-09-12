package runner

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/reactive-skills/mutation-tester/pkg/mutant"
)

// TestResult holds the subprocess execution output
type TestResult struct {
	ExitCode int           `json:"exit_code"`
	Stdout   string        `json:"stdout"`
	Stderr   string        `json:"stderr"`
	Duration time.Duration `json:"duration"`
	TimedOut bool          `json:"timed_out"`
}

// SwapHandle ensures original files are safely restored
type SwapHandle struct {
	targetPath    string
	originalBytes []byte
	backupPath    string
	restored      bool
}

// ApplyAndSwap backups original file and writes mutated code in-place
func ApplyAndSwap(filePath string, mutated []byte) (*SwapHandle, error) {
	cleanPath := filepath.Clean(filePath)
	origBytes, err := os.ReadFile(cleanPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read original file %s: %w", cleanPath, err)
	}

	backupPath := cleanPath + ".mutation_orig"
	if err := os.WriteFile(backupPath, origBytes, 0644); err != nil {
		return nil, fmt.Errorf("failed to create backup file %s: %w", backupPath, err)
	}

	if err := os.WriteFile(cleanPath, mutated, 0644); err != nil {
		_ = os.Remove(backupPath)
		return nil, fmt.Errorf("failed to write mutated file %s: %w", cleanPath, err)
	}

	return &SwapHandle{
		targetPath:    cleanPath,
		originalBytes: origBytes,
		backupPath:    backupPath,
		restored:      false,
	}, nil
}

// Restore restores the original file content and removes backup
func (h *SwapHandle) Restore() error {
	if h.restored {
		return nil
	}

	defer func() {
		_ = os.Remove(h.backupPath)
		h.restored = true
	}()

	return os.WriteFile(h.targetPath, h.originalBytes, 0644)
}

// ExecuteTestCommand runs a test command string within workDir subject to timeout
func ExecuteTestCommand(ctx context.Context, cmdStr string, workDir string, timeout time.Duration) (*TestResult, error) {
	timeoutCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	var cmd *exec.Cmd
	// Use cross-platform shell wrapper
	parts := strings.Fields(cmdStr)
	if len(parts) == 0 {
		return nil, fmt.Errorf("empty test command")
	}

	if len(parts) == 1 {
		cmd = exec.CommandContext(timeoutCtx, parts[0])
	} else {
		cmd = exec.CommandContext(timeoutCtx, parts[0], parts[1:]...)
	}

	if workDir != "" {
		cmd.Dir = workDir
	}

	start := time.Now()
	out, err := cmd.CombinedOutput()
	duration := time.Since(start)

	exitCode := 0
	timedOut := false

	if err != nil {
		if timeoutCtx.Err() == context.DeadlineExceeded {
			timedOut = true
			exitCode = 124 // Standard timeout exit code
		} else if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			exitCode = 1
		}
	}

	return &TestResult{
		ExitCode: exitCode,
		Stdout:   string(out),
		Stderr:   "",
		Duration: duration,
		TimedOut: timedOut,
	}, nil
}

// EvaluateMutant applies mutant m, executes test command, restores source file, and returns outcome
func EvaluateMutant(m mutant.Mutant, workDir string, testCmd string, timeout time.Duration) (mutant.Outcome, *TestResult, error) {
	fullPath := m.FilePath
	if !filepath.IsAbs(fullPath) && workDir != "" {
		fullPath = filepath.Join(workDir, m.FilePath)
	}

	origSource, err := os.ReadFile(fullPath)
	if err != nil {
		return mutant.OutcomeCompileError, nil, fmt.Errorf("reading source for mutant: %w", err)
	}

	mutatedSource, err := mutant.ApplyMutant(origSource, m)
	if err != nil {
		return mutant.OutcomeCompileError, nil, fmt.Errorf("applying mutant: %w", err)
	}

	handle, err := ApplyAndSwap(fullPath, mutatedSource)
	if err != nil {
		return mutant.OutcomeCompileError, nil, fmt.Errorf("swapping file: %w", err)
	}
	defer handle.Restore()

	result, err := ExecuteTestCommand(context.Background(), testCmd, workDir, timeout)
	if err != nil {
		return mutant.OutcomeCompileError, nil, fmt.Errorf("executing test command: %w", err)
	}

	if result.TimedOut {
		return mutant.OutcomeTimedOut, result, nil
	}

	// Detect compile errors (e.g. "syntax error", "build failed", "cannot compile")
	lowerOut := strings.ToLower(result.Stdout)
	if strings.Contains(lowerOut, "syntax error") || strings.Contains(lowerOut, "compilation failed") || strings.Contains(lowerOut, "[build failed]") {
		return mutant.OutcomeCompileError, result, nil
	}

	if result.ExitCode != 0 {
		return mutant.OutcomeKilled, result, nil
	}

	return mutant.OutcomeSurvived, result, nil
}
