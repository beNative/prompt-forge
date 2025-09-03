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
- It is responsible for all Node.js and OS-level integrations.
- **IPC (Inter-Process Communication)**: It listens for events from the renderer process to perform actions that the browser cannot, such as accessing the file system.
- **Portable Data Path**: The `getDataPath` function ensures the application is portable. In a packaged app, it creates and uses a `data` subfolder in the same directory as the executable. In development, it uses a `data` folder in the project root. This avoids writing to system locations like `AppData`.

### 3.2. State Management & Hooks

- **`usePrompts` & `useSettings` Hooks**: These hooks initialize with a default state and then asynchronously call the `storageService` to load data. All data mutations call an `async` function to persist changes.
- **`useHistoryState` Hook**: A specialized state hook that maintains a history of state changes for the editor's undo/redo feature.
- **`LoggerContext`**: A global context providing logging functionality to any component.
- **`ThemeContext`**: A global context (`useTheme` hook) that manages the application's light/dark mode.
- **`IconContext`**: A global context (`useIconSet` hook) that provides the currently selected icon set ('heroicons' or 'lucide') to all components, allowing for dynamic icon rendering throughout the app.

### 3.3. Services

- **`storageService.ts`**: Handles data persistence with a dual-mode strategy.
  - **Electron Version**: It checks for `window.electronAPI` and makes `async` IPC calls to the main process to read/write JSON files to the portable `data` directory.
  - **Web Fallback**: If `window.electronAPI` is not present, it falls back to using `localStorage`.

- **`llmService.ts`**: Manages all communication with external LLM providers, supporting multiple API types (Ollama, OpenAI-compatible).

- **`llmDiscoveryService.ts`**: Probes predefined local endpoints (e.g., `localhost:11434`) to discover active local services and fetches their available models.

### 3.4. Build Process

- **`esbuild.config.js`**: Configures ESBuild to bundle three separate entry points: `electron/main.ts`, `electron/preload.ts`, and `index.tsx` for the main, preload, and renderer processes, respectively.
- **`electron-builder`**: This tool, configured in `package.json`, packages the bundled output into a distributable Windows installer.

### 3.5. Key UI Components

- **`SettingsView.tsx`**: A full-page settings component with a responsive two-column layout. It handles its own dirty state to enable/disable the save button, providing a better user experience than the previous modal.
- **`IconButton.tsx`**: This component features a robust, custom tooltip implementation. Tooltips are rendered into a React Portal (`#overlay-root`) and use `useLayoutEffect` and JavaScript to dynamically calculate their position, ensuring they always stay within the viewport and are never clipped by parent containers. The position is recalculated on scroll and resize events.