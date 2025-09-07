# PromptForge Technical Manual

This document outlines the technical architecture and structure of the PromptForge application.

## 1. Architecture Overview

PromptForge is a desktop application built with **Electron** and **React**. It utilizes a modern React hooks-based architecture for state management and component logic.

- **Desktop Framework**: Electron
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Bundler**: ESBuild
- **State Management**: React Hooks (`useState`, `useEffect`, `useContext`, `useCallback`)

## 2. Project Structure

The project follows a standard feature-oriented structure:

```
/
|-- /dist           # Bundled output from esbuild
|-- /electron       # Source code for the Electron main and preload processes
|-- /release        # Packaged application output from electron-builder
|-- /src            # Source code for the React renderer process (UI)
|   |-- /components # Reusable React components
|   |-- /contexts   # React Context providers
|   |-- /hooks      # Custom hooks for business logic
|   |-- /services   # Modules for external interactions
|   |-- App.tsx     # Main application component
|   |-- ...
|-- esbuild.config.js # Configuration for the esbuild bundler
|-- package.json    # Project dependencies, scripts, and build configuration
|-- tsconfig.json   # TypeScript configuration
```

## 3. Core Components & Logic

### 3.1. Electron Main Process (`electron/main.ts`)

- This is the application's entry point. It creates the `BrowserWindow` that renders the React UI.
- It is responsible for all Node.js and OS-level integrations. On startup, it reads the `promptforge_settings.json` file to configure initial settings like the application icon and `autoUpdater` preferences before the main window is even created.
- **IPC (Inter-Process Communication)**: It listens for events from the renderer process to perform actions that the browser cannot, such as accessing the file system. It also handles dynamic application changes, such as updating the `autoUpdater` configuration or changing the main window's icon at runtime via IPC listeners (`updater:set-allow-prerelease`, `app:set-icon`).
- **User Data Path**: The `getDataPath` function uses Electron's `app.getPath('userData')` method to determine the storage location. This ensures the application follows operating system standards for storing user data (e.g., in `%APPDATA%` on Windows or `~/Library/Application Support` on macOS) rather than storing data alongside the executable.

### 3.2. State Management & Hooks

- **`usePrompts` Hook**: This central hook manages all prompt and folder data. It initializes state from storage and provides CRUD functions (`addPrompt`, `updateItem`, `deleteItem`). It also contains the `moveItem` function, which handles the complex logic of reordering items and changing their `parentId` to support drag-and-drop nesting.
- **`useSettings` Hook**: Manages application settings, loading them from storage and providing a `saveSettings` function to persist changes. It also contains logic to migrate settings from older versions of the application.
- **`useHistoryState` Hook**: A specialized state hook that maintains a history of state changes for the editor's undo/redo feature.
- **`LoggerContext`**: A global context providing logging functionality to any component.
- **`ThemeContext`**: A global context (`useTheme` hook) that manages the application's light/dark mode.
- **`IconContext`**: A global context (`useIconSet` hook) that provides the currently selected icon set ('heroicons' or 'lucide') to all components, allowing for dynamic icon rendering throughout the app.

### 3.3. Services

- **`storageService.ts`**: Handles data persistence with a dual-mode strategy.
  - **Electron Version**: It checks for `window.electronAPI` and makes `async` IPC calls to the main process to read/write JSON files to the standard user data directory.
  - **Web Fallback**: If `window.electronAPI` is not present, it falls back to using `localStorage`.

- **`llmService.ts`**: Manages all communication with external LLM providers, supporting multiple API types (Ollama, OpenAI-compatible).

- **`llmDiscoveryService.ts`**: Probes predefined local endpoints (e.g., `localhost:11434`) to discover active local services and fetches their available models.

### 3.4. Build Process

- **`esbuild.config.js`**: Configures ESBuild to bundle three separate entry points: `electron/main.ts`, `electron/preload.ts`, and `index.tsx` for the main, preload, and renderer processes, respectively.
- **`electron-builder`**: This tool, configured in `package.json`, packages the bundled output into a distributable Windows installer.

### 3.5. Key UI Components

- **`PromptTreeItem.tsx`**: A recursive component that renders each item in the sidebar. It handles its own drag-and-drop events (`onDragStart`, `onDrop`, `onDragOver`) to determine the user's intent (move before, after, or inside another item) and calls the `onMoveNode` callback to update the global state.
- **`StatusBar.tsx`**: Displays connection status and other metadata. It now contains interactive `<select>` elements that allow the user to quickly change the active LLM provider and model without navigating to the full settings page.
- **`SettingsView.tsx`**: A full-page settings component with a responsive two-column layout. It handles its own dirty state to enable/disable the save button, providing a better user experience than the previous modal.
- **`IconButton.tsx`**: This component features a robust, custom tooltip implementation. Tooltips are rendered into a React Portal (`#overlay-root`) and use `useLayoutEffect` and JavaScript to dynamically calculate their position, ensuring they always stay within the viewport and are never clipped by parent containers. The position is recalculated on scroll and resize events.

### 3.6. Automatic Update Mechanism

The application uses the **`electron-updater`** library to handle automatic updates.

-   **Process**:
    -   On application startup in a packaged environment, `autoUpdater.checkForUpdatesAndNotify()` is called in `electron/main.ts`.
    -   The user can control whether to receive pre-releases via a setting. This setting (`allowPrerelease`) is stored in the settings JSON file. On startup, the main process reads this file to configure `autoUpdater.allowPrerelease` before checking for updates. If the user changes this setting while the app is running, an IPC message is sent to the main process to update the `autoUpdater` configuration in real-time.
    -   This function communicates with the release provider (configured as GitHub in `package.json`) to check for a new version.
    -   If a newer version is found on the GitHub release page, it is downloaded in the background without interrupting the user.
    -   Upon successful download, `electron-updater` triggers a native system notification to inform the user that an update is ready.
    -   The update is automatically applied the next time the application is quit and restarted.
-   **Configuration**: The update provider is configured in the `build.publish` section of `package.json`. Releases must be created on GitHub for the updater to find them. The `publish` script (`npm run publish`) is configured to handle this process.