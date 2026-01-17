import { createCliRenderer } from "@opentui/core"
import { runtime } from "../runtime"
import { createColorPalette } from "./color"

export const renderer = await createCliRenderer({
  onDestroy: () => {
    void runtime.dispose()
  },
})

export const theme = await createColorPalette(renderer)
