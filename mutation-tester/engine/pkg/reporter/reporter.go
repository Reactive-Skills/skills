package reporter

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/reactive-skills/mutation-tester/pkg/mutant"
)

// Scorecard aggregates all mutation metrics
type Scorecard struct {
	TotalMutants   int             `json:"total_mutants"`
	Killed         int             `json:"killed_mutants"`
	Survived       int             `json:"survived_mutants"`
	TimedOut       int             `json:"timed_out_mutants"`
	CompileErrors  int             `json:"compile_error_mutants"`
	MutationScore  float64         `json:"mutation_score"`
	Mutants        []mutant.Mutant `json:"mutants,omitempty"`
}

// CalculateScorecard computes kill rate and aggregates mutant outcomes
func CalculateScorecard(mutants []mutant.Mutant) Scorecard {
	sc := Scorecard{
		TotalMutants: len(mutants),
		Mutants:      mutants,
	}

	for _, m := range mutants {
		switch m.Outcome {
		case mutant.OutcomeKilled:
			sc.Killed++
		case mutant.OutcomeSurvived:
			sc.Survived++
		case mutant.OutcomeTimedOut:
			sc.TimedOut++
		case mutant.OutcomeCompileError:
			sc.CompileErrors++
		}
	}

	effectiveTotal := sc.TotalMutants - sc.CompileErrors
	if effectiveTotal > 0 {
		sc.MutationScore = float64(sc.Killed+sc.TimedOut) / float64(effectiveTotal) * 100.0
	} else {
		sc.MutationScore = 0.0
	}

	return sc
}

// GenerateMarkdownReport produces a formatted Markdown scorecard
func GenerateMarkdownReport(sc Scorecard, targetDir, runnerCmd, diffRef string) string {
	var sb strings.Builder

	sb.WriteString("# Mutation Testing Scorecard\n\n")
	sb.WriteString(fmt.Sprintf("- **Target Directory:** `%s`\n", targetDir))
	sb.WriteString(fmt.Sprintf("- **Runner Command:** `%s`\n", runnerCmd))
	if diffRef != "" {
		sb.WriteString(fmt.Sprintf("- **Differential Scope:** `%s`\n", diffRef))
	} else {
		sb.WriteString("- **Differential Scope:** Full Suite\n")
	}

	sb.WriteString("\n## Summary Metrics\n\n")
	sb.WriteString("| Metric | Count | Rate |\n")
	sb.WriteString("| :--- | :--- | :--- |\n")
	sb.WriteString(fmt.Sprintf("| **Mutation Score** | **%.1f%%** | Effective Kill Rate |\n", sc.MutationScore))
	sb.WriteString(fmt.Sprintf("| Total Mutants | %d | 100.0%% |\n", sc.TotalMutants))
	sb.WriteString(fmt.Sprintf("| Killed | %d | %.1f%% |\n", sc.Killed, percentage(sc.Killed, sc.TotalMutants)))
	sb.WriteString(fmt.Sprintf("| Survived | %d | %.1f%% |\n", sc.Survived, percentage(sc.Survived, sc.TotalMutants)))
	sb.WriteString(fmt.Sprintf("| Timed Out | %d | %.1f%% |\n", sc.TimedOut, percentage(sc.TimedOut, sc.TotalMutants)))
	sb.WriteString(fmt.Sprintf("| Compile Errors | %d | %.1f%% |\n", sc.CompileErrors, percentage(sc.CompileErrors, sc.TotalMutants)))

	// Quality Verdict
	sb.WriteString("\n## Quality Verdict\n\n")
	if sc.MutationScore >= 80.0 {
		sb.WriteString("✅ **Pass:** Mutation score meets or exceeds the 80.0% quality gate threshold.\n")
	} else {
		sb.WriteString("⚠️ **Action Required:** Mutation score is below the 80.0% threshold. Tests missed synthetic faults.\n")
	}

	// Surviving Mutants List
	var surviving []mutant.Mutant
	for _, m := range sc.Mutants {
		if m.Outcome == mutant.OutcomeSurvived {
			surviving = append(surviving, m)
		}
	}

	if len(surviving) > 0 {
		sb.WriteString("\n## Surviving Mutants (Test Gaps)\n\n")
		sb.WriteString("| ID | Location | Operator | Mutation |\n")
		sb.WriteString("| :--- | :--- | :--- | :--- |\n")
		for _, m := range surviving {
			sb.WriteString(fmt.Sprintf("| `%s` | `%s:%d` | %s | `%s` ➔ `%s` |\n",
				m.ID, m.FilePath, m.LineNumber, m.Operator, m.OriginalToken, m.MutatedToken))
		}
	}

	return sb.String()
}

// GenerateJSONReport serializes the scorecard to formatted JSON
func GenerateJSONReport(sc Scorecard) ([]byte, error) {
	return json.MarshalIndent(sc, "", "  ")
}

func percentage(count, total int) float64 {
	if total == 0 {
		return 0.0
	}
	return float64(count) / float64(total) * 100.0
}
