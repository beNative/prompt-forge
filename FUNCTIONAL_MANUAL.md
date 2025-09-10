# PromptForge Functional Manual

This manual provides a comprehensive guide to using the PromptForge application.

## 1. Introduction

PromptForge is a tool designed to help you create, manage, and improve your prompts for Large Language Models (LLMs). It connects to a local LLM instance (like Ollama) to provide AI-powered assistance.

## 2. Main Interface

The application window is divided into four main sections:

- **Header**: Contains global actions like creating a new prompt, opening settings, toggling themes, viewing documentation, and toggling logs.
- **Prompt List (Left Sidebar)**: Displays all your saved prompts and folders in a tree structure.
- **Editor (Main Area)**: The primary workspace where you write and refine the selected prompt.
- **Status Bar (Footer)**: Shows the connection status of your LLM provider and provides quick-actions to change the active provider and model.

## 3. The Command Palette

For quick, keyboard-driven access to common actions, use the Command Palette.

- **Open the Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) or click the **Command (</>) icon** in the header.
- **Usage**:
    - Type to search for a command (e.g., "new", "delete").
    - Use the `Up` and `Down` arrow keys to navigate the list.
    - Press `Enter` to execute the selected command.
    - Press `Esc` to close the palette.

## 4. Managing Prompts & Folders

### 4.1. Creating a New Prompt or Folder

- To create a new prompt at the root level, click the **Plus (+) icon** in the sidebar header.
- To create a new folder at the root level, click the **Folder Plus icon** in the sidebar header.
- Or, open the **Command Palette** and select "Create New Prompt" or "Create New Folder".
- A new item will be created and appear in the list. It will automatically become the active item.

### 4.2. Selecting an Item

- Click on any prompt or folder title in the list on the left to select it.
- If a prompt is selected, it will open in the editor. If a folder is selected, a welcome screen will be shown.
- The currently active item is highlighted.

### 4.3. Editing a Prompt

- Once a prompt is selected, you can edit its title and content directly in the editor pane.
- A pulsing dot will appear next to the title to indicate unsaved changes.
- Changes are saved automatically after you stop typing for a moment.
- **Undo/Redo**: You can undo and redo changes to the prompt's content using:
    - Keyboard shortcuts: `Ctrl+Z` (Undo) and `Ctrl+Y` (Redo). On macOS, use `Cmd+Z` and `Cmd+Shift+Z`.
    - UI Buttons: Click the **Undo** and **Redo** arrow buttons at the bottom-left of the editor.

### 4.4. Deleting an Item

- **From the Editor**: Click the "Delete" button in the top right of the editor (only for the active prompt).
- **From the List**: Hover over an item in the list and click the small trash can icon that appears.
- **From the Command Palette**: Open the palette and select "Delete Current Item".
- A confirmation dialog will appear before the item is permanently deleted. If you delete a folder, all its contents will also be deleted.

### 4.5. Copying a Prompt's Content

- **From the List**: Hover over any prompt in the sidebar list. A "Copy" icon will appear. Clicking it will instantly copy the entire content of that prompt to your clipboard.

### 4.6. Search & Filtering

At the top of the sidebar, you will find a search bar to help you quickly locate items.

- **How to Use**: Simply start typing in the search bar. The list will update in real-time to show only prompts and folders whose titles match your search query.
- **Highlighting**: The part of the title that matches your search term will be highlighted, making it easy to spot.
- **Context Preservation**: When a nested item matches your search, all of its parent folders will remain visible (and expanded) so you can see its location in the hierarchy.

### 4.7. Organizing with Drag & Drop

You can organize your prompts and folders by dragging and dropping them in the sidebar.

- **Reordering**: Click and drag an item to a new position relative to another item. A visual indicator will show where it will be placed (above or below).
- **Nesting (Creating Sub-folders)**: Drag a prompt or another folder and drop it directly onto a folder to move it inside. This allows you to create a nested, hierarchical structure.
- **Moving to Root**: Drag an item to an empty area at the bottom of the list to move it to the root level.

## 5. AI-Powered Refinement

This is one of PromptForge's key features. You can ask your connected local LLM to improve your prompt.

1.  Write or edit your prompt in the main text area.
2.  Click the **"Refine with AI"** button at the bottom right of the editor.
3.  The application will send your prompt to the configured LLM with instructions to improve it.
4.  A modal will appear showing the AI's suggested refinement.
5.  You can choose to **"Accept"** the suggestion, which will replace your current prompt content, or **"Discard"** it to keep your original text. Accepting the change adds it to the undo history, so you can easily revert it.

## 6. Application Settings

- Click the **Gear (⚙️) icon** in the header to open the Settings view.
- Or, open the **Command Palette** and select "Toggle Settings View".
- The Settings view is a full-page interface divided into sections for **LLM Provider**, **Appearance**, **Updates**, and **Logging**.

### 6.1. LLM Provider Configuration

The application provides two ways to configure your LLM provider:

- **Quick-Switch (Status Bar)**: For fast changes, use the dropdown menus in the status bar at the bottom of the application to switch between detected providers and their available models.
- **Full Configuration (Settings View)**:
    1.  **Detect Service**: If your service isn't listed, ensure it's running and click the **"Re-Detect Services"** button.
    2.  **Select a Service**: Choose one of the automatically detected services from the "Detected Service" dropdown.
    3.  **Select a Model**: Once a service is selected, the application will fetch its available models. Choose the model you wish to use from the "Model Name" dropdown.

### 6.2. Appearance Settings

Here you can customize the look and feel of the application.

- **UI Icon Set**: Select your preferred icon set for the application's user interface from the available options (e.g., Heroicons, Lucide). Your selection is shown in a preview and applied after saving. Options for other popular icon sets like Feather, Tabler, and Material are shown as "Coming Soon" and will be available in a future update.

### 6.3. Update Settings

- **Receive Pre-releases**: Toggle this option to be notified of new beta versions. This allows you to try out new features before they are officially released.

### 6.4. Logging Settings

- **Auto-save Logs**: Toggle this option to automatically append all log messages to a daily log file in the application's `data` directory. This is useful for debugging and is only available in the desktop version.

### 6.5. Advanced Settings (Import/Export)

For power users, an advanced settings section provides direct access to the application's configuration file.

- **Accessing the Editor**: In the "Advanced" section of the settings page, click the **"Show Editor"** button.
- **Editing**: This will reveal a text editor with your current settings displayed in JSON format, complete with syntax highlighting. You can make direct changes here. The editor will show an error if the JSON is not valid, preventing you from saving until it is fixed.
- **Exporting**: Click the **"Export to File..."** button to save a copy of your current settings as a `.json` file. This is useful for backups or for sharing your configuration.
- **Importing**: Click the **"Import from File..."** button to open a file dialog. Select a valid `promptforge_settings.json` file to load its configuration into the application. The imported settings will be displayed in the editor, and you must click "Save Changes" to apply them.

### 6.6. Saving Changes

Changes are not applied immediately. You must click the **"Save Changes"** button at the top-right of the screen to apply your new settings. The button will be disabled if there are no changes to save.

## 7. Info & Documentation

- Click the **Information (ℹ️) icon** in the header to switch to the Info View.
- This view contains tabs to read the application's `README`, this `Functional Manual`, the `Technical Manual`, and the `Version Log`.
- Click the icon again or use the Command Palette to return to the prompt editor.

## 8. Logging

- Click the **File Code icon** in the header to open the Application Logs panel.
- This panel shows real-time activity within the app, such as API calls and errors.
- You can filter messages by type (Debug, Info, Warning, Error).
- You can save the current log to a file by clicking the **"Save Log"** button.

## 9. Automatic Updates

PromptForge is designed to keep itself up-to-date.

- When you start the application, it will quietly check for a new version in the background.
- If an update is found, it will be downloaded automatically.
- Once the download is complete, you will receive a system notification. The update will be installed the next time you close and reopen PromptForge.