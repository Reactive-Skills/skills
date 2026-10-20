# INTAKE State — Browser Verifier

## Goal
Collect the target application URL, browser environment parameters, and required assertion rules.

## Instructions
1. Ask the user for the target URL, browser type (`chromium`, `firefox`, or `webkit`), and DOM assertion rules, unless the invoke payload already supplied them.
   Do not invent selectors or expected text; every assertion rule comes from the user or the payload.
2. Verify that the target URL points to a reachable endpoint.
3. Emit `CONFIGURE` with `target_url`, `browser_type`, and a non-empty `assertion_rules` list in `payload.contextUpdates` to proceed to browser initialization, or `ABORT` to terminate.
