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

- [ ] Create `src/lib/keybinds.ts`
- [ ] Export `keybinds` object with action-to-keys mapping
- [ ] Define actions: `navigate_down`, `navigate_up`, `add_repo`, `sync_repo`, `sync_all`, `cancel`
- [ ] Map actions to keys: `["j", "down"]`, `["k", "up"]`, `"a"`, `"enter"`, `"s"`, `"escape"`

### 2. Create KeybindProvider service

- [ ] Create `src/services/keybind.ts`
- [ ] Implement `KeybindProvider` class with Effect.Service pattern
- [ ] Import `keybinds` from `src/lib/keybinds.ts`
- [ ] Add `match(action: string, evt: KeyEvent): boolean` method
- [ ] Handle single key strings and arrays of keys

### 3. Refactor app.tsx to use KeybindProvider

- [ ] Remove hardcoded `handleKeyNavigation` function
- [ ] Import and initialize `KeybindProvider`
- [ ] Update `useKeyboard` callback to use `keybind.match()` pattern
- [ ] Add guards for view-specific keybindings (list vs add view)

### 4. Update RepoList component (if needed)

- [ ] Check if RepoList has local keyboard handlers
- [ ] Refactor to use KeybindProvider pattern if present

### 5. Update AddRepo component (if needed)

- [ ] Check if AddRepo has local keyboard handlers
- [ ] Refactor to use KeybindProvider pattern if present

### 6. Verify global vs local keybinding behavior

- [ ] Test that global handlers don't trigger when dialogs are open
- [ ] Test that local handlers only trigger when component is active
- [ ] Verify `preventDefault()` conflict resolution works correctly

### 7. Run linting and type checking

- [ ] Run `bun run lint`
- [ ] Run `bun run typecheck`
- [ ] Fix any issues

---

## Implementation Order

1. Start with tasks 1-2 (keybind definitions + provider)
2. Move to task 3 (main app refactor)
3. Complete tasks 4-6 (component updates + verification)
4. Finish with task 7 (quality checks)
