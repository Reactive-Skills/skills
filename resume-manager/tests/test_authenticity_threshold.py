"""Regression checks for the resume style policy, not detector accuracy."""

from pathlib import Path
import re
import unittest


SKILL_DIR = Path(__file__).resolve().parents[1]


def read(relative_path):
    return (SKILL_DIR / relative_path).read_text(encoding="utf-8")


def state_block(name):
    """Extract a named top-level state from this manifest's existing layout."""
    match = re.search(
        rf"(?ms)^  {re.escape(name)}:\n(.*?)(?=^  [A-Z_]+:|\Z)",
        read("skill.yaml"),
    )
    if match is None:
        raise AssertionError(f"Missing state: {name}")
    return match.group(1)


def probabilities(block):
    return [
        float(value)
        for value in re.findall(r"(?m)^\s+min_probability: ([0-9.]+)$", block)
    ]


class AuthenticityThresholdTests(unittest.TestCase):
    def test_resume_threshold_is_seventy_percent(self):
        self.assertEqual(probabilities(state_block("AUTHENTICITY_REVIEW")), [0.70])

    def test_observed_seventy_five_percent_score_passes_style_policy(self):
        threshold, = probabilities(state_block("AUTHENTICITY_REVIEW"))
        self.assertGreaterEqual(0.75, threshold)

    def test_style_policy_boundary(self):
        threshold, = probabilities(state_block("AUTHENTICITY_REVIEW"))
        for score, accepted in [(0.69, False), (0.70, True), (0.75, True), (0.80, True)]:
            with self.subTest(score=score):
                self.assertEqual(score >= threshold, accepted)

    def test_factual_guards_remain_mandatory(self):
        block = state_block("AUTHENTICITY_REVIEW")
        self.assertIn(
            "guard: payload.authenticity_flag_count == 0 && payload.unverified_metric_count == 0",
            block,
        )
        self.assertIn(
            "guard: payload.authenticity_flag_count > 0 || payload.unverified_metric_count > 0",
            block,
        )
        self.assertIn("fallback_target: DRAFTING", block)
        self.assertIn("read as written by the candidate", block)
        self.assertNotIn("min_confidence:", block)

    def test_other_gates_are_unchanged(self):
        self.assertEqual(probabilities(state_block("DRAFTING")), [0.80])
        self.assertEqual(probabilities(state_block("PROFILE_SELECTION")), [0.80, 0.80])
        self.assertEqual(probabilities(state_block("RECORD_ACCOMPLISHMENT")), [0.85])
        self.assertIn(
            "guard: payload.timeline_reconciled == true && payload.unresolved_gap_count == 0",
            state_block("DRAFTING"),
        )

    def test_guard_contract_matches_runtime_policy(self):
        contract = read("guards/resume_authenticity_audit.yaml")
        self.assertIn('accept: ">= 0.70"', contract)
        self.assertIn('reject: "< 0.70"', contract)
        self.assertEqual(probabilities(contract), [0.70])
        self.assertIn("failure_behavior: fail_closed", contract)

    def test_state_diagram_and_documentation_match_policy(self):
        self.assertIn("P(clean) is below 0.70", read("states/authenticity_review.md"))
        diagram = read("STATECHART.md")
        self.assertIn("resume predicate judgment P(clean) >= 0.70", diagram)
        self.assertIn("resume P(clean) < 0.70", diagram)
        self.assertIn("voice predicate judgment P(clean) >= 0.80", diagram)
        for path in ("SKILL.md", "README.md"):
            with self.subTest(path=path):
                self.assertIn("P(clean) >= 0.70", read(path))


if __name__ == "__main__":
    unittest.main()
