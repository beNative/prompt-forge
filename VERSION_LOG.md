# PromptForge Version Log

All notable changes to this project will be documented in this file.

---

## [1.3.0] - 2024-08-02

### Added

- **Electron Build Support**:
  - Integrated Electron to allow packaging the application as a standalone Windows desktop executable.
  - Added `package.json` with scripts for development (`npm start`) and packaging (`npm run package`).
  - Implemented an `esbuild` configuration for fast and efficient bundling of main, preload, and renderer processes.
- **File-Based Storage**:
  - In the Electron app, prompts and settings are now saved to `.json` files in the application's directory, replacing `localStorage`.
  - The application retains `localStorage` as a fallback for web-based environments.
- **Asynchronous Data Loading**: Refactored data hooks (`usePrompts`, `useSettings`) to be asynchronous to support file system operations.

---

## [1.2.0] - 2024-08-01

### Added

- **Unsaved Changes Indicator**: Added a yellow pulsing dot next to the prompt title to clearly indicate when there are unsaved modifications.

### Changed

- **Improved Auto-Save**: Refactored the auto-save mechanism in the prompt editor to be more reliable and consistent for both title and content changes.
- Ensured that accepting an AI refinement correctly triggers the auto-save process.

---

## [1.1.0] - 2024-07-31

### Added

- **Editor History (Undo/Redo)**:
  - Implemented a full history stack for the prompt content area.
  - Added support for keyboard shortcuts: `Ctrl+Z` (Undo) and `Ctrl+Y` (Redo).
  - Added UI buttons with icons for undo and redo actions in the editor.
- **Command Palette**:
  - Introduced a VS Code-style command palette for quick, keyboard-driven actions.
  - Accessible via `Ctrl+Shift+P` shortcut or a new header icon.
  - Includes commands for creating prompts, opening settings, deleting the current prompt, and toggling views.

---

## [1.0.0] - 2024-07-30

### Added

- **Initial Release** of PromptForge.
- Core prompt management features: create, edit, delete, and list prompts.
- Integration with local LLM providers (Ollama-compatible API) for AI-powered prompt refinement.
- Settings modal to configure LLM provider URL and model name.
- Data persistence using `localStorage` for web, with a clear path for file-based storage in an Electron build.
- **In-App Documentation**: Added an "Info" view to display `README.md`, `FUNCTIONAL_MANUAL.md`, `TECHNICAL_MANUAL.md`, and this `VERSION_LOG.md`.
- **Application Logging**:
  - Introduced a comprehensive logging system with levels (DEBUG, INFO, WARNING, ERROR).
  - Added a collapsible Logger Panel, accessible from the header.
  - The panel allows for filtering logs by level and saving the log to a file.
