export const keybinds = {
  navigate_down: ["j", "down"],
  navigate_up: ["k", "up"],
  add_repo: "a",
  sync_repo: "enter",
  sync_all: "s",
  cancel: "escape",
} as const

export type KeyAction = keyof typeof keybinds
