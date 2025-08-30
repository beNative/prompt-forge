# PromptForge Technical Manual

This document outlines the technical architecture and structure of the PromptForge application.

## 1. Architecture Overview

PromptForge is a single-page application (SPA) built with **React** and **TypeScript**. It utilizes a modern React hooks-based architecture for state management and component logic. The application is designed to be self-contained and can be packaged as a desktop application using **Electron**.

- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (`useState`, `useEffect`, `useContext`, `useCallback`)

## 2. Project Structure

The project follows a standard feature-oriented structure:

```
/src
|-- /components     # Reusable React components (Modals, Buttons, Editor, etc.)
|-- /contexts       # React Context providers for global state (e.g., Logger)
|-- /hooks          # Custom hooks for business logic (usePrompts, useSettings)
|-- /services       # Modules for external interactions (storage, LLM API)
|-- App.tsx         # Main application component, orchestrates layout and views
|-- constants.ts    # Application-wide constants
|-- index.tsx       # Entry point for the React application
|-- types.ts        # TypeScript type definitions and interfaces
```

## 3. Core Components & Logic

### 3.1. State Management & Hooks

- **`usePrompts` Hook**: Manages the lifecycle of prompts (CRUD operations). It abstracts away the persistence layer, loading from and saving to storage.
- **`useSettings` Hook**: Manages application settings, providing a simple interface to load and save configuration.
- **`useHistoryState` Hook**: A specialized state hook that maintains a history of state changes. It manages an array of past states and a pointer to the current state, providing `undo`, `redo`, `setState` functions, and `canUndo`/`canRedo` booleans. This powers the editor's history feature.
- **`LoggerContext`**: A global context that provides logging functionality to any component in the application. It holds the log message state and exposes an `addLog` function.

### 3.2. Services

- **`storageService.ts`**: Handles data persistence.
  - **Web Version**: Uses the browser's `localStorage` for synchronous storage of prompts and settings.
  - **Electron Compatibility**: Designed to be extended. Comments indicate where to plug in Electron's IPC (Inter-Process Communication) to interact with the Node.js `fs` module for file-based storage (`settings.json`, `prompts.json`). The `saveLogToFile` function demonstrates this dual-mode capability (file download for web, file save for Electron).

- **`llmService.ts`**: Manages all communication with the external local LLM provider. It constructs the meta-prompt for the refinement task and handles the `fetch` request, including error handling.

### 3.3. UI Components

- **`App.tsx`**: The application's main component. It acts as a router, layout manager, and orchestrator. It holds the state for the current view (`editor` or `info`), the visibility of modals, and the state of the command palette. It is also responsible for defining the list of available commands.

- **`CommandPalette.tsx`**: A modal component that provides keyboard-driven access to application commands. It manages its own internal state for filtering the command list and handling keyboard navigation (`Up`, `Down`, `Enter`, `Esc`). It receives its list of commands from `App.tsx`, allowing for context-aware commands.

- **`PromptEditor.tsx`**: The core text editing component. It uses the `useHistoryState` hook to manage the prompt's content, enabling the undo/redo functionality. It also handles keyboard shortcuts for these actions.

### 3.4. Logging System

- **`LoggerContext.tsx`**: The provider that holds the array of log messages and distributes the `addLog` function.
- **`useLogger.ts`**: A simple consumer hook for easy access to the `addLog` function.
- **`LoggerPanel.tsx`**: The UI component that displays and filters logs. It consumes the `LoggerContext` to get the log data.
- **Integration**: `addLog` calls are placed at key points in the application flow:
  - When prompts/settings are loaded or saved.
  - Before and after making an API call to the LLM.
  - When commands are executed from the palette.
  - When errors occur in any service or component.