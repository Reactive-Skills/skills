package calc

import "testing"

func TestAdd(t *testing.T) {
	if Add(2, 3) != 5 {
		t.Fatalf("expected 5, got %d", Add(2, 3))
	}
}

func TestIsPositive(t *testing.T) {
	if !IsPositive(10) {
		t.Fatalf("expected 10 to be positive")
	}
	if IsPositive(-5) {
		t.Fatalf("expected -5 to not be positive")
	}
	if IsPositive(0) {
		t.Fatalf("expected 0 to not be positive")
	}
}
