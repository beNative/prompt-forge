# PromptForge

Welcome to PromptForge, a powerful desktop application for creating, managing, and refining Large Language Model (LLM) prompts. Built for prompt engineers, developers, and AI enthusiasts, PromptForge provides the tools you need to perfect your prompts with the assistance of a local AI provider.

## Key Features

- **Prompt Management**: Organize your prompts in a clean, intuitive interface. Create, edit, and delete prompts with ease.
- **AI-Powered Refinement**: Connect to a local LLM provider (like Ollama or LMStudio) to get AI-driven suggestions for improving your prompts.
- **Undo/Redo History**: A full history system in the editor allows you to undo and redo changes to your prompt content.
- **Command Palette**: A quick-access command palette (Ctrl+Shift+P) for power users to perform actions like creating, deleting, and navigating.
- **Local First**: Your data is saved locally. For the web version, it uses your browser's `localStorage`. For the Electron build, it's designed to save to a JSON file in the application's directory.
- **Simple Configuration**: Easily configure the URL and model name for your local LLM provider.
- **Built-in Documentation**: Access functional and technical manuals directly within the app.
- **Live Logging**: Monitor application activity with a built-in, filterable logging panel.

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Packaging**: Designed to be buildable with Electron for cross-platform desktop support.
- **Icons**: Heroicons

## Getting Started (Development)

1.  **Prerequisites**:
    -   Node.js and npm/yarn.
    -   A local LLM provider running (e.g., [Ollama](https://ollama.com/)). Ensure you have a model downloaded, such as `llama3`.

2.  **Installation**:
    ```bash
    npm install
    ```

3.  **Running the App**:
    ```bash
    npm run dev
    ```

4.  **Configuration**:
    -   Open the application and click the settings (gear) icon.
    -   Ensure the "LLM Provider URL" points to your local service's API endpoint (e.g., Ollama's default is `http://localhost:11434/api/generate`).
    -   Set the "Model Name" to the model you wish to use (e.g., `llama3`).