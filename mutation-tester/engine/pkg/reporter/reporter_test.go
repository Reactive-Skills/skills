package reporter

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/reactive-skills/mutation-tester/pkg/mutant"
)

func TestCalculateScorecard(t *testing.T) {
	mutants := []mutant.Mutant{
		{ID: "M1", Outcome: mutant.OutcomeKilled},
		{ID: "M2", Outcome: mutant.OutcomeKilled},
		{ID: "M3", Outcome: mutant.OutcomeSurvived},
		{ID: "M4", Outcome: mutant.OutcomeTimedOut},     // Timed out counts as caught
		{ID: "M5", Outcome: mutant.OutcomeCompileError}, // Excluded from effective denominator
	}

	sc := CalculateScorecard(mutants)

	if sc.TotalMutants != 5 {
		t.Errorf("expected 5 total mutants, got %d", sc.TotalMutants)
	}
	if sc.Killed != 2 {
		t.Errorf("expected 2 killed, got %d", sc.Killed)
	}
	if sc.Survived != 1 {
		t.Errorf("expected 1 survived, got %d", sc.Survived)
	}
	if sc.TimedOut != 1 {
		t.Errorf("expected 1 timed out, got %d", sc.TimedOut)
	}
	if sc.CompileErrors != 1 {
		t.Errorf("expected 1 compile error, got %d", sc.CompileErrors)
	}

	// Effective total = 4. Caught = 2 (killed) + 1 (timed out) = 3. Score = 3/4 = 75.0%
	if sc.MutationScore != 75.0 {
		t.Errorf("expected 75.0%% mutation score, got %.1f%%", sc.MutationScore)
	}
}

func TestCalculateScorecardEmpty(t *testing.T) {
	sc := CalculateScorecard(nil)
	if sc.MutationScore != 0.0 {
		t.Errorf("expected 0.0 for empty mutants, got %.1f", sc.MutationScore)
	}
}

func TestGenerateMarkdownReport(t *testing.T) {
	mutants := []mutant.Mutant{
		{ID: "M1", FilePath: "foo.go", LineNumber: 10, Operator: "Equality", OriginalToken: "==", MutatedToken: "!=", Outcome: mutant.OutcomeSurvived},
	}
	sc := CalculateScorecard(mutants)

	md := GenerateMarkdownReport(sc, ".", "go test ./...", "HEAD")

	if !strings.Contains(md, "# Mutation Testing Scorecard") {
		t.Error("expected markdown to contain header")
	}
	if !strings.Contains(md, "Surviving Mutants (Test Gaps)") {
		t.Error("expected markdown to list surviving mutants")
	}
	if !strings.Contains(md, "foo.go:10") {
		t.Error("expected markdown to cite foo.go:10")
	}
}

func TestGenerateJSONReport(t *testing.T) {
	sc := Scorecard{
		TotalMutants:  10,
		Killed:        8,
		Survived:      2,
		MutationScore: 80.0,
	}

	bytes, err := GenerateJSONReport(sc)
	if err != nil {
		t.Fatalf("GenerateJSONReport failed: %v", err)
	}

	var parsed Scorecard
	if err := json.Unmarshal(bytes, &parsed); err != nil {
		t.Fatalf("failed to unmarshal generated json: %v", err)
	}

	if parsed.MutationScore != 80.0 {
		t.Errorf("expected 80.0, got %.1f", parsed.MutationScore)
	}
}
