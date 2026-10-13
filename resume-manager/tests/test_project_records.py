"""Contract checks for project records, the benefit-line summary, and interview prep."""

import json
from pathlib import Path
import re
import unittest


SKILL_DIR = Path(__file__).resolve().parents[1]


def read(relative_path):
    return (SKILL_DIR / relative_path).read_text(encoding="utf-8")


class ProjectRecordContractTests(unittest.TestCase):
    def test_release_version_matches_manifest(self):
        manifest = re.search(r"(?m)^version: (\S+)\s*$", read("skill.yaml")).group(1)
        self.assertEqual(json.loads(read("skill-release.json"))["version"], manifest)

    def test_manifest_declares_project_context_keys(self):
        manifest = read("skill.yaml")
        for key in ("project_record", "selected_projects"):
            self.assertRegex(manifest, rf"(?m)^  - {key}\s*$")
            self.assertRegex(manifest, rf"(?m)^  {key}: ")

    def test_records_accumulate_and_gate_key_is_declared(self):
        manifest = read("skill.yaml")
        self.assertRegex(manifest, r"(?m)^  project_record: \[\]\s*$")
        self.assertRegex(manifest, r"(?m)^  - new_accomplishment\s*$")
        self.assertIn("never overwriting earlier entries", read("states/record_accomplishment.md"))

    def test_profiles_without_records_fall_back_to_role_level_text(self):
        for path in (
            "CONTEXT.md",
            "states/gap_analysis.md",
            "states/drafting.md",
            "states/interview_prep.md",
        ):
            self.assertIn("no Project Records", read(path), path)

    def test_master_template_has_project_record_fields(self):
        template = read("templates/master-profile-template.md")
        for field in (
            "Visibility",
            "Ownership",
            "Metrics",
            "Non-Claims",
            "Track Relevance",
            "Keyword Tags",
            "Story Seed",
            "Rendered Bullets",
        ):
            self.assertIn(field, template)

    def test_resume_summary_ends_with_benefit_line(self):
        self.assertIn("benefit_line", read("templates/resume-template.md"))
        self.assertIn("benefit line", read("states/drafting.md"))
        self.assertIn("follow the benefit sentence immediately", read("states/drafting.md"))

    def test_drafting_and_review_enforce_verified_metrics(self):
        drafting = read("states/drafting.md")
        review = read("states/authenticity_review.md")
        self.assertIn("verified: yes", drafting)
        self.assertIn("non-claim", drafting)
        self.assertIn("verified: yes", review)
        self.assertIn("confidential", review)


class InterviewPrepContractTests(unittest.TestCase):
    def test_prep_has_introduction_and_lead_story(self):
        prep = read("states/interview_prep.md")
        self.assertIn("Introduction in 20 words", prep)
        self.assertIn("Lead Story and Backups", prep)
        self.assertIn("own-the-miss", prep)

    def test_hiring_manager_questions_drop_team_culture_topic(self):
        part_b = next(
            line for line in read("states/interview_prep.md").splitlines() if "Part B" in line
        )
        self.assertNotIn("team culture", part_b.lower())

    def test_prep_lists_questions_to_avoid(self):
        prep = read("states/interview_prep.md")
        self.assertIn("Questions to avoid", prep)
        self.assertIn("Do not say early", prep)


if __name__ == "__main__":
    unittest.main()
