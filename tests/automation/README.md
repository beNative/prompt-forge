# Automation & Instrumentation Demo

This directory contains helper assets that demonstrate how to drive PromptForge's
instrumentation layer from automated tooling. The goal is to provide a minimal,
reusable harness that external runners (Playwright, Selenium, an AI agent, etc.)
can rely on without coupling directly to DOM selectors.

## Prerequisites

1. Build the renderer bundle so that the static server can expose the compiled assets:

   ```bash
   npm run build
   ```

2. Start the lightweight automation server, which serves `index.html` and the
   contents of `dist/` from `http://127.0.0.1:4173` by default:

   ```bash
   node tests/automation/serve-dist.js
   ```

   Set the `PORT` environment variable to change the listening port.

## Example Playwright Scenario

The snippet below shows how a headless Playwright test (or an AI agent that
wraps Playwright) can use the globally exposed automation bridge to discover
and invoke deterministic hooks before falling back to targeted DOM assertions.

```ts
import { test, expect } from '@playwright/test';

test('command palette search is automated through instrumentation', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');

  // Enumerate available hooks and ensure core automation interfaces exist.
  const hooks = await page.evaluate(() =>
    window.__PROMPT_FORGE_AUTOMATION__.invoke('app.listHooks')
  );
  expect(hooks.status).toBe('success');

  // Focus the command palette through the harness rather than DOM selectors.
  const focusResult = await page.evaluate(() =>
    window.__PROMPT_FORGE_AUTOMATION__.invoke('app.invokeHook', {
      id: 'app.focusCommandPalette'
    })
  );
  expect(focusResult.status).toBe('success');

  await page.keyboard.type('settings');
  await expect(page.getByRole('dialog')).toBeVisible();
});
```

The automation bridge returns structured payloads so tests can perform robust
assertions without string parsing. Additional hooks can be registered inside the
app through `useInstrumentation().harness.registerHook()`.

## Suggested Workflow

1. Launch the automation server in one terminal.
2. Run your browser automation tool in another terminal (Playwright, Cypress,
   custom AI agent, etc.).
3. Collect logs and metrics by subscribing to the instrumentation provider or by
   inspecting `window.__PROMPT_FORGE_AUTOMATION__` for the exposed regions.
4. Capture screenshots and performance data during the run to aid debugging.

## Troubleshooting

- Ensure `npm run build` has been executed so `dist/renderer.js` exists.
- The automation bridge can be disabled through configuration; confirm that
  `window.__PROMPT_FORGE_AUTOMATION__` is defined inside the browser console.
- When running inside Electron, provide the `PROMPT_FORGE_INSTRUMENTATION`
  environment variable to keep automation hooks enabled in packaged builds.
