# PromptForge Functional Manual

This manual provides a detailed overview of the features and functionality of the PromptForge application.

## Table of Contents

1.  [The Main Window](#the-main-window)
    -   [The Custom Title Bar](#the-custom-title-bar)
    -   [The Sidebar](#the-sidebar)
    -   [The Main Content Area](#the-main-content-area)
    -   [The Status Bar](#the-status-bar)
2.  [Core Features](#core-features)
    -   [Creating Prompts and Folders](#creating-prompts-and-folders)
    -   [Editing Prompts](#editing-prompts)
    -   [Organizing with Drag and Drop](#organizing-with-drag-and-drop)
    -   [AI-Powered Refinement](#ai-powered-refinement)
    -   [Using Templates](#using-templates)
    -   [Version History](#version-history)
3.  [Views and Panels](#views-and-panels)
    -   [Command Palette](#command-palette)
    -   [Settings View](#settings-view)
    -   [Info View](#info-view)
    -   [Logger Panel](#logger-panel)

---

## 1. The Main Window

The PromptForge interface is designed to be clean and efficient, composed of four main sections.

### The Custom Title Bar

The top-most bar of the application provides global controls and information.

- **Application Title:** Displays the application name, "PromptForge". The entire bar is draggable, allowing you to move the window.
- **Command Palette Search:** The central search box is your primary way to access the **Command Palette**. Clicking it or using the `Ctrl+Shift+P` shortcut opens a dropdown list of all available actions.
- **Global Actions (Right Side):**
    - **Info:** Toggles the Info View, where you can read application documentation.
    - **Logs:** Toggles the Logger Panel at the bottom of the screen.
    - **Theme Toggle:** Switches the application between light and dark modes.
    - **Settings:** Toggles the Settings View.
- **Window Controls:** Standard operating system controls to minimize, maximize/restore, and close the application.

### The Sidebar

The resizable left panel is your main navigation and organization area.

- **Search:** A search bar at the top allows you to filter your prompts and folders by title.
- **Prompts List:** A hierarchical tree view of all your prompts and folders.
    - **Folders:** Can be expanded or collapsed. You can create new folders at the root level.
    - **Prompts:** Individual prompt files. Selecting a prompt opens it in the Main Content Area.
- **Templates List:** A separate list below your prompts for managing reusable templates.
- **Action Buttons:**
    - **New Folder/New Prompt:** Buttons at the top of the prompts list to create new items.
    - **New Template:** A button at the top of the templates list.
    - **New from Template...:** A button at the very bottom of the sidebar to create a new prompt using an existing template.

### The Main Content Area

This is the largest part of the application and displays the active content.

- **Welcome Screen:** Shown when no prompt is selected or when a folder is selected.
- **Prompt Editor:** The primary interface for writing and editing a prompt's content and title.
- **Template Editor:** A similar editor for creating and modifying prompt templates.
- **Settings View:** A dedicated screen for configuring the application.
- **Info View:** Displays documentation like the README and this manual.

### The Status Bar

The bar at the bottom of the window provides at-a-glance information about the application's state.

- **LLM Connection Status:** A colored dot (green for connected, red for error) and text indicating the connection status to your local AI provider.
- **Provider & Model Selection:** Dropdown menus to see the currently configured LLM provider and model, and to quickly switch between other detected services and their available models.
- **Statistics:** Shows the total number of prompts and the last save time for the active prompt.
- **App Version:** Displays the current version of PromptForge.

---

## 2. Core Features

### Creating Prompts and Folders

- **New Prompt:** Click the `+` icon at the top of the sidebar or use the `Ctrl+N` shortcut. A new, untitled prompt will be created and opened in the editor.
- **New Folder:** Click the folder icon with a `+` to create a new folder at the root of your prompt list.

### Editing Prompts

The prompt editor is a powerful Markdown-aware text editor.

- **Title:** The title of the prompt can be edited directly at the top of the editor.
- **Auto-Naming:** If you create an "Untitled Prompt" and start writing, the application will automatically generate a title for you based on the content after you've typed a sufficient amount.
- **Content:** The main text area supports Markdown syntax.
- **View Modes:**
    - **Editor Only:** The default text editing view.
    - **Preview Only:** A rendered view of your Markdown content.
    - **Split Vertical/Horizontal:** A side-by-side or top-and-bottom view of the editor and the live preview.
- **Toolbar Actions:**
    - **Undo/Redo:** Step backward or forward through your changes.
    - **Version History:** Open a view to see all saved versions of the prompt.
    - **Copy:** Copy the prompt's content to the clipboard.
    - **Refine with AI:** Send the prompt to your configured LLM to get an improved version.
    - **Delete:** Delete the current prompt.

### Organizing with Drag and Drop

You can organize your prompts and folders by dragging and dropping them in the sidebar. You can select multiple items using `Ctrl+Click` (or `Cmd+Click` on macOS) and drag them all at once.

You can drop an item (or a group of items):
- **Before** another item to place it above.
- **After** another item to place it below.
- **Inside** a folder to move it into that folder.

### AI-Powered Refinement

Clicking the **Refine with AI** (sparkles) button in the editor toolbar sends your current prompt to your configured local LLM. The AI's task is not to *answer* the prompt, but to *improve* it. A modal will appear with the suggested refinement, which you can then accept or discard.

### Using Templates

Templates are useful for prompts you create often.

- **Create a Template:** Use the "New Template" button in the sidebar. In the template editor, use `{{variable_name}}` syntax to define placeholders.
- **Create from Template:** Click the "New from Template..." button at the bottom of the sidebar. A modal will appear allowing you to select a template and fill in the values for its variables. This will generate a new prompt with the content filled in.

### Version History

PromptForge automatically saves a snapshot of your prompt's content every time you make a significant change.
- Click the **History** icon in the editor toolbar to open the history view.
- Here, you can select any previous version and see a "diff" comparing it to the version before it.
- You can copy content from an old version or restore the entire prompt to that state.

---

## 3. Views and Panels

### Command Palette

The Command Palette is the fastest way to access most of PromptForge's features.
- **Open:** Click the search box in the center of the title bar or press `Ctrl+Shift+P`.
- **Use:** Type to filter commands. Use the arrow keys to navigate and `Enter` to execute an action.

### Settings View

Accessed via the gear icon in the title bar. The settings are organized into categories:
- **LLM Provider:** Configure your connection to a local AI service. You can detect running services and select a model.
- **Appearance:** Change the UI scale and choose from different icon sets.
- **General:** Configure application behavior, like auto-saving logs and opting into pre-release updates.
- **Advanced:** View and edit the raw JSON configuration file, and import/export your settings.

### Info View

Accessed via the info icon in the title bar. This view contains tabs for reading the application's `README.md`, this `FUNCTIONAL_MANUAL.md`, the `TECHNICAL_MANUAL.md`, and the `VERSION_LOG.md`.

### Logger Panel

Accessed via the terminal icon in the title bar. This panel slides up from the bottom and displays internal application logs.
- **Filtering:** You can filter logs by level (DEBUG, INFO, WARNING, ERROR).
- **Actions:** You can clear the logs or save the current session's log to a file.