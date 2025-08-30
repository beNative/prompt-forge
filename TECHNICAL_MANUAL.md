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

### 3.1. State Management

- **`usePrompts` Hook**: Manages the lifecycle of prompts (CRUD operations). It abstracts away the persistence layer, loading from and saving to storage.
- **`useSettings` Hook**: Manages application settings, providing a simple interface to load and save configuration.
- **`LoggerContext`**: A global context that provides logging functionality to any component in the application. It holds the log message state and exposes an `addLog` function.

### 3.2. Services

- **`storageService.ts`**: Handles data persistence.
  - **Web Version**: Uses the browser's `localStorage` for synchronous storage of prompts and settings.
  - **Electron Compatibility**: Designed to be extended. Comments indicate where to plug in Electron's IPC (Inter-Process Communication) to interact with the Node.js `fs` module for file-based storage (`settings.json`, `prompts.json`). The `saveLogToFile` function demonstrates this dual-mode capability (file download for web, file save for Electron).

- **`llmService.ts`**: Manages all communication with the external local LLM provider. It constructs the meta-prompt for the refinement task and handles the `fetch` request, including error handling.

### 3.3. Views & Layout (`App.tsx`)

The main `App.tsx` component acts as the application's router and layout manager. It holds the state for the current view (`editor` or `info`) and the visibility of modal components like the `SettingsModal` and the `LoggerPanel`.

### 3.4. Logging System

- **`LoggerContext.tsx`**: The provider that holds the array of log messages and distributes the `addLog` function.
- **`useLogger.ts`**: A simple consumer hook for easy access to the `addLog` function.
- **`LoggerPanel.tsx`**: The UI component that displays and filters logs. It consumes the `LoggerContext` to get the log data.
- **Integration**: `addLog` calls are placed at key points in the application flow:
  - When prompts/settings are loaded or saved.
  - Before and after making an API call to the LLM.
  - When errors occur in any service or component.
