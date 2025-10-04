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

1. **Update Versioning & Notes:** Increment the version in `package.json`, confirm the Markdown manuals reflect the current behavior, and add a matching entry to [`VERSION_LOG.md`](./VERSION_LOG.md) summarizing the changes.
2. **Build the Application:** Run `npm install` (if needed) and `npm run build` to ensure the renderer bundle is up-to-date.
3. **Package & Publish:** Use `npm run release` to invoke `electron-builder` with publishing enabled. See the [Technical Manual](./TECHNICAL_MANUAL.md#build-and-release-process) for platform-specific considerations.
4. **Draft the GitHub Release:** Upload the generated artifacts in `release/` to the GitHub Releases page and include the highlights from the latest version log entry.

These steps help keep the published binaries and documentation in sync for every tagged version.