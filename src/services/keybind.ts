import { Effect } from "effect"
import { keybinds, type KeyAction } from "../lib/keybinds"
import type { KeyEvent } from "@opentui/core"

export class KeybindProvider extends Effect.Service<KeybindProvider>()(
  "@lazycontext/KeybindProvider",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const match = (action: KeyAction, evt: KeyEvent): boolean => {
        const keys = keybinds[action]
        if (Array.isArray(keys)) {
          return keys.includes(evt.name)
        }
        return evt.name === keys
      }

      return { match }
    }),
  },
) {}
