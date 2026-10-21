"""Regression checks that the style judgments see only the text they judge."""

from pathlib import Path
import re
import unittest


SKILL_DIR = Path(__file__).resolve().parents[1]

VOICE_CRITERION = (
    'Does the cover letter in cover_letter_text follow the voice_register professional voice standards '
    'and stay free of AI writing clichés (such as "I am writing to express my enthusiastic interest", '
    '"testament to", "delve", "leverage", "synergy"), corporate buzzword slop, and ungrounded flattery?'
)


def read(relative_path):
    return (SKILL_DIR / relative_path).read_text(encoding="utf-8")


def state_block(name):
    match = re.search(
        rf"(?ms)^  {re.escape(name)}:\n(.*?)(?=^  [A-Z_]+:|\Z)",
        read("skill.yaml"),
    )
    if match is None:
        raise AssertionError(f"Missing state: {name}")
    return match.group(1)


def top_level_list(name):
    match = re.search(rf"(?ms)^{name}:\n((?:  - .*\n)+)", read("skill.yaml"))
    if match is None:
        raise AssertionError(f"Missing list: {name}")
    return re.findall(r"  - (\S+)", match.group(1))


class JudgmentScopeTests(unittest.TestCase):
    def test_voice_judgment_sees_only_the_letter(self):
        block = state_block("DRAFTING")
        self.assertIn("context_paths: [cover_letter_text, voice_register]", block)
        self.assertIn("include_payload: false", block)
        self.assertIn(VOICE_CRITERION, block)

    def test_resume_judgment_sees_only_the_resume(self):
        block = state_block("AUTHENTICITY_REVIEW")
        self.assertIn("context_paths: [resume_text]", block)
        self.assertIn("include_payload: false", block)

    def test_judged_fields_reach_context_before_the_guard(self):
        keys = top_level_list("context_keys")
        for key in ("cover_letter_text", "voice_register", "resume_text"):
            with self.subTest(key=key):
                self.assertIn(key, keys)
        defaults = read("skill.yaml")
        self.assertIn("  cover_letter_text: null", defaults)
        self.assertIn("  voice_register: null", defaults)

    def test_runtime_capability_is_required(self):
        self.assertRegex(read("skill.yaml"), r"(?m)^    - judgment\.context_paths$")

    def test_guard_contracts_match_the_manifest(self):
        voice = read("guards/voice_standards_audit.yaml")
        self.assertIn(VOICE_CRITERION, voice)
        self.assertIn("context_paths: [cover_letter_text, voice_register]", voice)
        self.assertIn("include_payload: false", voice)
        resume = read("guards/resume_authenticity_audit.yaml")
        self.assertIn("context_paths: [resume_text]", resume)
        self.assertIn("include_payload: false", resume)

    def test_state_prompts_send_judged_text_as_top_level_fields(self):
        drafting = read("states/drafting.md")
        self.assertIn('"cover_letter_text": cover_letter_text', drafting)
        self.assertIn('"voice_register": voice_register', drafting)
        review = read("states/authenticity_review.md")
        self.assertIn('"resume_text": resume_text', review)


if __name__ == "__main__":
    unittest.main()
