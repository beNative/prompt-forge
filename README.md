# PromptForge

Welcome to PromptForge, a powerful desktop application for creating, managing, and refining Large Language Model (LLM) prompts. Built for prompt engineers, developers, and AI enthusiasts, PromptForge provides the tools you need to perfect your prompts with the assistance of a local AI provider.

## Key Features

- **Prompt Management**: Organize your prompts in a clean, intuitive interface. Create, edit, and delete prompts with ease.
- **AI-Powered Refinement**: Connect to a local LLM provider to get AI-driven suggestions for improving your prompts.
- **Google Gemini Support**: Connect to Google's Gemini models via API key for cloud-powered prompt refinement.
- **Automatic Service Discovery**: Automatically detects running local LLM services like Ollama and LM Studio, simplifying setup.
- **Light/Dark Mode**: A beautiful, consistent experience in both light and dark themes, with a manual toggle and respect for system preferences.
- **Undo/Redo History**: A full history system in the editor allows you to undo and redo changes to your prompt content.
- **Command Palette**: A quick-access command palette (Ctrl+Shift+P) for power users to perform actions like creating, deleting, and navigating.
- **Local First**: Your data is saved locally. For the desktop version, it saves to JSON files in the application's directory. For the web version, it uses `localStorage`.
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
    -   (Optional) For Gemini support, set the `API_KEY` environment variable with your Google Gemini API key.

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
    -   The app will automatically detect running services, including Google Gemini if your API key is set.
    -   Simply select your desired service and model from the dropdown menus and click "Save".

## Building for Production

To create a distributable Windows installer, run the following command:

```bash
npm run package
```

The installer will be located in the `release/` directory.