# ASSERT_DOM State — Browser Verifier

## Goal
Execute semantic DOM queries, presence assertions, and visibility verifications.

## Instructions
1. Query DOM for expected UI elements declared in `context.assertion_rules`.
2. Verify critical text content, heading structures, and accessibility landmarks (`role="main"`, `nav`, `form`).
3. If all DOM assertions pass cleanly, emit `VERIFIED`.
4. If an assertion fails or times out, record failure details and emit `ASSERTION_FAIL`.
