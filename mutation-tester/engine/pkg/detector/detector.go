package detector

import (
	"os"
	"path/filepath"
)

// ProjectType represents the detected language/ecosystem
type ProjectType string

const (
	TypeGo     ProjectType = "go"
	TypeNode   ProjectType = "node"
	TypePython ProjectType = "python"
	TypeRust   ProjectType = "rust"
	TypeCustom ProjectType = "custom"
)

// ProjectConfig contains auto-detected or configured test runner settings
type ProjectConfig struct {
	Type        ProjectType `json:"type"`
	TestCommand string      `json:"test_command"`
	SourceGlobs []string    `json:"source_globs"`
	ConfigFile  string      `json:"config_file,omitempty"`
}

// DetectWorkspace inspects a directory and infers the project type and default test runner
func DetectWorkspace(dir string) (*ProjectConfig, error) {
	// 1. Check for Go
	if fileExists(filepath.Join(dir, "go.mod")) {
		return &ProjectConfig{
			Type:        TypeGo,
			TestCommand: "go test ./...",
			SourceGlobs: []string{"*.go", "**/*.go"},
		}, nil
	}

	// 2. Check for Node / TS
	if fileExists(filepath.Join(dir, "package.json")) {
		return &ProjectConfig{
			Type:        TypeNode,
			TestCommand: "npm test",
			SourceGlobs: []string{"*.ts", "*.js", "**/*.ts", "**/*.js"},
		}, nil
	}

	// 3. Check for Python
	if fileExists(filepath.Join(dir, "pyproject.toml")) || fileExists(filepath.Join(dir, "pytest.ini")) || fileExists(filepath.Join(dir, "setup.py")) {
		return &ProjectConfig{
			Type:        TypePython,
			TestCommand: "pytest",
			SourceGlobs: []string{"*.py", "**/*.py"},
		}, nil
	}

	// 4. Check for Rust
	if fileExists(filepath.Join(dir, "Cargo.toml")) {
		return &ProjectConfig{
			Type:        TypeRust,
			TestCommand: "cargo test",
			SourceGlobs: []string{"*.rs", "**/*.rs"},
		}, nil
	}

	// Default fallback
	return &ProjectConfig{
		Type:        TypeCustom,
		TestCommand: "go test ./...",
		SourceGlobs: []string{"*.go", "*.ts", "*.js", "*.py"},
	}, nil
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return !info.IsDir()
}
