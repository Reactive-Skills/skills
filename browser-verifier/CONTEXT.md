# Browser Verifier Context & Invariants

## Core Invariants
1. **Zero Console Errors**: A release is blocked if any `console.error` occurs during page lifecycle.
2. **Deterministic Wait States**: Always wait for specific DOM selectors or network idle; never use arbitrary `sleep` timeouts.
3. **Evidence Persistence**: Every verification run must produce screenshot and DOM snapshot artifacts.
