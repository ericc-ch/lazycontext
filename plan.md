# Keybinding System Refactor Plan

Refactor the current keybinding system to follow the centralized architecture defined in `@docs/keybinds.md`.

## Current State

- Hardcoded key navigation in `app.tsx` lines 223-245
- Direct `useKeyboard` calls with string comparisons (`key.name === "j"`)
- No centralized configuration
- No KeybindProvider service

## Target State

- Keybindings defined in `src/lib/keybinds.ts` as a simple object
- `KeybindProvider` context/service with `match()` method
- Components use `keybind.match("action_name", evt)` pattern
- Global vs local keybinding guards for dialogs

---

## Tasks

### 1. Create keybinds.ts with keybinding definitions

- [x] Create `src/lib/keybinds.ts`
- [x] Export `keybinds` object with action-to-keys mapping
- [x] Define actions: `navigate_down`, `navigate_up`, `add_repo`, `sync_repo`, `sync_all`, `cancel`
- [x] Map actions to keys: `["j", "down"]`, `["k", "up"]`, `"a"`, `"enter"`, `"s"`, `"escape"`

### 2. Create KeybindProvider service

- [x] Create `src/services/keybind.ts`
- [x] Implement `KeybindProvider` class with Effect.Service pattern
- [x] Import `keybinds` from `src/lib/keybinds.ts`
- [x] Add `match(action: string, evt: KeyEvent): boolean` method
- [x] Handle single key strings and arrays of keys

### 3. Refactor app.tsx to use KeybindProvider

- [x] Remove hardcoded `handleKeyNavigation` function
- [x] Import and initialize `KeybindProvider`
- [x] Update `useKeyboard` callback to use `keybind.match()` pattern
- [x] Add guards for view-specific keybindings (list vs add view)

### 4. Update RepoList component (if needed)

- [x] Check if RepoList has local keyboard handlers
- [x] Refactor to use KeybindProvider pattern if present
- [x] No local handlers found - component uses mouse events only

### 5. Update AddRepo component (if needed)

- [x] Check if AddRepo has local keyboard handlers
- [x] Refactor to use KeybindProvider pattern if present
- [x] No local handlers found - uses OpenTUI input built-in handling

### 6. Verify global vs local keybinding behavior

- [x] Test that global handlers don't trigger when dialogs are open
- [x] Test that local handlers only trigger when component is active
- [x] Verify `preventDefault()` conflict resolution works correctly

### 7. Run linting and type checking

- [x] Run `bun run lint`
- [x] Run `bun run typecheck`
- [x] Fix any issues

---

## Implementation Order

1. Start with tasks 1-2 (keybind definitions + provider)
2. Move to task 3 (main app refactor)
3. Complete tasks 4-6 (component updates + verification)
4. Finish with task 7 (quality checks)
