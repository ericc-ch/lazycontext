import { createCliRenderer } from "@opentui/core"
import { serverRuntime } from "../runtime"
import { createColorPalette } from "./color"

export const renderer = await createCliRenderer({
  onDestroy: () => {
    void serverRuntime.dispose()
  },
})

export const theme = await createColorPalette(renderer)
