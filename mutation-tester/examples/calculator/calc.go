package calc

// Add computes sum of two integers.
func Add(a, b int) int {
	return a + b
}

// IsPositive returns true if x is strictly greater than 0.
func IsPositive(x int) bool {
	if x > 0 {
		return true
	}
	return false
}
