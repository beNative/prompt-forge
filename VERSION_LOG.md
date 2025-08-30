# PromptForge Version Log

All notable changes to this project will be documented in this file.

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
  - Integrated logging throughout the application for better monitoring and debugging.
