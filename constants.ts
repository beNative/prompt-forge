

import type { Settings, PromptTemplate } from './types';

export const LOCAL_STORAGE_KEYS = {
  PROMPTS: 'promptforge_prompts',
  TEMPLATES: 'promptforge_templates',
  SETTINGS: 'promptforge_settings',
  SIDEBAR_WIDTH: 'promptforge_sidebar_width',
  LOGGER_PANEL_HEIGHT: 'promptforge_logger_panel_height',
  EXPANDED_FOLDERS: 'promptforge_expanded_folders',
  TEMPLATES_INITIALIZED: 'promptforge_templates_initialized',
  PROMPT_VERSIONS: 'promptforge_prompt_versions',
};

export const DEFAULT_SETTINGS: Settings = {
  llmProviderUrl: '',
  llmModelName: '',
  llmProviderName: '',
  apiType: 'unknown',
  iconSet: 'heroicons',
  autoSaveLogs: false,
  allowPrerelease: false,
  uiScale: 100,
  treeNodeSpacing: 2,
  treeIndentSize: 16,
};

export const EXAMPLE_TEMPLATES: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        title: 'Creative Story Starter',
        content: 'Write the opening paragraph of a story about a {{character_type}} who discovers a mysterious {{object}} in a {{setting}}.',
    },
    {
        title: 'Technical Explainer',
        content: 'Explain the concept of {{technical_concept}} to a {{target_audience}} in simple terms. Use an analogy to help clarify the main idea.',
    },
    {
        title: 'Email Copywriter',
        content: 'Write a marketing email to promote a new product: {{product_name}}. The target audience is {{audience_description}}. The email should have a compelling subject line, highlight the key feature: {{key_feature}}, and include a clear call to action: {{call_to_action}}.',
    },
    {
        title: 'Code Generation',
        content: 'Write a function in {{programming_language}} that takes {{input_parameters}} as input and {{function_purpose}}. Include comments explaining the code.',
    },
    {
        title: 'Social Media Post',
        content: 'Draft a social media post for {{platform}} announcing {{announcement}}. The tone should be {{tone}}, and it should include the hashtag #{{hashtag}}.',
    },
    {
        title: 'Five Whys Root Cause Analysis',
        content: 'Perform a "Five Whys" root cause analysis for the following problem:\n\nProblem Statement: {{problem_statement}}\n\n1. Why did this happen?\n   - Because...\n2. Why did that happen?\n   - Because...\n3. Why did that happen?\n   - Because...\n4. Why did that happen?\n   - Because...\n5. Why did that happen?\n   - Because...\n\nRoot Cause:',
    },
];