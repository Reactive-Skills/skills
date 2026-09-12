package mutant

import (
	"bytes"
	"fmt"
	"strings"
)

// Outcome represents the execution result of a mutant
type Outcome string

const (
	OutcomeKilled       Outcome = "KILLED"
	OutcomeSurvived     Outcome = "SURVIVED"
	OutcomeTimedOut     Outcome = "TIMED_OUT"
	OutcomeCompileError Outcome = "COMPILE_ERROR"
)

// Mutant describes a single syntactic modification to a source file
type Mutant struct {
	ID            string  `json:"id"`
	FilePath      string  `json:"file_path"`
	LineNumber    int     `json:"line_number"`
	ColumnNumber  int     `json:"column_number"`
	OriginalToken string  `json:"original_token"`
	MutatedToken  string  `json:"mutated_token"`
	Operator      string  `json:"operator"`
	Description   string  `json:"description"`
	StartOffset   int     `json:"start_offset"`
	EndOffset     int     `json:"end_offset"`
	Outcome       Outcome `json:"outcome,omitempty"`
}

// OperatorDefinition maps token pairs
type OperatorDefinition struct {
	Name        string
	Original    string
	Replacement string
}

var multiCharOperators = []OperatorDefinition{
	// JS Triple equality
	{Name: "StrictEquality", Original: "===", Replacement: "!=="},
	{Name: "StrictInequality", Original: "!==", Replacement: "==="},

	// Equality
	{Name: "EqualityInvert", Original: "==", Replacement: "!="},
	{Name: "InequalityInvert", Original: "!=", Replacement: "=="},

	// Relational
	{Name: "RelationalBoundaryLE", Original: "<=", Replacement: "<"},
	{Name: "RelationalBoundaryGE", Original: ">=", Replacement: ">"},

	// Logical
	{Name: "LogicalAndToOr", Original: "&&", Replacement: "||"},
	{Name: "LogicalOrToAnd", Original: "||", Replacement: "&&"},

	// Increment / Decrement
	{Name: "IncrementToDecrement", Original: "++", Replacement: "--"},
	{Name: "DecrementToIncrement", Original: "--", Replacement: "++"},
	{Name: "AddAssignToSubAssign", Original: "+=", Replacement: "-="},
	{Name: "SubAssignToAddAssign", Original: "-=", Replacement: "+="},
}

var singleCharOperators = []OperatorDefinition{
	{Name: "RelationalLessThan", Original: "<", Replacement: "<="},
	{Name: "RelationalGreaterThan", Original: ">", Replacement: ">="},
	{Name: "ArithmeticAdd", Original: "+", Replacement: "-"},
	{Name: "ArithmeticSub", Original: "-", Replacement: "+"},
	{Name: "ArithmeticMul", Original: "*", Replacement: "/"},
	{Name: "ArithmeticDiv", Original: "/", Replacement: "*"},
}

// ScanSource scans source code and identifies all candidate mutants.
// It skips string literals and comments to ensure only active code is mutated.
func ScanSource(filePath string, source []byte) ([]Mutant, error) {
	var mutants []Mutant
	n := len(source)
	line := 1
	col := 1

	mutantIndex := 1

	inDoubleQuote := false
	inSingleQuote := false
	inBacktick := false
	inLineComment := false
	inBlockComment := false

	for i := 0; i < n; i++ {
		ch := source[i]

		// Track line and column numbers
		if ch == '\n' {
			line++
			col = 1
			inLineComment = false
			continue
		} else {
			col++
		}

		// Comment and String handling
		if inLineComment {
			continue
		}
		if inBlockComment {
			if ch == '*' && i+1 < n && source[i+1] == '/' {
				inBlockComment = false
				i++
				col++
			}
			continue
		}
		if inDoubleQuote {
			if ch == '\\' && i+1 < n {
				i++
				col++
				continue
			}
			if ch == '"' {
				inDoubleQuote = false
			}
			continue
		}
		if inSingleQuote {
			if ch == '\\' && i+1 < n {
				i++
				col++
				continue
			}
			if ch == '\'' {
				inSingleQuote = false
			}
			continue
		}
		if inBacktick {
			if ch == '`' {
				inBacktick = false
			}
			continue
		}

		// Check entry into strings or comments
		if ch == '"' {
			inDoubleQuote = true
			continue
		}
		if ch == '\'' {
			inSingleQuote = true
			continue
		}
		if ch == '`' {
			inBacktick = true
			continue
		}
		if ch == '/' && i+1 < n {
			if source[i+1] == '/' {
				inLineComment = true
				i++
				col++
				continue
			} else if source[i+1] == '*' {
				inBlockComment = true
				i++
				col++
				continue
			}
		}
		if ch == '#' { // Python / Shell comment
			inLineComment = true
			continue
		}

		// Check return value mutations: "return true" -> "return false" (Go/TS/JS/Java/C#)
		if strings.HasPrefix(string(source[i:]), "return true") {
			afterIdx := i + len("return true")
			if afterIdx >= n || isBoundaryChar(source[afterIdx]) {
				mutants = append(mutants, Mutant{
					ID:            fmt.Sprintf("MUT_%04d", mutantIndex),
					FilePath:      filePath,
					LineNumber:    line,
					ColumnNumber:  col,
					OriginalToken: "return true",
					MutatedToken:  "return false",
					Operator:      "ReturnBooleanFlip",
					Description:   "Substitute 'return true' with 'return false'",
					StartOffset:   i,
					EndOffset:     afterIdx,
				})
				mutantIndex++
				continue
			}
		}
		if strings.HasPrefix(string(source[i:]), "return false") {
			afterIdx := i + len("return false")
			if afterIdx >= n || isBoundaryChar(source[afterIdx]) {
				mutants = append(mutants, Mutant{
					ID:            fmt.Sprintf("MUT_%04d", mutantIndex),
					FilePath:      filePath,
					LineNumber:    line,
					ColumnNumber:  col,
					OriginalToken: "return false",
					MutatedToken:  "return true",
					Operator:      "ReturnBooleanFlip",
					Description:   "Substitute 'return false' with 'return true'",
					StartOffset:   i,
					EndOffset:     afterIdx,
				})
				mutantIndex++
				continue
			}
		}

		// Check Python return value mutations: "return True" -> "return False"
		if strings.HasPrefix(string(source[i:]), "return True") {
			afterIdx := i + len("return True")
			if afterIdx >= n || isBoundaryChar(source[afterIdx]) {
				mutants = append(mutants, Mutant{
					ID:            fmt.Sprintf("MUT_%04d", mutantIndex),
					FilePath:      filePath,
					LineNumber:    line,
					ColumnNumber:  col,
					OriginalToken: "return True",
					MutatedToken:  "return False",
					Operator:      "ReturnBooleanFlip",
					Description:   "Substitute 'return True' with 'return False'",
					StartOffset:   i,
					EndOffset:     afterIdx,
				})
				mutantIndex++
				continue
			}
		}
		if strings.HasPrefix(string(source[i:]), "return False") {
			afterIdx := i + len("return False")
			if afterIdx >= n || isBoundaryChar(source[afterIdx]) {
				mutants = append(mutants, Mutant{
					ID:            fmt.Sprintf("MUT_%04d", mutantIndex),
					FilePath:      filePath,
					LineNumber:    line,
					ColumnNumber:  col,
					OriginalToken: "return False",
					MutatedToken:  "return True",
					Operator:      "ReturnBooleanFlip",
					Description:   "Substitute 'return False' with 'return True'",
					StartOffset:   i,
					EndOffset:     afterIdx,
				})
				mutantIndex++
				continue
			}
		}

		// Multi-char operators check
		matchedMulti := false
		for _, op := range multiCharOperators {
			opLen := len(op.Original)
			if i+opLen <= n && string(source[i:i+opLen]) == op.Original {
				mutants = append(mutants, Mutant{
					ID:            fmt.Sprintf("MUT_%04d", mutantIndex),
					FilePath:      filePath,
					LineNumber:    line,
					ColumnNumber:  col,
					OriginalToken: op.Original,
					MutatedToken:  op.Replacement,
					Operator:      op.Name,
					Description:   fmt.Sprintf("Mutate '%s' to '%s'", op.Original, op.Replacement),
					StartOffset:   i,
					EndOffset:     i + opLen,
				})
				mutantIndex++
				i += opLen - 1
				col += opLen - 1
				matchedMulti = true
				break
			}
		}
		if matchedMulti {
			continue
		}

		// Single-char operators check
		for _, op := range singleCharOperators {
			if string(ch) == op.Original {
				// Avoid mutating when part of an arrow or pointer or identifier
				if op.Original == "-" && i+1 < n && source[i+1] == '>' {
					continue // -> arrow
				}
				if op.Original == ">" && i > 0 && source[i-1] == '-' {
					continue // -> arrow
				}
				if op.Original == "/" && (i+1 < n && (source[i+1] == '/' || source[i+1] == '*')) {
					continue
				}

				mutants = append(mutants, Mutant{
					ID:            fmt.Sprintf("MUT_%04d", mutantIndex),
					FilePath:      filePath,
					LineNumber:    line,
					ColumnNumber:  col,
					OriginalToken: op.Original,
					MutatedToken:  op.Replacement,
					Operator:      op.Name,
					Description:   fmt.Sprintf("Mutate '%s' to '%s'", op.Original, op.Replacement),
					StartOffset:   i,
					EndOffset:     i + 1,
				})
				mutantIndex++
				break
			}
		}
	}

	return mutants, nil
}

// ApplyMutant returns a new source byte slice with the given mutant substituted
func ApplyMutant(source []byte, m Mutant) ([]byte, error) {
	if m.StartOffset < 0 || m.EndOffset > len(source) || m.StartOffset > m.EndOffset {
		return nil, fmt.Errorf("invalid mutant offset range: [%d:%d] in source of length %d", m.StartOffset, m.EndOffset, len(source))
	}

	var buf bytes.Buffer
	buf.Write(source[:m.StartOffset])
	buf.WriteString(m.MutatedToken)
	buf.Write(source[m.EndOffset:])

	return buf.Bytes(), nil
}

func isBoundaryChar(b byte) bool {
	return b == ';' || b == '\n' || b == '\r' || b == ' ' || b == '\t' || b == ')' || b == '}'
}
