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
- **AI SDK**: `@google/genai` for Google Gemini integration.

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
- **IPC (Inter-Process Communication)**: It listens for events from the renderer process to perform actions that the browser cannot, such as accessing the file system or reading environment variables (`API_KEY`). It exposes handlers for saving/loading data and retrieving the API key.

### 3.2. State Management & Hooks

- **`usePrompts` & `useSettings` Hooks**: These hooks initialize with an empty/default state and then use a `useEffect` to asynchronously call the `storageService` to load data. All data mutations (add, update, delete) now call an `async` function to persist the changes back to the file system.
- **`useHistoryState` Hook**: A specialized state hook that maintains a history of state changes for the editor's undo/redo feature.
- **`LoggerContext`**: A global context that provides logging functionality to any component in the application.
- **`ThemeContext`**: A global context (`useTheme` hook) that manages the application's light/dark mode. It persists the user's choice to `localStorage` and detects the system's preferred theme on first load.

### 3.3. Services

- **`storageService.ts`**: Handles data persistence with a dual-mode strategy.
  - **Electron Version**: It checks for the presence of the `window.electronAPI` (exposed by `preload.ts`). If found, it makes `async` IPC calls to the main process to read/write JSON files.
  - **Web Fallback**: If `window.electronAPI` is not present, it falls back to using the browser's `localStorage` for synchronous storage.

- **`llmService.ts`**: Manages all communication with external LLM providers. It supports multiple API types (Ollama, OpenAI-compatible, Gemini). For Gemini, it uses the official `@google/genai` SDK.

- **`llmDiscoveryService.ts`**: This service is responsible for discovering available LLM providers.
  - It probes predefined local endpoints (e.g., `localhost:11434` for Ollama) to discover active local services.
  - It also uses an IPC call to check for the `API_KEY` environment variable. If present, it adds Google Gemini to the list of available services.
  - It then fetches the list of available models from the discovered service, supporting different API structures.

### 3.4. Build Process

- **`esbuild.config.js`**: This script configures ESBuild to bundle three separate entry points:
    1.  `electron/main.ts` -> `dist/main.js` (Node environment)
    2.  `electron/preload.ts` -> `dist/preload.js` (Node environment with Electron APIs)
    3.  `index.tsx` -> `dist/renderer.js` (Browser environment)
- **`electron-builder`**: This tool, configured in `package.json`, takes the output from `esbuild` and packages it into a distributable Windows installer (`.exe`), handling code signing, icons, and installer options.