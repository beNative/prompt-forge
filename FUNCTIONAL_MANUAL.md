# PromptForge Functional Manual

This manual provides a comprehensive guide to using the PromptForge application.

## 1. Introduction

PromptForge is a tool designed to help you create, manage, and improve your prompts for Large Language Models (LLMs). It connects to a local LLM instance (like Ollama) to provide AI-powered assistance.

## 2. Main Interface

The application window is divided into three main sections:

- **Header**: Contains global actions like creating a new prompt, opening settings, viewing documentation, and toggling logs.
- **Prompt List (Left Sidebar)**: Displays all your saved prompts.
- **Editor (Main Area)**: The primary workspace where you write and refine the selected prompt.

## 3. Managing Prompts

### 3.1. Creating a New Prompt

- Click the **Plus (+) icon** in the header.
- A new "Untitled Prompt" will be created and appear at the top of the Prompt List. It will automatically become the active prompt in the editor.

### 3.2. Selecting a Prompt

- Click on any prompt title in the Prompt List on the left to open it in the editor.
- The currently active prompt is highlighted.

### 3.3. Editing a Prompt

- Once a prompt is selected, you can edit its title and content directly in the editor pane.
- Changes are saved automatically after a brief delay.

### 3.4. Deleting a Prompt

- **From the Editor**: Click the "Delete" button in the top right of the editor.
- **From the List**: Hover over a prompt in the list (that is not active) and click the small trash can icon that appears.
- A confirmation dialog will appear before the prompt is permanently deleted.

## 4. AI-Powered Refinement

This is one of PromptForge's key features. You can ask your connected local LLM to improve your prompt.

1.  Write or edit your prompt in the main text area.
2.  Click the **"Refine with AI"** button at the bottom right of the editor.
3.  The application will send your prompt to the configured LLM with instructions to improve it.
4.  A modal will appear showing the AI's suggested refinement.
5.  You can choose to **"Accept"** the suggestion, which will replace your current prompt content, or **"Discard"** it to keep your original text.

## 5. Application Settings

- Click the **Gear (⚙️) icon** in the header to open the Settings modal.
- **LLM Provider URL**: The API endpoint for your local LLM. For Ollama, this is typically `http://localhost:11434/api/generate`. For LMStudio, it's often `http://localhost:1234/v1/chat/completions`. *Note: The service must be compatible with the Ollama generate API structure.*
- **Model Name**: The specific model you want to use for refinement (e.g., `llama3`, `mistral`).
- Click **"Save"** to apply your changes.

## 6. Info & Documentation

- Click the **Information (ℹ️) icon** in the header to switch to the Info View.
- This view contains tabs to read the application's `README`, this `Functional Manual`, the `Technical Manual`, and the `Version Log`.
- Click the icon again to return to the prompt editor.

## 7. Logging

- Click the **File Code icon** in the header to open the Application Logs panel.
- This panel shows real-time activity within the app, such as API calls and errors.
- You can filter messages by type (Debug, Info, Warning, Error).
- You can save the current log to a file by clicking the **"Save Log"** button.
