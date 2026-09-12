package detector

import (
	"os"
	"path/filepath"
	"testing"
)

func TestDetectWorkspace(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "detector_test_*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// Create fake go.mod
	goModPath := filepath.Join(tmpDir, "go.mod")
	if err := os.WriteFile(goModPath, []byte("module test"), 0644); err != nil {
		t.Fatalf("failed to write go.mod: %v", err)
	}

	cfg, err := DetectWorkspace(tmpDir)
	if err != nil {
		t.Fatalf("DetectWorkspace failed: %v", err)
	}

	if cfg.Type != TypeGo {
		t.Errorf("expected TypeGo, got %s", cfg.Type)
	}
	if cfg.TestCommand != "go test ./..." {
		t.Errorf("expected 'go test ./...', got %s", cfg.TestCommand)
	}
}
