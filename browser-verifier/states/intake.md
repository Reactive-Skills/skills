# INTAKE State — Browser Verifier

## Goal
Collect the target application URL, browser environment parameters, and required assertion rules.

## Instructions
1. Verify that `context.target_url` points to a reachable endpoint (e.g. `http://localhost:3000`).
2. Identify desired browser type (`chromium`, `firefox`, or `webkit`).
3. Formulate the initial DOM assertion rules and expected element selectors.
4. Emit `CONFIGURE` to proceed to browser initialization, or `ABORT` to terminate.
