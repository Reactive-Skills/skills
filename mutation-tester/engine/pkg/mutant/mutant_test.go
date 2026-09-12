package mutant

import (
	"testing"
)

func TestScanSourceOperators(t *testing.T) {
	code := `
func Calculate(a, b int) int {
	// this is a comment with == and <= that should be ignored
	msg := "string with == and + that should be ignored"
	if a == b {
		return true
	}
	if a <= 10 {
		return false
	}
	if a != 0 && b > 0 {
		return a + b
	}
	return a * b
}
`
	mutants, err := ScanSource("calc.go", []byte(code))
	if err != nil {
		t.Fatalf("ScanSource failed: %v", err)
	}

	if len(mutants) == 0 {
		t.Fatal("expected mutants to be found, got 0")
	}

	// Verify no mutant was generated inside comments or strings
	for _, m := range mutants {
		if m.LineNumber == 3 || m.LineNumber == 4 {
			t.Errorf("mutant was generated inside comment or string on line %d: %+v", m.LineNumber, m)
		}
	}

	// Verify equality invert
	foundEquality := false
	for _, m := range mutants {
		if m.OriginalToken == "==" && m.MutatedToken == "!=" {
			foundEquality = true
			break
		}
	}
	if !foundEquality {
		t.Error("expected to find '==' -> '!=' mutant")
	}

	// Verify relational boundary
	foundLE := false
	for _, m := range mutants {
		if m.OriginalToken == "<=" && m.MutatedToken == "<" {
			foundLE = true
			break
		}
	}
	if !foundLE {
		t.Error("expected to find '<=' -> '<' mutant")
	}

	// Verify boolean flip
	foundBoolFlip := false
	for _, m := range mutants {
		if m.OriginalToken == "return true" && m.MutatedToken == "return false" {
			foundBoolFlip = true
			break
		}
	}
	if !foundBoolFlip {
		t.Error("expected to find 'return true' -> 'return false' mutant")
	}
}

func TestApplyMutant(t *testing.T) {
	orig := "if a == b { return true }"
	m := Mutant{
		OriginalToken: "==",
		MutatedToken:  "!=",
		StartOffset:   5,
		EndOffset:     7,
	}

	mutated, err := ApplyMutant([]byte(orig), m)
	if err != nil {
		t.Fatalf("ApplyMutant failed: %v", err)
	}

	expected := "if a != b { return true }"
	if string(mutated) != expected {
		t.Errorf("expected %q, got %q", expected, string(mutated))
	}
}

func TestScanPythonCode(t *testing.T) {
	pyCode := `
def check(val):
    # comment with <= 5
    if val <= 10:
        return True
    return False
`
	mutants, err := ScanSource("check.py", []byte(pyCode))
	if err != nil {
		t.Fatalf("ScanSource failed: %v", err)
	}

	for _, m := range mutants {
		if m.LineNumber == 3 {
			t.Errorf("mutant generated inside python comment on line 3: %+v", m)
		}
	}

	foundLE := false
	for _, m := range mutants {
		if m.OriginalToken == "<=" && m.MutatedToken == "<" {
			foundLE = true
			break
		}
	}
	if !foundLE {
		t.Error("expected to find '<=' -> '<' in python code")
	}
}
