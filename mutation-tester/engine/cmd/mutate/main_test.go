package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"testing"
)

func findBinary() string {
	candidates := []string{
		"../bin/mutate.exe",
		"../../bin/mutate.exe",
		"bin/mutate.exe",
	}
	for _, c := range candidates {
		abs, err := filepath.Abs(c)
		if err == nil {
			if _, err := os.Stat(abs); err == nil {
				return abs
			}
		}
	}
	return ""
}

func TestMutateBinaryHelp(t *testing.T) {
	binPath := findBinary()
	if binPath == "" {
		t.Skip("mutate.exe binary not yet compiled")
	}

	cmd := exec.Command(binPath, "-h")
	out, _ := cmd.CombinedOutput()

	if len(out) == 0 {
		t.Error("expected non-empty output from mutate.exe -h")
	}
}

func TestMutateBinaryList(t *testing.T) {
	binPath := findBinary()
	if binPath == "" {
		t.Skip("mutate.exe binary not yet compiled")
	}

	cmd := exec.Command(binPath, "--list", "--dir", ".")
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("mutate.exe --list failed: %v\nOutput:\n%s", err, string(out))
	}

	if len(out) == 0 {
		t.Error("expected candidate mutants to be listed")
	}
}
