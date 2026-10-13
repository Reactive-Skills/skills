# INTERVIEW_PREP State

## Context
You are generating a strategic interview preparation artifact (`interview_prep.md`) in the role directory, focusing on the candidate's introduction, one lead story, project alignment, and pre-emptive defense against overqualification and flight-risk skepticism.

## Realistic Constraints
- Save to `<output_dir>/<Company>/<Role>/interview_prep.md`.
- Build only from verified facts: `company_alignment.md`, the Project Records in `context.selected_projects`, and their story seeds.
  Never invent a company problem, metric, or outcome.
  If the profile has no Project Records, build from the role-level bullets and ask the candidate for one challenge, action, and result per story.
- Every scripted answer states the answer first, then at most three reasons, then stops.
  Cut weak openers and hedges per `references/professional-voice-standards.md`.
- Structure must include:
  1. Introduction in 20 words ("Tell me about yourself"):
     - Write about what the employer gets, never a list of accomplishments.
     - Give versions of about 20 words each: Benefit (help an audience reach a result it wants) and Breakthrough (the benefit plus a `without` clause naming the avoided cost).
       For a career change or an early-career step, add Passion, Strength, and Mission versions.
     - Use plain words and the employer's vocabulary from `company_alignment.md`.
     - Mark one version as the recommended opener and keep it consistent with sentence 3 of the resume summary.
  2. Lead Story and Backups:
     - Choose one lead story from the selected Project Records because it best answers the employer's top need, and name that need.
     - Tell it in CAR order (Challenge, Action, Result) from the record's story seed.
     - Include the own-the-miss line: what went wrong or what the candidate would change.
     - Add two backup stories. An interviewer retains one story, so build the answer around the lead.
     - Derived figures are allowed in spoken answers only. Label each one derived and show the arithmetic from a verified metric.
  3. Project Alignment: Map 2–3 existing candidate projects directly to the employer's core business and operational challenges.
  4. Pre-emptive Hard Questions & Answers:
     - Directly address: *"Why do you want this role given your senior software background? Aren't you overqualified? Won't you leave when high-tech hiring rebounds?"*
     - Provide crisp, disarming answers leading with the bottom line in sentence one (BLUF style without printing the acronym).
     - Add a "Do not say early" list: statements that read as flight risk or inflexibility in a live interview, such as demanding remote-only work for an in-office role or refusing travel.
       Give a true, neutral rewording for each.
  5. Questions to Ask Them (Audience-Split):
     - Part A (Recruiters & Talent Acquisition): Role genesis (growth vs backfill), team topology, 90-day success metrics, hiring timeline.
     - Part B (Technical / Operational Hiring Managers): What success looks like in the role, what would make someone exceed expectations in the first six months, the biggest obstacle in the way, and the value of solving it.
       Add one technical or operational question tied to a verified fact in `company_alignment.md`.
     - Questions to avoid: "What's the culture like?", "What's a day in the life?", and work-life balance questions.
       They draw canned answers and show little about how the candidate thinks.
     - Each question must include a **Strategic Intent** note explaining why asking it positions the candidate as a high-value peer.
  6. Closing Line: three sentences in order.
     Name the team's problem and goal using only verified facts from `company_alignment.md`.
     State what the candidate would focus on starting next week.
     Ask whether that fits their plan.
     If the problem is not verified, write the line so it first asks the interviewer to state the problem.
  7. Portfolio / Proof Points: 1–2 practical reference concepts or small architectures proving domain mastery.

## Instructions
1. Read `company_alignment.md` and the Project Records named in `context.selected_projects` from the master profile.
2. Draft `interview_prep.md` in the target role directory.
3. Emit `PREP_GENERATED` with payload `{"interview_prep_path": path}`.

## Atomic Verification Checklist
- [CRUCIAL] Pre-emptive answer to overqualification / flight-risk question provided with authentic, non-defensive reasoning.
- [CRUCIAL] Introduction versions are about 20 words, written about the employer, with no accomplishment list.
- [CRUCIAL] One lead story names the employer need it answers and includes an own-the-miss line.
- [CRUCIAL] Every derived figure is labeled derived and traces to a verified metric.
- [CRUCIAL] Questions to ask are split by audience (Recruiter vs Hiring Manager), and Part B has no team culture topic.
- [IMPORTANT] Strategic intent explained for every suggested question.
- [IMPORTANT] The closing line uses only verified alignment facts.
- [NEGATIVE] Zero defensive, arrogant, or dismissive phrasing.

## Signal
Emit: `PREP_GENERATED`
