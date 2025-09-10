# PromptForge Version Log

All notable changes to this project will be documented in this file.

---

## [0.3.0] - 2025-09-13

### Changed
- **Professional Settings UI**: Completely redesigned the settings page with a professional and organized tabbed interface, featuring a clear navigation sidebar and logically grouped categories.
- **Bug Fix**: Resolved a UI scaling bug where draggable splitters (for the sidebar and logger panel) would become offset from the mouse cursor when the application zoom was not at 100%.

---

## [0.2.0] - 2025-09-12

### Added
- **Full Icon Set Implementation**: Implemented the Feather, Tabler, and Material icon sets, making all five icon options fully functional.

### Changed
- **Code Cleanup**: Performed a comprehensive cleanup of the entire codebase, removing commented-out code and unused elements to improve readability, clarity, and maintainability.
- Updated all documentation to reflect the full availability of all icon sets.

---

## [0.1.9] - 2025-09-11

### Added
- **Advanced Settings Editor**: Added an "Advanced" section in the settings view with a syntax-highlighted JSON editor to directly view and edit the application's configuration file.
- **Import/Export Settings**: Implemented functionality to import settings from and export settings to a `.json` file.

---

## [0.1.8] - 2025-09-10

### Added
- **Expanded Icon Set Options**: Added placeholder options for Feather, Tabler, and Material icon sets in the appearance settings, marked as "Coming Soon".

---

## [0.1.7] - 2025-09-09

### Added
- **Search & Highlight**: Added a search bar to the sidebar to filter prompts and folders by title in real-time.
- Matching text in the search results is now highlighted for better visibility.
- **Pre-release Updates**: Added a setting to allow users to opt-in to receive pre-release (beta) updates from GitHub.

---

## [0.1.6] - 2025-09-08

### Added
- **Quick Copy**: Added a "Copy" icon button to each prompt in the sidebar list, allowing users to copy a prompt's content to the clipboard without opening it.

### Changed
- Updated documentation and version to prepare for a new release.

---

## [0.1.5] - 2025-09-07

### Changed
- **Standard Data Storage**: Changed data storage location from a portable 'data' folder next to the executable to the standard user data directory (e.g., AppData on Windows) to follow standard application installation behavior.

---

## [0.1.4] - 2025-09-06

### Added
- **Automatic Updates**: The application now automatically checks for updates on startup using `electron-updater`. When an update is downloaded, the user is notified and it will be installed on the next restart.
- **GitHub Publishing**: Added an `npm run publish` script and the necessary `electron-builder` configuration to build and release new versions to GitHub.

---

## [0.1.3]

### Added
- **Drag & Drop Reordering**: Implemented full drag-and-drop support in the sidebar to reorder prompts and folders.
- **Hierarchical Folders**: Users can now create nested folders by dragging folders or prompts inside other folders.
- **Status Bar Quick Actions**: Added interactive dropdowns to the status bar for quickly changing the active LLM provider and model.
- **Root Creation Buttons**: Added dedicated "New Root Folder" and "New Prompt" buttons to the sidebar header for easier top-level creation.

### Changed
- **Improved Move Logic**: The underlying logic for moving items is now more robust to support complex hierarchical changes.
- **UI Polish**: Minor adjustments to the sidebar UI to better accommodate drag-and-drop indicators and folder expansion.

---

## [0.1.2]

### Added
- **Selectable Icon Sets**: Users can now choose between Heroicons (classic) and Lucide (modern) icon sets from the settings panel.
- **Auto-Save Logs**: Added a new option in settings to automatically save application logs to a file (desktop version only).

### Changed
- **Truly Portable (Desktop)**: The application now saves all data (prompts, settings, logs) to a `data` subfolder located in the same directory as the executable, preventing it from writing to `AppData`.
- **Redesigned Settings View**: Replaced the settings modal with a full-page, two-column layout for a more modern and space-efficient user experience.
- **Improved Tooltips**: Re-engineered all tooltips to be viewport-aware and rendered in a portal, ensuring they are always fully visible and never clipped by parent containers.

---

## [0.1.1] 

### Added
- **Light/Dark Mode**: Implemented a full light and dark mode theme system. The app respects system preferences on first launch and allows manual toggling via a new header button.
- **Automatic LLM Service Discovery**: The Settings modal now automatically scans for and discovers running local LLM providers (e.g., Ollama, LM Studio), simplifying the configuration process.

### Changed
- **UI Overhaul**: Refreshed the entire application UI with a new, more vibrant and consistent color palette (using a violet accent) for a modern look and feel in both themes.
- **Redesigned Settings**: The Settings modal was completely redesigned to support the new service discovery flow, replacing manual URL input with a user-friendly service and model selection process.

---

## [0.1.0] 

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

## [0.0.3] 

### Added

- **Unsaved Changes Indicator**: Added a pulsing dot next to the prompt title to clearly indicate when there are unsaved modifications.

### Changed

- **Improved Auto-Save**: Refactored the auto-save mechanism in the prompt editor to be more reliable and consistent for both title and content changes.
- Ensured that accepting an AI refinement correctly triggers the auto-save process.

---

## [0.0.2]

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

## [0.0.1]

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