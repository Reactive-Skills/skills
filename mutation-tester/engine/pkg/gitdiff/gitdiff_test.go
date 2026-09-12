package gitdiff

import (
	"testing"

	"github.com/reactive-skills/mutation-tester/pkg/mutant"
)

func TestParseUnifiedDiff(t *testing.T) {
	sampleDiff := `diff --git a/pkg/calc.go b/pkg/calc.go
index 83a21..b294a 100644
--- a/pkg/calc.go
+++ b/pkg/calc.go
@@ -10,4 +10,6 @@ func Add(a, b int) int {
+	if a == 0 {
+		return b
+	}
 	return a + b
 }
`
	ranges, err := ParseUnifiedDiff(sampleDiff)
	if err != nil {
		t.Fatalf("ParseUnifiedDiff failed: %v", err)
	}

	rList, found := ranges["pkg/calc.go"]
	if !found {
		t.Fatal("expected 'pkg/calc.go' in parsed ranges")
	}

	if len(rList) != 1 {
		t.Fatalf("expected 1 range, got %d", len(rList))
	}

	if rList[0].Start != 10 || rList[0].End != 15 {
		t.Errorf("expected range [10, 15], got [%d, %d]", rList[0].Start, rList[0].End)
	}
}

func TestFilterMutantsByDiff(t *testing.T) {
	diffMap := map[string][]LineRange{
		"pkg/calc.go": {
			{Start: 10, End: 15},
		},
	}

	mutants := []mutant.Mutant{
		{ID: "MUT_001", FilePath: "pkg/calc.go", LineNumber: 11},
		{ID: "MUT_002", FilePath: "pkg/calc.go", LineNumber: 25}, // outside diff
		{ID: "MUT_003", FilePath: "pkg/other.go", LineNumber: 12}, // untouched file
	}

	filtered := FilterMutantsByDiff(mutants, diffMap)
	if len(filtered) != 1 {
		t.Fatalf("expected 1 filtered mutant, got %d", len(filtered))
	}

	if filtered[0].ID != "MUT_001" {
		t.Errorf("expected MUT_001, got %s", filtered[0].ID)
	}
}
