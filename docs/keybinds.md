# Keybinding Architecture

## Overview

Uses a centralized keybinding system with two layers:

```
┌─────────────────────────────────────────────────────────┐
│  KEYBIND LAYER                                          │
│  keybinds.ts: { new_session: "ctrl+n", ... }            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  CONTEXT LAYER                                          │
│  KeybindProvider: stores keybinds, match() method       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  COMPONENT LAYER                                        │
│  useKeyboard((evt) => { keybind.match("action", evt) })│
└─────────────────────────────────────────────────────────┘
```

## Keybind Layer

Keybindings are defined in `src/lib/keybinds.ts`:

```typescript
export const keybinds = {
  navigate_down: ["j", "down"],
  navigate_up: ["k", "up"],
  add_repo: "a",
  sync_repo: "enter",
  sync_all: "s",
  cancel: "escape",
}
```

## Context Layer

The `KeybindProvider` provides a `match()` method:

```typescript
const keybind = useKeybind()

useKeyboard((evt) => {
  if (keybind.match("new_session", evt)) {
    navigate("/home")
    evt.preventDefault()
  }
})
```

## Global vs Local Keybindings

All components register `useKeyboard` handlers. Each handler decides:

1. Does this keypress belong to me?
2. If yes → handle it and call `evt.preventDefault()` to stop other handlers
3. If no → do nothing, let other handlers try

### How It Works

Every `useKeyboard` callback runs for every keypress. Components use guards to control when they handle keys:

**Global handler** (runs everywhere, skips when dialogs are open):

```typescript
useKeyboard((evt) => {
  if (dialog.stack.length > 0) return // Skip if dialog open

  if (keybind.match("new_session", evt)) {
    navigate("/home")
    evt.preventDefault()
  }
})
```

**Local handler** (only when component is active):

```typescript
useKeyboard((evt) => {
  if (!isActive) return // Skip if not active

  if (keybind.match("delete_item", evt)) {
    deleteCurrentItem()
    evt.preventDefault()
  }
})
```

### Conflict Resolution

No priority system. Every handler runs for every keypress. First handler to call `evt.preventDefault()` wins:

```
User presses: Ctrl+N

GlobalNav checks: dialog closed? YES → handles → preventDefault()

Session checks: dialog closed? NO → returns early, does nothing
```

## Key Design

| Problem             | Solution                                                  |
| ------------------- | --------------------------------------------------------- |
| Centralized config  | Single TS object, imported directly                       |
| Global vs local     | Components check their own state (isDialogOpen, isActive) |
| Conflict resolution | First handler to call `preventDefault()` wins             |
| Display keybinds    | Call helper to format keybinds for UI labels              |
