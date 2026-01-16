import { Effect } from "effect"
import { keybinds, type KeyAction } from "../lib/keybinds"

interface KeyEventLike {
  name: string
}

export class KeybindProvider extends Effect.Service<KeybindProvider>()(
  "@lazycontext/KeybindProvider",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const match = (action: KeyAction, evt: KeyEventLike): boolean => {
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
