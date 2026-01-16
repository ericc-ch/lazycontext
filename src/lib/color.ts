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

type ColorScale = [
  RGBA,
  RGBA,
  RGBA,
  RGBA,
  RGBA,
  RGBA,
  RGBA,
  RGBA,
  RGBA,
  RGBA,
  RGBA,
  RGBA,
]

const LUMA_RED = 0.299
const LUMA_GREEN = 0.587
const LUMA_BLUE = 0.114

function luminance(r: number, g: number, b: number): number {
  return LUMA_RED * r + LUMA_GREEN * g + LUMA_BLUE * b
}

function generateColorScale(baseColor: RGBA, bg: RGBA) {
  const scale: ColorScale = [] as unknown as ColorScale
  const bgLum = luminance(bg.r, bg.g, bg.b)
  const isDark = bgLum < 0.5
  const r = baseColor.r * 255
  const g = baseColor.g * 255
  const b = baseColor.b * 255

  for (let i = 0; i <= 11; i++) {
    const t = (i + 1) / 12.0
    const factor = isDark ? 0.4 * t : 0.4 * (1 - t)
    const startMult = isDark ? 1 - factor : factor
    const endMult = isDark ? factor : 1 - factor
    const endVal = isDark ? 255 * 0.4 : 255 * 0.6

    scale[i] = RGBA.fromInts(
      Math.floor(r * startMult + endVal * endMult),
      Math.floor(g * startMult + endVal * endMult),
      Math.floor(b * startMult + endVal * endMult),
    )
  }

  return scale
}

function generateGrayScale(bg: RGBA) {
  return generateColorScale(RGBA.fromInts(128, 128, 128), bg)
}

export function createDefaultPalette() {
  const bg = RGBA.fromHex(DEFAULT_COLORS.bg)
  const fg = RGBA.fromHex(DEFAULT_COLORS.fg)

  return {
    bg: generateColorScale(bg, bg),
    fg: generateColorScale(fg, bg),

    primary: generateColorScale(RGBA.fromHex(DEFAULT_COLORS.cyan), bg),
    success: generateColorScale(RGBA.fromHex(DEFAULT_COLORS.green), bg),
    error: generateColorScale(RGBA.fromHex(DEFAULT_COLORS.red), bg),
    warning: generateColorScale(RGBA.fromHex(DEFAULT_COLORS.yellow), bg),
    info: generateColorScale(RGBA.fromHex(DEFAULT_COLORS.blue), bg),

    grays: generateGrayScale(bg),
    black: RGBA.fromHex(DEFAULT_COLORS.black),
    white: RGBA.fromHex(DEFAULT_COLORS.white),
  }
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
  const fgBase = RGBA.fromHex(defaultFg)

  return {
    bg: generateColorScale(bgBase, bgBase),
    fg: generateColorScale(fgBase, bgBase),

    primary: generateColorScale(RGBA.fromHex(ansiCyan), bgBase),
    success: generateColorScale(RGBA.fromHex(ansiGreen), bgBase),
    error: generateColorScale(RGBA.fromHex(ansiRed), bgBase),
    warning: generateColorScale(RGBA.fromHex(ansiYellow), bgBase),
    info: generateColorScale(RGBA.fromHex(ansiBlue), bgBase),

    grays: generateGrayScale(bgBase),
    black: RGBA.fromHex(DEFAULT_COLORS.black),
    white: RGBA.fromHex(DEFAULT_COLORS.white),
  } satisfies ReturnType<typeof createDefaultPalette>
}

export function withAlpha(color: RGBA, alpha: number) {
  return RGBA.fromValues(color.r, color.g, color.b, alpha)
}
