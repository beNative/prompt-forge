# PromptForge

Welcome to PromptForge, a powerful desktop application for creating, managing, and refining Large Language Model (LLM) prompts. Built for prompt engineers, developers, and AI enthusiasts, PromptForge provides the tools you need to perfect your prompts with the assistance of a local AI provider.

## Key Features

- **Prompt Management**: Organize your prompts in a clean, intuitive, hierarchical folder structure.
- **Prompt Templates**: Create reusable prompt templates with variables to streamline your workflow.
- **Quick Copy**: Instantly copy a prompt's content to your clipboard from the sidebar list.
- **Search & Highlight**: Instantly filter prompts and folders by title, with matching text highlighted for clarity.
- **Drag & Drop Organization**: Intuitively reorder prompts and create nested folders with a smooth drag-and-drop interface.
- **AI-Powered Refinement**: Connect to a local LLM provider to get AI-driven suggestions for improving your prompts.
- **Automatic Service Discovery**: Automatically detects running local LLM services like Ollama and LM Studio, simplifying setup.
- **Automatic Updates**: Stay up-to-date with the latest features and fixes. The app automatically checks for updates and notifies you when one is available.
- **Pre-release Updates**: Opt-in to receive beta versions and test new features before the official release.
- **Quick-Switch Status Bar**: Change your active LLM provider and model directly from the status bar for a faster workflow.
- **Polished & Organized Settings**: A professional, tabbed interface for managing all application settings.
- **Advanced Settings Management**: View, edit, import, and export your application settings directly as JSON.
- **UI Customization**: Choose between multiple icon sets (Heroicons, Lucide, Feather, Tabler, Material) to personalize the application's appearance.
- **Light/Dark Mode**: A beautiful, consistent experience in both light and dark themes, with a manual toggle and respect for system preferences.
- **Undo/Redo History**: A full history system in the editor allows you to undo and redo changes to your prompt content.
- **Command Palette**: A quick-access command palette (Ctrl+Shift+P) for power users to perform actions like creating, deleting, and navigating.
- **Full Keyboard Navigation**: Navigate the entire application, including the sidebar and command palette, using only your keyboard.
- **Built-in Documentation**: Access functional and technical manuals directly within the app.
- **Live Logging**: Monitor application activity with a built-in, filterable logging panel.

## Tech Stack

- **Framework**: Electron
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Bundler**: ESBuild
- **Auto-Update**: Electron Updater

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

## Publishing a Release

To create and publish a new release to GitHub:

1.  Ensure the `repository` field in `package.json` points to your GitHub repository.
2.  Set up a personal access token with `repo` scope on GitHub.
3.  Make this token available as an environment variable named `GH_TOKEN`.
4.  Run the publish command:
    ```bash
    npm run publish
    ```
This will build the application, create a release on GitHub, and upload the installer assets.