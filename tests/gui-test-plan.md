# PromptForge GUI Test Plan

## Objectives and Scope
- Validate the end-to-end user flows for prompt and template management across Electron and browser builds.
- Verify responsive layout behavior for resizable panels and modal overlays on common desktop resolutions.
- Confirm visual consistency between light and dark themes and across key components (header, sidebar, editors, status bar).
- Assess accessibility of keyboard navigation, focus management, and assistive technology support for icon-heavy controls.
- Exercise resilience of error-handling and recovery paths exposed through instrumentation hooks and UI affordances.

## Test Environment Matrix
| Environment ID | Device & OS | Browser / Shell | Screen Resolution |
| --- | --- | --- | --- |
| E1 | Windows 11 (22H2) Desktop | Electron shell (x64) | 1920×1080 |
| E2 | Windows 11 (22H2) Desktop | Chromium 118 (automation harness) | 1920×1080 |
| E3 | macOS Ventura 13.6 (MacBook Pro 14") | Electron shell (arm64) | 3024×1964 (scaled 1512×982) |
| E4 | macOS Ventura 13.6 (MacBook Pro 14") | Safari 17 (standalone bundle) | 1512×982 |
| E5 | Ubuntu 22.04 Desktop | Firefox 118 | 1920×1080 |

All scenarios list the primary environment; execute smoke passes on the remaining matrix where indicated under **Coverage Notes**.

## Prioritized Test Scenarios

### P0 – Critical Workflows

1. **Initial Launch & Instrumentation Bootstrap**  
   - **Environment:** E1 primary; smoke on E2.  
   - **Steps:**
     1. Launch application with clean storage; observe boot sequence.  
     2. Inspect developer console for instrumentation banner and registered automation regions via `window.__PROMPT_FORGE_AUTOMATION__`.  
     3. Trigger `app.getState` and `app.setView` harness hooks.  
   - **Expected Outcome:** App boots to welcome screen without runtime errors; automation namespace is populated with hooks; invoking hooks updates view and logs metrics entries.  

2. **Prompt Creation & Editing Flow**  
   - **Environment:** E1 primary; full regression on E3.  
   - **Steps:**
     1. From welcome state, create new prompt via command palette shortcut (`Ctrl+Shift+P`) or sidebar button.  
     2. Enter title and body text; toggle between editor, split view, and preview.  
     3. Verify auto-save indicator and version timestamp update in status bar.  
   - **Expected Outcome:** New prompt appears in sidebar, edits persist, preview renders Markdown accurately, status bar updates counts and last saved time.  

3. **Template Generation & “New from Template” Modal**  
   - **Environment:** E1 primary.  
   - **Steps:**
     1. Create template with placeholders (`{{variable}}`).  
     2. Launch “New from Template…” modal; populate variables; generate prompt.  
     3. Confirm generated prompt inherits filled values and metadata.  
   - **Expected Outcome:** Modal validates required fields, generates prompt under correct folder, and closes cleanly.  

4. **Command Palette Discovery & Execution**  
   - **Environment:** E2 primary (Chromium).  
   - **Steps:**
     1. Invoke `window.__PROMPT_FORGE_AUTOMATION__.invoke('app.focusCommandPalette')`.  
     2. Type search term for “Toggle Logger Panel”; execute via keyboard.  
     3. Validate logger panel toggles visibility and focus returns to triggering element.  
   - **Expected Outcome:** Palette overlays anchor below header target, filters commands responsively, executes action, and logs instrumentation event.  

5. **Prompt Deletion with Confirmation Modal**  
   - **Environment:** E1 primary.  
   - **Steps:**
     1. Select existing prompt; trigger delete.  
     2. Interact with confirmation modal via keyboard (Tab, Space/Enter).  
     3. Observe undo/history availability post deletion.  
   - **Expected Outcome:** Modal traps focus, deletion completes on confirm, history retains prior versions or warns appropriately.  

6. **LLM Discovery & Error Surfacing**  
   - **Environment:** E1 primary; coverage on E5.  
   - **Steps:**
     1. With no local providers running, open settings and trigger discovery.  
     2. Simulate unreachable endpoint via instrumentation `harness.invoke('network.simulateLLMFailure')` (if available) or by pointing to closed port.  
     3. Observe status bar error pill and logger output.  
   - **Expected Outcome:** Discovery gracefully reports no services without crashing; failed model fetch emits surfaced error message and retains prior selection.  

### P1 – High Priority Quality Gates

7. **Sidebar Resizing & Responsive Layout**  
   - **Environment:** E1 primary; smoke on E2, E5.  
   - **Steps:** Drag sidebar splitter to minimum and maximum bounds; resize window to 1280×720; verify content reflows and no overlapping text.  
   - **Expected Outcome:** Sidebar respects min width, editors remain usable, status bar remains visible without overflow.  

8. **Theme & Icon Set Switching**  
   - **Environment:** E3 primary.  
   - **Steps:** Toggle light/dark themes; cycle icon sets in settings; capture visual diffs for header, sidebar, modals.  
   - **Expected Outcome:** Theme switch persists, icons update consistently, no illegible text or mismatched backgrounds.  

9. **Version History Diff Rendering**  
   - **Environment:** E1 primary.  
   - **Steps:** Make sequential edits to prompt; open history view; review diff; restore older version.  
   - **Expected Outcome:** Diff highlights correct changes, restore updates editor and sidebar metadata, instrumentation logs restoration event.  

10. **Logger Panel Filters & Persistence**  
   - **Environment:** E1 primary; smoke on E2.  
   - **Steps:** Toggle panel via header, apply INFO/ERROR filters, clear logs, close and reopen app.  
   - **Expected Outcome:** Filters affect visible entries only, clearing persists, reopen shows retained layout settings.  

### P2 – Important Reliability & Accessibility Checks

11. **Keyboard-Only Navigation of Sidebar Tree**  
   - **Environment:** E4 primary; coverage on E1.  
   - **Steps:** Using Tab/Arrow keys, expand/collapse folders, select prompts/templates, activate buttons.  
   - **Expected Outcome:** Focus ring visible, ARIA tree semantics exposed, keyboard shortcuts respond without mouse input.  

12. **Screen Reader Announcements for Header Controls**  
   - **Environment:** E5 with Orca; coverage on E1 with NVDA.  
   - **Steps:** Enable screen reader, focus each header icon button, observe spoken labels, activate command palette and logger toggles.  
   - **Expected Outcome:** Each icon button exposes accessible name/role, tooltip information available to assistive tech, activation triggers expected UI change.  

13. **Error Boundary & Recovery Path**  
   - **Environment:** E2 primary.  
   - **Steps:** Use automation hook `app.simulateRenderError` to throw within child component; confirm boundary catches error, logs stack, and renders recovery UI.  
   - **Expected Outcome:** Renderer remains mounted, error view offers retry, logs contain structured entry with component path.  

14. **Performance Sampling During Bulk Operations**  
   - **Environment:** E1 primary.  
   - **Steps:** Import dataset of 200 prompts via instrumentation; measure metrics collector output for `prompt.render` and `sidebar.reflow`; verify no dropped frames > 16ms spikes beyond threshold.  
   - **Expected Outcome:** Metrics logged to harness, UI remains responsive, no memory warnings in dev tools.  

15. **Browser Bundle Regression (Static Server)**  
   - **Environment:** E2 primary; smoke on E5.  
   - **Steps:** Serve `dist/` via `tests/automation/serve-dist.js`, navigate to app in Chromium; execute Scenarios 2–4 via Playwright automation.  
   - **Expected Outcome:** Browser build mirrors Electron functionality, automation hooks remain operational, no DOM-only regressions.  

### Coverage Notes
- Execute P0 scenarios each release candidate.  
- P1 scenarios run weekly or whenever related code changes merge.  
- P2 scenarios run before quarterly accessibility and performance reviews.

