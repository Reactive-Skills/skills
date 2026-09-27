# Contributing Reactive Skills

Thank you for contributing a skill to the official Reactive Skills Registry!

## Principles of a Reactive Skill

1. **Hierarchical State Machine (HSM):** A skill must define explicit states and transitions in `skill.yaml`.
2. **State Independence & Hierarchy:** Each state in `states/**/*.md` must be self-contained and specify exact exit conditions. When workflows merit hierarchy, group sub-states in subdirectories (e.g. `states/<phase>/*.md`) with composite parent bubble-up handlers declared in `skill.yaml`.
3. **Deterministic Guarding:** Use programmatic conditions (`exit_code == 0`, schema validation) rather than subjective completion claims.
4. **Universal Bootloader:** The skill's `SKILL.md` must include the standard `<!-- REACTIVE BOOTLOADER -->` referencing `npx -y @reactive-skills/axi state <skill>` (or `reactive-skills-axi state <skill>`).
5. **Dual Documentation:** Maintain `SKILL.md` for agent execution (with bootloader) and `README.md` for human catalog navigation, installation, and GitHub readability.

## Versioning and Registry Releases

`skill.yaml.version` is the public version of the skill and follows Semantic Versioning (`MAJOR.MINOR.PATCH`).
New skills start at `1.0.0`, while existing skills keep their current version history.
`skill-release.json.version` must exactly match `skill.yaml.version`.
`skill.yaml.schema_version` is the Reactive Skills manifest compatibility version consumed by tooling; it uses SemVer syntax but is independent from the public skill SemVer.
`skill-release.json.reactiveSchemaVersion` must exactly match `skill.yaml.schema_version`.
`skill-release.json.schemaVersion` identifies the format of `skill-release.json` itself and is currently `1`.
Use a major bump for incompatible skill behavior or input/output changes, a minor bump for backward-compatible capability additions, and a patch bump for backward-compatible fixes or documentation updates.
A change to skill content must increase the skill's SemVer; edits limited to release metadata or the top-level `version` and `schema_version` declarations do not count as content changes.
The release validator checks manifest parity, valid SemVer for both independent versions, new skills starting at `1.0.0`, and required skill version increases against the target branch.
The validator rejects removal or renaming of a registered skill until a separate retirement or migration policy is approved.
Update registry skills through pull requests.
The `Require pull requests and CI for main` GitHub ruleset requires the `Validate Reactive Skills` and `Validate Skill Releases` checks before merging.
That ruleset currently requires zero approvals; add an approval requirement after an independent maintainer is available.
Registry release metadata can change without changing the skill's SemVer, but the same pull request and checks are required.
Automatic discovery of releases from another GitHub repository requires that skill's source repository and tag convention to be recorded in its release manifest.

## Skill Structure

```
skills/<skill-name>/
├── SKILL.md       # Entrypoint with universal bootloader for AI agents
├── README.md      # Human-facing documentation and usage guide
├── skill.yaml     # Authoritative statechart specification with a separate schema compatibility identifier
├── skill-release.json # Registry release metadata; skill version mirrors skill.yaml
├── STATECHART.md  # Visual statechart diagram (Mermaid stateDiagram-v2)
├── states/        # State prompt templates (flat *.md or nested <phase>/*.md)
├── guards/        # Custom deterministic guard functions (optional)
└── templates/     # Deliverable projection templates (*.hbs, optional)
```

## Pull Request Checklist

- [ ] Does `skill.yaml.schema_version` identify the Reactive Skills schema expected by the runtime, using SemVer syntax?
- [ ] Does `skill.yaml.version` follow SemVer and match `skill-release.json.version` exactly?
- [ ] Does `skill-release.json.reactiveSchemaVersion` match `skill.yaml.schema_version` exactly?
- [ ] If skill content changed, did its SemVer increase from the target branch?
- [ ] Are all referenced state prompt files present under `states/` with zero orphan files or empty directories?
- [ ] If using composite states, are parent invariants and bubble-up transitions declared in `skill.yaml` and illustrated in `STATECHART.md`?
- [ ] Does `SKILL.md` contain the universal bootloader with `npx -y @reactive-skills/axi`?
- [ ] Does the skill contain a comprehensive `README.md` with usage and installation?
- [ ] Does `node scripts/validate-skills.js` pass with zero errors and zero warnings?
- [ ] Has `node scripts/update-toc.js` been run to update `README.md`?

