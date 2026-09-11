# DETECTING State

## Goal
Determine the skill's existence status and type, then route to the correct branch.

## Context Variables Read
- `context.skill_name` � the skill identifier
- `context.operation` � CREATE | UPDATE | DELETE | MIGRATE_LEGACY | MIGRATE_REACTIVE

## Detection Logic

### Step 1: Check skill.yaml existence
Use glob to check if `skills/{{context.skill_name}}/skill.yaml` exists.
Set `skillExists = true` if found, `skillExists = false` if not.

### Step 2: Check SKILL.md existence (legacy detection)
Use glob to check if `skills/{{context.skill_name}}/SKILL.md` exists.
Set `hasLegacySKILL = true` if found.

### Step 3: Determine skill type
If `skillExists` is true:
- Read the first line of `skills/{{context.skill_name}}/skill.yaml`
- Use grep to extract `schema_version:` value
- If `schema_version` contains `reactive/v1` ? set `isV1Reactive = true`
- If `schema_version` contains `2.0.0` ? set `isV2Reactive = true`
- If neither ? `isV2Reactive = false` (unknown schema, treat as v2-compatible)

If `skillExists` is false and `hasLegacySKILL` is true:
- Set `isLegacy = true`
- Set `isV1Reactive = false`, `isV2Reactive = false`

If neither `skill.yaml` nor `SKILL.md` exists:
- Set `isLegacy = false`, `isV1Reactive = false`, `isV2Reactive = false`

### Step 4: Set context variables
Before emitting any signal, set these context variables:
- `skillExists`: boolean
- `isLegacy`: boolean (SKILL.md exists AND no skill.yaml)
- `isV1Reactive`: boolean (skill.yaml with schema_version "reactive/v1")
- `isV2Reactive`: boolean (skill.yaml with schema_version "2.0.0")

## Transition Logic

Route based on operation type:

### CREATE operation
- If `skillExists == false` ? emit `NOT_EXISTS_CREATE`
- If `skillExists == true` ? emit `EXISTS_CREATE`

### UPDATE or DELETE operation
- If `skillExists == true` ? emit `EXISTS_UPDATE_DELETE`
- If `skillExists == false` ? emit `NOT_EXISTS_UPDATE_DELETE`

### MIGRATE_LEGACY operation
- If `isLegacy == true` ? emit `IS_LEGACY`
- If `isLegacy == false` ? emit `IS_NOT_LEGACY`

### MIGRATE_REACTIVE operation
- If `isV1Reactive == true` ? emit `IS_V1_REACTIVE`
- If `isV1Reactive == false` ? emit `NOT_V1_REACTIVE`

## Context Variables Set
- `skillExists`: boolean � skill.yaml was found
- `isLegacy`: boolean � SKILL.md found without skill.yaml
- `isV1Reactive`: boolean � skill.yaml with schema_version "reactive/v1"
- `isV2Reactive`: boolean � skill.yaml with schema_version "2.0.0"

## Signal
Emit one of: `NOT_EXISTS_CREATE`, `EXISTS_CREATE`, `EXISTS_UPDATE_DELETE`, `NOT_EXISTS_UPDATE_DELETE`, `IS_LEGACY`, `IS_NOT_LEGACY`, `IS_V1_REACTIVE`, `NOT_V1_REACTIVE`
