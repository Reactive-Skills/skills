# NAVIGATE State — Browser Verifier

## Goal
Navigate to the target application URL, verify initial HTTP response code, and await network idle state.

## Instructions
1. Instruct browser to navigate to `context.target_url` with configured timeout (default 30s).
2. Wait for `networkidle` or `domcontentloaded` lifecycle event.
3. If page returns HTTP 200-299 and DOM is mounted, emit `LOADED`.
4. If network fails or returns HTTP 4xx/5xx, record in `context.network_failures` and emit `NETWORK_FAIL`.
