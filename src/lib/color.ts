import { RGBA, type CliRenderer } from "@opentui/core"

export const DEFAULT_COLORS = {
  bg: "#000000",
  fg: "#ffffff",

  blue: "#0000ff",
  cyan: "#00ffff",
  green: "#00ff00",
  red: "#ff0000",
  yellow: "#ffff00",

  black: "#000000",
  white: "#ffffff",
} as const

async function getTerminalPalette(renderer: CliRenderer) {
  return await renderer.getPalette({ size: 16 })
}

type ColorScale = [RGBA, RGBA, RGBA, RGBA, RGBA, RGBA, RGBA, RGBA, RGBA]

function generateColorScale(baseColor: RGBA): ColorScale {
  const scale = Array.from({ length: 9 }, () =>
    RGBA.fromInts(0, 0, 0),
  ) as ColorScale

  for (let i = 0; i <= 3; i++) {
    const mix = (i + 1) / 5
    const r = Math.round(baseColor.r * (1 - mix) + 255 * mix)
    const g = Math.round(baseColor.g * (1 - mix) + 255 * mix)
    const b = Math.round(baseColor.b * (1 - mix) + 255 * mix)
    scale[i] = RGBA.fromInts(r, g, b)
  }

  scale[4] = baseColor

  for (let i = 5; i <= 8; i++) {
    const mix = (i - 4) / 4
    const r = Math.round(baseColor.r * (1 - mix))
    const g = Math.round(baseColor.g * (1 - mix))
    const b = Math.round(baseColor.b * (1 - mix))
    scale[i] = RGBA.fromInts(r, g, b)
  }

  return scale
}

function generateGrayScale() {
  return generateColorScale(RGBA.fromInts(128, 128, 128))
}

export async function createColorPalette(renderer: CliRenderer) {
  const terminal = await getTerminalPalette(renderer)

  const defaultBg = terminal.defaultBackground ?? DEFAULT_COLORS.bg
  const defaultFg = terminal.defaultForeground ?? DEFAULT_COLORS.fg

  const ansiRed = terminal.palette[1] ?? DEFAULT_COLORS.red
  const ansiGreen = terminal.palette[2] ?? DEFAULT_COLORS.green
  const ansiYellow = terminal.palette[3] ?? DEFAULT_COLORS.yellow
  const ansiBlue = terminal.palette[4] ?? DEFAULT_COLORS.blue
  const ansiCyan = terminal.palette[6] ?? DEFAULT_COLORS.cyan

  const bgBase = RGBA.fromHex(defaultBg)

  return {
    bg: generateColorScale(bgBase),
    fg: generateColorScale(RGBA.fromHex(defaultFg)),

    primary: generateColorScale(RGBA.fromHex(ansiCyan)),
    success: generateColorScale(RGBA.fromHex(ansiGreen)),
    error: generateColorScale(RGBA.fromHex(ansiRed)),
    warning: generateColorScale(RGBA.fromHex(ansiYellow)),
    info: generateColorScale(RGBA.fromHex(ansiBlue)),

    grays: generateGrayScale(),
    black: RGBA.fromHex(DEFAULT_COLORS.black),
    white: RGBA.fromHex(DEFAULT_COLORS.white),
  }
}

export function withAlpha(color: RGBA, alpha: number) {
  return RGBA.fromValues(color.r, color.g, color.b, alpha)
}
