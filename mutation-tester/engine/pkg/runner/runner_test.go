package runner

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestApplyAndSwapAndRestore(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "runner_test_*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	targetFile := filepath.Join(tmpDir, "test.txt")
	origContent := "original content"
	if err := os.WriteFile(targetFile, []byte(origContent), 0644); err != nil {
		t.Fatalf("failed to write initial file: %v", err)
	}

	mutatedContent := "mutated content"
	handle, err := ApplyAndSwap(targetFile, []byte(mutatedContent))
	if err != nil {
		t.Fatalf("ApplyAndSwap failed: %v", err)
	}

	// Verify file now has mutated content
	curBytes, err := os.ReadFile(targetFile)
	if err != nil {
		t.Fatalf("failed to read mutated file: %v", err)
	}
	if string(curBytes) != mutatedContent {
		t.Errorf("expected mutated content, got %s", string(curBytes))
	}

	// Restore
	if err := handle.Restore(); err != nil {
		t.Fatalf("Restore failed: %v", err)
	}

	// Verify file is back to original
	restoredBytes, err := os.ReadFile(targetFile)
	if err != nil {
		t.Fatalf("failed to read restored file: %v", err)
	}
	if string(restoredBytes) != origContent {
		t.Errorf("expected restored content %q, got %q", origContent, string(restoredBytes))
	}

	// Verify backup file was removed
	if _, err := os.Stat(handle.backupPath); !os.IsNotExist(err) {
		t.Errorf("expected backup file %s to be removed", handle.backupPath)
	}
}

func TestExecuteTestCommandSuccess(t *testing.T) {
	// Simple command that succeeds
	res, err := ExecuteTestCommand(context.Background(), "go version", "", 3*time.Second)
	if err != nil {
		t.Fatalf("ExecuteTestCommand failed: %v", err)
	}

	if res.ExitCode != 0 {
		t.Errorf("expected exit code 0, got %d", res.ExitCode)
	}
	if res.TimedOut {
		t.Error("expected command not to time out")
	}
}
