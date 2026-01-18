import { createCliRenderer } from "@opentui/core"
import { createColorPalette } from "./color"

export const renderer = await createCliRenderer()

export const theme = await createColorPalette(renderer)
