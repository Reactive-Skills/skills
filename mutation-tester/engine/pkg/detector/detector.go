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
	TypeDotnet ProjectType = "dotnet"
	TypeJava   ProjectType = "java"
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
// by walking up level-by-level so the closest indicator in a monorepo wins.
func DetectWorkspace(dir string) (*ProjectConfig, error) {
	curr, err := filepath.Abs(dir)
	if err != nil {
		curr = dir
	}

	for {
		// Level check: Java
		if fileExists(filepath.Join(curr, "pom.xml")) {
			return &ProjectConfig{
				Type:        TypeJava,
				TestCommand: "mvn test",
				SourceGlobs: []string{"*.java", "**/*.java"},
			}, nil
		}
		if fileExists(filepath.Join(curr, "build.gradle")) || fileExists(filepath.Join(curr, "build.gradle.kts")) {
			return &ProjectConfig{
				Type:        TypeJava,
				TestCommand: "gradle test",
				SourceGlobs: []string{"*.java", "**/*.java"},
			}, nil
		}

		// Level check: Python
		if fileExists(filepath.Join(curr, "pyproject.toml")) || fileExists(filepath.Join(curr, "pytest.ini")) || fileExists(filepath.Join(curr, "setup.py")) {
			return &ProjectConfig{
				Type:        TypePython,
				TestCommand: "pytest",
				SourceGlobs: []string{"*.py", "**/*.py"},
			}, nil
		}

		// Level check: Rust
		if fileExists(filepath.Join(curr, "Cargo.toml")) {
			return &ProjectConfig{
				Type:        TypeRust,
				TestCommand: "cargo test",
				SourceGlobs: []string{"*.rs", "**/*.rs"},
			}, nil
		}

		// Level check: .NET / C#
		if fileExists(filepath.Join(curr, "Directory.Build.props")) || hasGlobMatch(curr, "*.sln") || hasGlobMatch(curr, "*.slnx") || hasGlobMatch(curr, "*.csproj") {
			return &ProjectConfig{
				Type:        TypeDotnet,
				TestCommand: "dotnet test",
				SourceGlobs: []string{"*.cs", "**/*.cs"},
			}, nil
		}

		// Level check: Go
		if fileExists(filepath.Join(curr, "go.mod")) || fileExists(filepath.Join(curr, "go.work")) {
			return &ProjectConfig{
				Type:        TypeGo,
				TestCommand: "go test ./...",
				SourceGlobs: []string{"*.go", "**/*.go"},
			}, nil
		}

		// Level check: Node / TS
		if fileExists(filepath.Join(curr, "package.json")) {
			return &ProjectConfig{
				Type:        TypeNode,
				TestCommand: "npm test",
				SourceGlobs: []string{"*.ts", "*.js", "**/*.ts", "**/*.js"},
			}, nil
		}

		parent := filepath.Dir(curr)
		if parent == curr {
			break
		}
		curr = parent
	}

	// Default fallback
	return &ProjectConfig{
		Type:        TypeCustom,
		TestCommand: "go test ./...",
		SourceGlobs: []string{"*.go", "*.ts", "*.js", "*.py", "*.rs", "*.cs", "*.java"},
	}, nil
}

func findAncestorFile(dir, fileName string) string {
	curr, err := filepath.Abs(dir)
	if err != nil {
		curr = dir
	}
	for {
		candidate := filepath.Join(curr, fileName)
		if fileExists(candidate) {
			return candidate
		}
		parent := filepath.Dir(curr)
		if parent == curr {
			break
		}
		curr = parent
	}
	return ""
}

func hasAncestorGlob(dir, pattern string) bool {
	curr, err := filepath.Abs(dir)
	if err != nil {
		curr = dir
	}
	for {
		matches, err := filepath.Glob(filepath.Join(curr, pattern))
		if err == nil && len(matches) > 0 {
			return true
		}
		parent := filepath.Dir(curr)
		if parent == curr {
			break
		}
		curr = parent
	}
	return false
}

func hasGlobMatch(dir string, pattern string) bool {
	matches, err := filepath.Glob(filepath.Join(dir, pattern))
	return err == nil && len(matches) > 0
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return !info.IsDir()
}
