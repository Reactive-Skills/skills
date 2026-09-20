# CAPTURE_ARTIFACT State — Browser Verifier

## Goal
Capture visual screenshots and serialized DOM snapshots for verification evidence.

## Instructions
1. Capture a full-page PNG screenshot of the verified interface state.
2. Save screenshot to `context.deliverable_path` (e.g. `.docs/browser-verifier/screenshot.png`).
3. Serialize clean DOM snapshot into `.docs/browser-verifier/dom_snapshot.html`.
4. Emit `CAPTURED` upon successful persistence.
