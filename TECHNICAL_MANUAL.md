# PromptForge Technical Manual

This document provides a technical overview of the PromptForge application's architecture, components, and key systems.

## Table of Contents

1.  [Technology Stack](#technology-stack)
2.  [Project Structure](#project-structure)
3.  [Application Architecture](#application-architecture)
    -   [Electron Main Process](#electron-main-process)
    -   [Renderer Process (React)](#renderer-process-react)
    -   [State Management](#state-management)
4.  [Key Systems](#key-systems)
    -   [Storage Service](#storage-service)
    -   [LLM Service](#llm-service)
    -   [Component Breakdown](#component-breakdown)

---

## 1. Technology Stack

-   **Framework:** [Electron](https://www.electronjs.org/) for cross-platform desktop application development.
-   **UI Library:** [React](https://reactjs.org/) for building the user interface.
-   **Language:** [TypeScript](https://www.typescriptlang.org/) for type safety and improved developer experience.
-   **Bundler:** [esbuild](https://esbuild.github.io/) for fast and efficient bundling of the application's source code.
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS framework.
-   **Packaging:** [electron-builder](https://www.electron.build/) for creating distributable application packages.

---

## 2. Project Structure

```
prompt-forge/
├── assets/               # Static assets like the application icon.
├── components/           # Reusable React components.
│   ├── iconsets/         # SVG icon components for different libraries.
│   └── ...
├── contexts/             # React context providers for global state.
├── electron/             # Source code for the Electron main process.
│   ├── main.ts           # Main process entry point.
│   └── preload.ts        # Preload script for secure IPC.
├── hooks/                # Custom React hooks for business logic.
├── services/             # Modules for interacting with external systems (storage, LLM).
├── release/              # Output directory for packaged application.
├── dist/                 # Output directory for bundled code.
├── index.html            # The main HTML file for the renderer process.
├── index.tsx             # The entry point for the React application.
├── package.json          # Project metadata and dependencies.
└── ...
```

---

## 3. Application Architecture

### Electron Main Process (`electron/main.ts`)

The main process is responsible for managing the application lifecycle and native OS interactions.

-   **Window Management:** It creates the `BrowserWindow`, which is the container for the React application. The window is configured as **frameless** (`frame: false`) to allow for a custom title bar.
-   **IPC (Inter-Process Communication):** It sets up IPC handlers to listen for events from the renderer process. This is the primary way the UI communicates with the backend. Key handlers include:
    -   **Window Controls:** Handlers for `window:minimize`, `window:maximize`, and `window:close` to manage the frameless window.
    -   **Storage:** Handlers for `storage:save` and `storage:load` to persist data to the user's local filesystem.
    -   **File Dialogs:** Handlers for saving logs or importing/exporting settings using native OS dialogs.
    -   **Auto-Updater:** It initializes `electron-updater` and listens for update events, notifying the renderer when an update is downloaded.
-   **Security:** The `preload.ts` script uses Electron's `contextBridge` to securely expose specific IPC functions to the renderer process under the `window.electronAPI` object. This avoids exposing the full `ipcRenderer` and maintains context isolation.

### Renderer Process (React)

The renderer process is responsible for the entire user interface.

-   **Component Tree:** The application is built as a tree of React components, starting from `index.tsx` which mounts the main `<App />` component.
-   **UI State:** Most UI state (e.g., which prompt is active, visibility of panels) is managed within the `<App />` component using React hooks (`useState`, `useMemo`).
-   **Business Logic:** Logic for managing prompts, templates, and settings is encapsulated in custom hooks (e.g., `usePrompts`, `useSettings`). This separates the logic from the UI components.

### State Management

-   **React Hooks & Context:** Global state and functions are shared across the component tree using React Context.
    -   `LoggerContext`: Provides logging functions.
    -   `ThemeContext`: Manages the light/dark theme.
    -   `IconContext`: Provides the currently selected icon set.
    -   `PromptHistoryContext`: Manages prompt version history.
-   **Local Storage / File System:** Persistent state (prompts, templates, settings) is managed via the `storageService`, which abstracts away the difference between Electron's file system and a web browser's `localStorage`.

---

## 4. Key Systems

### Storage Service (`services/storageService.ts`)

This service is a crucial abstraction layer for data persistence.
-   It detects if the application is running in Electron (`isElectron`).
-   If in Electron, it uses the `window.electronAPI` functions to save and load data from JSON files in the user's application data directory.
-   If not in Electron (i.e., running in a web browser), it falls back to using `localStorage`.
-   This allows the same hooks and components to work in both environments without modification.

### LLM Service (`services/llmService.ts`)

This module handles all communication with the external Large Language Model.
-   It constructs the appropriate API request body based on the configured API type (Ollama or OpenAI-compatible).
-   It sends `fetch` requests to the user-configured LLM provider URL.
-   It includes robust error handling to manage connection failures or non-OK responses from the provider.
-   It provides specific methods for different tasks, such as `refinePrompt` and `generateTitle`, which wrap the base request logic with specific meta-prompts.

### Component Breakdown

-   **`App.tsx`:** The root component that orchestrates the entire application. It manages the main layout, state, and passes data and handlers down to child components.
-   **`CustomTitleBar.tsx`:** (Electron only) Renders the custom, draggable title bar. It contains the integrated command palette search, global action buttons, and platform-aware window controls that communicate with the main process via IPC.
-   **`Header.tsx`:** A fallback header component used for the web version of the application, which does not support a custom frameless title bar.
-   **`Sidebar.tsx`:** Manages the display of prompts and templates in a hierarchical list. It handles search/filtering, drag-and-drop logic, and keyboard navigation.
-   **`PromptEditor.tsx`:** The main editor component. It manages its own internal state for the prompt content (title, body) and uses a debounced effect to trigger saves. It also handles the logic for AI refinement and Markdown previews.
-   **`JsonEditor.tsx`:** A custom code editor component with syntax highlighting for JSON. It's used in the advanced settings to allow direct editing of the configuration file.
-   **`SettingsView.tsx`:** Manages all application settings. It features a two-column layout with navigation on the left and scroll-linked content sections on the right. It handles LLM provider configuration, appearance settings, and advanced options like JSON editing.
-   **`CommandPalette.tsx`:** A dropdown component that displays a filterable list of available commands. It is positioned relative to the search input in the title bar and handles keyboard navigation for selecting and executing actions.
-   **`StatusBar.tsx`:** The bottom bar of the application. Its role is now focused on displaying the LLM connection status and providing dropdowns for selecting the LLM provider and model.