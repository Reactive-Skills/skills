# INSPECT_CONSOLE State — Browser Verifier

## Goal
Audit captured browser console logs and network activity for errors, warnings, and unhandled rejections.

## Instructions
1. Inspect all intercepted log entries captured since browser boot.
2. Filter for `console.error`, unhandled promise rejections, and failed asset loads.
3. If zero console errors or uncaught exceptions were detected, emit `CLEAN`.
4. If errors are present, append to `context.console_errors` and emit `ERRORS_FOUND`.
