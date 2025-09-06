# PromptForge

Welcome to PromptForge, a powerful desktop application for creating, managing, and refining Large Language Model (LLM) prompts. Built for prompt engineers, developers, and AI enthusiasts, PromptForge provides the tools you need to perfect your prompts with the assistance of a local AI provider.

## Key Features

- **Prompt Management**: Organize your prompts in a clean, intuitive, hierarchical folder structure.
- **Drag & Drop Organization**: Intuitively reorder prompts and create nested folders with a smooth drag-and-drop interface.
- **AI-Powered Refinement**: Connect to a local LLM provider to get AI-driven suggestions for improving your prompts.
- **Automatic Service Discovery**: Automatically detects running local LLM services like Ollama and LM Studio, simplifying setup.
- **Quick-Switch Status Bar**: Change your active LLM provider and model directly from the status bar for a faster workflow.
- **UI Customization**: Choose between multiple icon sets (Heroicons, Lucide) to personalize the application's appearance.
- **Light/Dark Mode**: A beautiful, consistent experience in both light and dark themes, with a manual toggle and respect for system preferences.
- **Undo/Redo History**: A full history system in the editor allows you to undo and redo changes to your prompt content.
- **Command Palette**: A quick-access command palette (Ctrl+Shift+P) for power users to perform actions like creating, deleting, and navigating.
- **Truly Portable**: In the desktop version, all data is stored alongside the executable, making it easy to run from a USB drive without leaving files behind.
- **Built-in Documentation**: Access functional and technical manuals directly within the app.
- **Live Logging**: Monitor application activity with a built-in, filterable logging panel.

## Tech Stack

- **Framework**: Electron
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Bundler**: ESBuild

## Getting Started (Development)

1.  **Prerequisites**:
    -   Node.js and npm.
    -   A local LLM provider running (e.g., [Ollama](https://ollama.com/)). Ensure you have a model downloaded, such as `llama3`.

2.  **Installation**:
    ```bash
    npm install
    ```

3.  **Running the App in Development Mode**:
    ```bash
    npm start
    ```
    This will start the application in a development window with hot-reloading enabled.

4.  **Configuration**:
    -   Open the application and click the settings (gear) icon.
    -   The app will automatically detect running services.
    -   Simply select your desired service and model from the dropdown menus, configure UI options, and click "Save Changes".

## Building for Production

To create a distributable Windows installer, run the following command:

```bash
npm run package
```

The installer will be located in the `release/` directory.