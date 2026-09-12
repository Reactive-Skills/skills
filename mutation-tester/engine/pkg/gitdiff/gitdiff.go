package gitdiff

import (
	"bufio"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"github.com/reactive-skills/mutation-tester/pkg/mutant"
)

// LineRange represents an inclusive line interval [Start, End]
type LineRange struct {
	Start int `json:"start"`
	End   int `json:"end"`
}

var hunkHeaderRegex = regexp.MustCompile(`^@@\s+-[0-9]+(?:,[0-9]+)?\s+\+([0-9]+)(?:,([0-9]+))?\s+@@`)

// ParseUnifiedDiff parses a standard unified git diff into modified line ranges per file
func ParseUnifiedDiff(diffText string) (map[string][]LineRange, error) {
	fileRanges := make(map[string][]LineRange)
	scanner := bufio.NewScanner(strings.NewReader(diffText))

	var currentFile string

	for scanner.Scan() {
		line := scanner.Text()

		// Match +++ b/path/to/file
		if strings.HasPrefix(line, "+++ b/") {
			currentFile = filepath.ToSlash(filepath.Clean(strings.TrimPrefix(line, "+++ b/")))
			continue
		} else if strings.HasPrefix(line, "+++ ") {
			currentFile = filepath.ToSlash(filepath.Clean(strings.TrimPrefix(line, "+++ ")))
			continue
		}

		if currentFile == "" {
			continue
		}

		// Match @@ -a,b +c,d @@
		matches := hunkHeaderRegex.FindStringSubmatch(line)
		if len(matches) >= 2 {
			startLine, err := strconv.Atoi(matches[1])
			if err != nil {
				continue
			}

			lineCount := 1
			if len(matches) >= 3 && matches[2] != "" {
				count, err := strconv.Atoi(matches[2])
				if err == nil {
					lineCount = count
				}
			}

			if lineCount > 0 {
				rng := LineRange{
					Start: startLine,
					End:   startLine + lineCount - 1,
				}
				fileRanges[currentFile] = append(fileRanges[currentFile], rng)
			}
		}
	}

	return fileRanges, nil
}

// FilterMutantsByDiff retains only mutants whose line number falls within changed diff ranges.
// If diffMap is empty or nil, all mutants are returned.
func FilterMutantsByDiff(mutants []mutant.Mutant, diffMap map[string][]LineRange) []mutant.Mutant {
	if len(diffMap) == 0 {
		return mutants
	}

	var filtered []mutant.Mutant

	for _, m := range mutants {
		cleanPath := filepath.ToSlash(filepath.Clean(m.FilePath))
		ranges, found := diffMap[cleanPath]
		if !found {
			// Try matching just the base name or suffix if paths differ by root
			for f, r := range diffMap {
				if strings.HasSuffix(cleanPath, f) || strings.HasSuffix(f, cleanPath) {
					ranges = r
					found = true
					break
				}
			}
		}

		if !found {
			continue
		}

		// Check if line falls in range
		for _, rng := range ranges {
			if m.LineNumber >= rng.Start && m.LineNumber <= rng.End {
				filtered = append(filtered, m)
				break
			}
		}
	}

	return filtered
}
