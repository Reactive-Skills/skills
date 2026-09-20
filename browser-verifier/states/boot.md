# BOOT State — Browser Verifier

## Goal
Initialize the headless browser environment and attach event listeners for logs and network failures.

## Instructions
1. Launch headless browser engine using Playwright or Chrome DevTools protocol.
2. Attach listeners for `console` events (`error`, `warn`) and failed network requests (HTTP >= 400).
3. Confirm browser session is healthy and emit `READY`. On startup failure, emit `FAIL`.
