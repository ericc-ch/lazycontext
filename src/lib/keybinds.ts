import type { KeyEvent } from "@opentui/core"

export type KeyAction =
  | "toggle-console"
  | "navigate-down"
  | "navigate-up"
  | "repo-add"
  | "repo-sync"
  | "repo-sync-all"
  | "cancel"

export const keybinds = new Map<KeyAction, string | string[]>([
  ["toggle-console", "f12"],
  ["navigate-down", ["j", "down"]],
  ["navigate-up", ["k", "up"]],
  ["repo-add", "a"],
  ["repo-sync", "enter"],
  ["repo-sync-all", "s"],
  ["cancel", "escape"],
])

export const match = (event: KeyEvent, action: KeyAction) => {
  const keys = keybinds.get(action)
  if (Array.isArray(keys)) {
    return keys.includes(event.name)
  }
  return event.name === keys
}
