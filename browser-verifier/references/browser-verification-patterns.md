# Browser Verification & Diagnostic Patterns

Reference guide for headless browser automation and frontend failure diagnosis.

## 1. Playwright / DevTools Invariants
- **Locator Over XPath**: Prefer semantic role locators (`page.getByRole('button', { name: 'Submit' })`) or `data-testid` attributes over brittle DOM hierarchy selectors.
- **Auto-Waiting**: Rely on Playwright's built-in actionability checks (visible, stable, enabled) rather than hardcoded sleep delays.
- **Console Interception**: Intercept page errors using:
  ```javascript
  page.on('pageerror', error => consoleErrors.push(error.message));
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  ```

## 2. Accessibility & Responsive Verification
- Verify layout at both mobile (375x667) and desktop (1280x720) viewports.
- Ensure focus indicators remain visible when navigating via keyboard Tab sequence.
