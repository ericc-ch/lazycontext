# Implementation Plan

This plan outlines the implementation steps for the lazycontext redesign and feature additions.

## Overview

Redesign the app with:

- Borderless UI using background colors instead of borders
- Command log replacing simple status bar
- Custom Effect Logger combining default logging with Ref for command log display
- Full-height command log in side-by-side layout
- New item creation flow with auto-parse from GitHub links
- `q` key binding for exiting

---

## Tasks

### 1. Redesign UI to Borderless with Backgrounds

**Requirement:** Remove all borders from components. Use background colors to define areas and visual hierarchy instead.

**Steps:**

- [x] 1.1. Modify `src/components/repo-list.tsx`: - Remove `border` and `borderColor` props from the main `<box>` container - Increase `backgroundColor` contrast between header, list, and footer areas - Add subtle background variations to differentiate sections: - Header: slightly lighter `bg[2]` - List area: base `bg[1]` - Footer: darker `bg[3]` - Keep padding consistent to maintain spacing

- [x] 1.2. Modify `src/components/add-repo.tsx`: - Remove `border` and `borderColor` props - Use different background color to indicate "modal/overlay" state - Add subtle shadow or indentation effect if possible via padding

- [x] 1.3. Modify `src/components/status-bar.tsx`: - Remove `border` and `borderStyle` props - Use background color to distinguish the log area - Keep padding for spacing

- [x] 1.4. Modify `src/app.tsx` layout: - Update the main container gap and padding for cleaner layout without borders - Adjust flexGrow/flexBasis ratios if needed for visual balance

**Reference Files:**

- `src/components/repo-list.tsx` - current border usage at lines 115-121, 178-184
- `src/components/add-repo.tsx` - current border usage at lines 27-31
- `src/components/status-bar.tsx` - current border usage at lines 38-40
- `docs/opentui.md` - Box styling (lines 736-761) for `backgroundColor`, `bg` props

---

### 2. Convert StatusBar to Command Log

**Requirement:** Replace the simple status message display with a full command log that shows git operations, add actions, sync status, etc.

**Steps:**

- [x] 2.1. Create new component `src/components/command-log.tsx`: - Accept list of log entries (array of objects with timestamp, type, message) - Display logs in reverse chronological order (newest first) - Support scrollable view for many entries - Show timestamps and color-coded message types (info, success, error, command) - Auto-scroll to top when new entries added - Full height in side-by-side layout (remove width constraint)

- [x] 2.2. Design log entry structure:
      `typescript
interface LogEntry {
  id: string
  timestamp: Date
  type: "info" | "success" | "error" | "command"
  message: string
  details?: string  // optional additional info
}
`

- [x] 2.3. Update `src/components/status-bar.tsx`: - Remove or repurpose this component - Can be used as-is for narrow mode (horizontal layout)

- [x] 2.4. Update `src/app.tsx`: - Remove `message` and `messageType` from AppState - Add `commandLogs: LogEntry[]` to AppState - Update StatusBar usage to CommandLog in wide mode - Pass logs array to CommandLog component

**Reference Files:**

- `src/components/status-bar.tsx` - existing component to replace
- `src/app.tsx` - AppState (lines 15-22) and usage of StatusBar (lines 320-332)
- `docs/opentui.md` - ScrollBox (lines 334-365) for scrollable log display
- `docs/opentui.md` - Text styling (lines 176-216) for colored log entries

---

### 3. Create Custom Effect Logger

**Requirement:** Create a custom Effect Logger that combines the default logger functionality with a Ref to display in the command log UI.

**Steps:**

- [x] 3.1. Create new service `src/services/logger.ts`: - Create a LogEntry interface - Define Logger methods: `log`, `info`, `success`, `error`, `command` - Each method should: - Write to console (default logger behavior) - Add entry to the log store (for UI display) - Accept message and optional details - Store logs in a shared logStore accessible from UI

- [x] 3.2. Design the logger service:
      `typescript
export interface Logger {
  log: (message: string, details?: string) => void
  info: (message: string, details?: string) => void
  success: (message: string, details?: string) => void
  error: (message: string, details?: string) => void
  command: (command: string, args: string[]) => void
}
export const Logger = Context.Tag("@app/Logger")
 `

- [x] 3.3. Update `src/runtime.ts`: - Remove Logger layer (using standalone logger instead of Effect service)

- [x] 3.4. Integrate logger into existing operations: - Update `src/services/git.ts` to use Logger for clone, pull operations

- [x] 3.5. Handle Ref sharing with UI: - Created logStore module with getLogs, addLog, clear methods - UI can import logStore to access log entries

**Reference Files:**

- `src/runtime.ts` - existing Effect runtime setup
- `src/services/git.ts` - git operations to log (lines 16-76)
- `src/services/config.ts` - config operations to log (lines 51-88)
- `docs/effect.md` - Effect.Service and Context.Tag patterns (lines 1-37)
- `docs/effect.md` - Error handling (lines 44-61)

---

### 4. Command Log Full Height in Side-by-Side Layout

**Requirement:** When in side-by-side layout (wide mode), the command log should take full available height.

**Steps:**

- [ ] 4.1. Modify `src/components/command-log.tsx`: - Set `flexGrow={1}` and `flexShrink={1}` for full height usage - Remove fixed `width={40}` constraint - Ensure internal scrollbox takes full height

- [ ] 4.2. Update `src/app.tsx` layout: - Remove `width={40}` constraint from the right-side box (line 321) - Change `flexShrink={0}` to `flexShrink={1}` for right panel - Let the command log expand to fill available space

- [ ] 4.3. Ensure proper scrolling: - The scrollbox inside command log should handle overflow - Show scroll indicators if configured

**Reference Files:**

- `src/app.tsx` - current side-by-side layout (lines 283-333)
- `docs/opentui.md` - ScrollBox for scroll handling (lines 334-365)

---

### 5. New Item Creation with GitHub Link Auto-Parse

**Requirement:** When adding an item (repo), create a new empty item in the list in editable state. User can ctrl+v or ctrl+shift+v to paste a GitHub link. After paste, the name is auto-parsed from the URL.

**Steps:**

- [ ] 5.1. Modify `src/app.tsx` AppState: - Add `editingIndex: number | null` to track which item is being edited - Add `isAdding: boolean` to track if user is adding a new item

- [ ] 5.2. Create or modify `src/components/repo-item.tsx`: - Add support for editable state with input field - When `editing={true}`, show input instead of static text - Auto-focus the input when entering edit mode - Handle paste events (Ctrl+V) in the input

- [ ] 5.3. Modify `src/components/repo-list.tsx`: - Accept `editingIndex` prop - Pass `editing` prop to each RepoItem based on index - Support both "static" and "editing" item at the same time (for adding new)

- [ ] 5.4. Update `src/components/add-repo.tsx` or create new flow: - Instead of modal, add new empty item at end of list in editing mode - User pastes URL or types it - On Enter or blur, parse URL and validate

- [ ] 5.5. Implement URL parsing in `src/lib/url.ts`: - The existing `parseGithubUrl` already does this - Use it to extract owner/repo name from pasted URL

- [ ] 5.6. Handle paste events: - Use `usePaste` hook from OpenTUI - When paste detected in editing input, validate if it's a GitHub URL - If valid, auto-fill the name field and prepare for save

- [ ] 5.7. Handle save/cancel: - On Enter: save the new repo (trigger clone) - On Escape: cancel and remove the empty item - On blur without save: ask confirmation or auto-save

- [ ] 5.8. Update keybindings in `src/lib/keybinds.ts`: - `a` key: creates new empty item at end of list, enters edit mode

**Reference Files:**

- `src/lib/url.ts` - existing `parseGithubUrl` function (lines 3-18)
- `src/components/add-repo.tsx` - current add flow to replace
- `src/components/repo-list.tsx` - RepoItem usage (lines 165-174)
- `docs/opentui.md` - Input component (lines 217-247) for editable items
- `docs/opentui.md` - usePaste hook (lines 542-554) for paste handling

---

### 6. Add `q` Keybinding for Exiting

**Requirement:** Add `q` key to exit the application.

**Steps:**

- [x] 6.1. Update `src/lib/keybinds.ts`: - Add `"quit": "q"` to the keybinds Map (line 12-20) - Add `"quit"` to KeyAction type (line 3-10)

- [x] 6.2. Update `src/app.tsx` handleKeyboard function: - Add handler for `quit` action - On quit, call `process.exit(0)` or use renderer cleanup

**Reference Files:**

- `src/lib/keybinds.ts` - existing keybinds (lines 12-20)
- `src/app.tsx` - handleKeyboard function (lines 232-275)
- `docs/opentui.md` - useKeyboard hook (lines 495-522) for event handling

---

## Implementation Order

1.  **Phase 1: Foundation**

- [x] Task 6: Add `q` for exiting (simple, quick win)
- [x] Task 1: Redesign UI to borderless (visual changes, affects all components)

2. **Phase 2: Logger & Command Log**
   - [x] Task 3: Create custom Effect Logger (core infrastructure)
   - [x] Task 2: Convert StatusBar to Command Log (UI for logger)
   - [ ] Task 4: Command log full height in side-by-side (layout adjustment)

3. **Phase 3: New Item Flow**
   - [ ] Task 5: New item creation with GitHub link auto-parse (feature completion)

---

## File Changes Summary

| File                             | Changes                                                           |
| -------------------------------- | ----------------------------------------------------------------- |
| `src/lib/keybinds.ts`            | Add `quit` action, `q` keybinding                                 |
| `src/lib/url.ts`                 | May need enhancements for URL validation                          |
| `src/services/logger.ts`         | **NEW** - Custom Logger service with logStore                     |
| `src/services/log-store.ts`      | **DELETED** - Merged into logger.ts                               |
| `src/services/git.ts`            | Integrated logger into clone and pull operations                  |
| `src/components/command-log.tsx` | **NEW** - Command log component                                   |
| `src/components/repo-list.tsx`   | Remove borders, support editable items                            |
| `src/components/repo-item.tsx`   | **NEW or modify** - Support editable state                        |
| `src/components/add-repo.tsx`    | Remove or modify (replaced by inline editing)                     |
| `src/components/status-bar.tsx`  | Remove or repurpose for narrow mode                               |
| `src/app.tsx`                    | Major refactor: AppState, layout, keybindings, logger integration |

---

## Testing Considerations

After implementation:

- [ ] Run `bun run typecheck` to verify TypeScript types
- [ ] Run `bun run lint` to check for linting issues
- [ ] Run `bun test` if tests exist
- [ ] Manual testing: - [ ] Verify borderless UI looks correct - [ ] Test command logging during git operations - [ ] Test new item creation flow with URL paste - [ ] Test `q` to exit - [ ] Test responsive layout (wide vs narrow)
