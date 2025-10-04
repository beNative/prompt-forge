# PromptForge

PromptForge is a desktop application designed to streamline the process of creating, managing, and refining prompts for Large Language Models (LLMs). It connects to local AI providers like Ollama, allowing you to leverage the power of AI to improve your own prompts in a secure, offline-first environment.

![PromptForge Screenshot](https://raw.githubusercontent.com/TimSirmov/prompt-forge/main/assets/screenshot.png)

## Key Features

- **Modern, Draggable Title Bar:** A sleek, VS Code-style custom title bar maximizes screen space and integrates essential functions (Electron version only).
- **Integrated Command Palette:** Quickly access all core functions from a central search bar built directly into the title bar.
- **Hierarchical Prompt Organization:** Organize your prompts and ideas in a familiar folder structure. Use drag-and-drop to rearrange your workspace.
- **Full Keyboard Navigation:** Navigate the prompt and template sidebar using only the keyboard for a faster workflow.
- **AI-Powered Refinement:** Use your connected local LLM to automatically refine and improve your prompts with a single click.
- **Prompt Templating:** Create reusable prompt templates with variables to quickly generate new prompts for recurring tasks.
- **Side-by-side Markdown Preview:** Write your prompts in Markdown and see a live, rendered preview in real-time, either next to or below your editor.
- **Version History:** Automatically saves previous versions of your prompts, allowing you to view diffs and restore to any point in time.
- **Local LLM Discovery:** Automatically detects running local LLM providers like Ollama and LM Studio for easy setup.
- **Customizable Interface:** Switch between light and dark themes, adjust the UI scale, and choose from multiple icon sets to personalize your experience.
- **Offline First:** All your prompts and data are stored locally on your machine.
- **Auto-Update:** The application can automatically check for and install updates (pre-release versions are opt-in).

## Getting Started

1.  **Download:** Grab the latest release for your operating system from the [Releases](https://github.com/TimSirmov/prompt-forge/releases) page.
2.  **Run a Local LLM:** Ensure you have a local AI provider like [Ollama](https://ollama.ai/) or [LM Studio](https://lmstudio.ai/) running.
3.  **Configure:** Launch PromptForge, open the Settings view, and select your detected LLM service and a model to use for refinement tasks.
4.  **Create:** Start creating, organizing, and refining your prompts!

For detailed instructions on usage and features, please refer to the [Functional Manual](./FUNCTIONAL_MANUAL.md).

## Release Workflow

Maintainers preparing a new GitHub release should follow these steps:

1. **Update Versioning & Notes:** Increment the version in `package.json`, confirm the Markdown manuals reflect the current behavior, and add a matching entry to [`VERSION_LOG.md`](./VERSION_LOG.md) summarizing the fixes or documentation updates that should appear in the public release notes.
2. **Build the Application:** Run `npm install` (if needed) and `npm run build` to ensure the renderer bundle is up-to-date.
3. **Package & Publish:** Use `npm run release` to invoke `electron-builder` with publishing enabled. See the [Technical Manual](./TECHNICAL_MANUAL.md#build-and-release-process) for platform-specific considerations.
4. **Draft the GitHub Release:** Upload the generated artifacts in `release/` to the GitHub Releases page, then copy the highlights from the latest version log entry into the release notes and verify that the summary matches the final documentation.

These steps help keep the published binaries and documentation in sync for every tagged version.

## Testing & Instrumentation

PromptForge ships with a modular instrumentation layer that powers automated testing, structured logging, and UI automation.

- **Unified Instrumentation Provider:** The renderer tree is wrapped in `InstrumentationProvider`, which exposes logging, metrics, configuration, a programmable test harness, and a UI automation bridge via the `useInstrumentation` hook.
- **Structured Logging:** The `StructuredLogger` emits JSON-friendly log entries and fans out to listeners, making it simple to stream logs into integration or end-to-end runners.
- **Runtime Metrics:** A lightweight client-side metrics collector records timers and performance observer events. Timings around LLM discovery and model retrieval are captured out of the box.
- **Test Harness Hooks:** Deterministic hooks (e.g., `app.getState`, `app.setView`, `app.focusCommandPalette`) allow automated suites or AI agents to orchestrate flows without brittle DOM selectors.
- **UI Automation Bridge:** An AI agent or external runner can discover automation regions and invoke hooks through the globally exposed `__PROMPT_FORGE_AUTOMATION__` interface.
- **Error Resilience:** The `InstrumentationErrorBoundary` captures and logs renderer failures, providing a safe recovery point during stress testing.

Automation runners can mount the renderer bundle without Electron by starting the lightweight static server in [`tests/automation/serve-dist.js`](./tests/automation/serve-dist.js). The companion [automation guide](./tests/automation/README.md) walks through building the bundle, launching the server, and driving hooks from Playwright.

### Quickstart

```ts
import { useInstrumentation } from './instrumentation';

const ExampleComponent = () => {
  const { logger, harness } = useInstrumentation();

  useEffect(() => {
    const unregister = harness.registerHook({
      id: 'example.doSomething',
      description: 'Runs the example workflow',
      invoke: async () => {
        logger.info('Example workflow triggered');
        // ...custom logic...
        return { status: 'ok' };
      }
    });
    return unregister;
  }, [logger, harness]);
};
```

During automated runs, an agent can enumerate available hooks and invoke them via the browser console or a Playwright helper:

```js
await page.evaluate(() => window.__PROMPT_FORGE_AUTOMATION__.invoke('app.invokeHook', {
  id: 'app.setView',
  data: 'settings'
}));
```

The default configuration can be overridden by assigning a JSON payload to `window.__PROMPT_FORGE_CONFIG__` before the React app mounts or by setting the `PROMPT_FORGE_INSTRUMENTATION` environment variable when packaging Electron builds.
