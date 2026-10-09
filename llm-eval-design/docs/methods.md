# Eval methods and grading guidance

Source: https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
This page paraphrases the guidance and adds the checks this skill enforces.

## Writing success criteria
A good criterion is specific, measurable, achievable, and relevant.
Specific: name the behavior, such as "sentiment label accuracy", not "good performance".
Measurable: use a number or a well defined scale. Even fuzzy goals such as safety can be stated as a rate over a fixed number of trials.
Achievable: base the target on a benchmark, a prior result, research, or expert knowledge. Do not ask more than current models can do.
Relevant: match the application. Citation accuracy matters for a medical assistant more than for a casual chatbot.
Most applications need several criteria at once.
Common dimensions: task fidelity, consistency, relevance and coherence, tone and style, privacy, context use, latency, and price.
Define every fuzzy word in a criterion. "Egregious error" means nothing until the criterion says what it means.

## Designing evals
Be task specific. The cases should mirror the real input distribution, including rare and hard inputs.
Cover these edge-case classes: missing or irrelevant input, very long input, poor or harmful user input (for chat), and ambiguous cases where people would disagree.
Automate grading where possible: multiple choice, string match, code, or an LLM grader.
Prefer many cases with slightly noisier automated grading over a few hand graded cases.
Use a model to expand a small hand-written seed set into more cases, then review a sample.

## Method catalog
| Method | Use for | Grading | Watch for |
| --- | --- | --- | --- |
| exact_match | Categorical answers such as labels | code | Normalize case and whitespace only |
| string_match | A required phrase must appear | code | Phrase may appear in a wrong context |
| embedding_cosine | Consistency across paraphrased questions | code | Needs a sentence-embedding model. Scores topic similarity, not correctness |
| rouge_l | Summaries against reference summaries | code | Rewards word overlap. Penalizes valid rewording |
| operational | Latency, token counts, cost | code | Measure on realistic load |
| llm_binary | Yes or no judgments such as "does this reveal private data" | llm | Calibrate first |
| llm_likert | Tone, empathy, professionalism on a 1 to 5 scale | llm | Anchor each scale point |
| llm_ordinal | Degree of context use on an ordered scale | llm | Anchor each scale point |
| llm_rubric | Pass or fail against explicit rules | llm | Rubric must not be the golden answer |
| human | Only when no automated method is credible | human | Slow and costly |

## Choosing a grader
Choose the fastest, most reliable, and most scalable method that is credible.
1. Code grading is fastest and most reliable but lacks nuance.
2. LLM grading is fast, flexible, and scalable. Test its reliability before you scale it.
3. Human grading is flexible and high quality but slow and costly. Avoid it unless needed.

## LLM grader requirements
Write a detailed rubric with clear, checkable rules.
Constrain the output: a number, yes or no, or a label inside tags.
Let the grader reason before it answers.
Use a grader model different from the model under test.
Validate the grader on a labeled set and require a stated agreement before scoring.
Treat an unparsable reply as a grader error. Count it and report it.

## Pitfalls this skill designs against
Some published example code takes shortcuts. This skill does not copy them.
Privacy evals that only grade cases containing sensitive data never measure over-refusal. Score both kinds of case.
Parsing a grader reply with a bare integer conversion crashes on any other text. Parse defensively.
Passing the golden answer as the rubric makes the grader compare strings instead of judging quality. Write a rubric.
Grading with the same model that produced the output hides shared blind spots. Use a different grader model.
Hard coded model identifiers go stale. Verify them when the harness is built and again when the run is approved.
