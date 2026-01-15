import { RGBA, type CliRenderer } from "@opentui/core"

export const DEFAULT_COLORS = {
  bg: "#000000",
  fg: "#ffffff",
  red: "#ff0000",
  brightRed: "#ff5555",
  green: "#00ff00",
  brightGreen: "#55ff55",
  yellow: "#ffff00",
  brightYellow: "#ffff55",
  blue: "#0000ff",
  brightBlue: "#5555ff",
  cyan: "#00ffff",
  brightCyan: "#55ffff",

  black: "#000000",
  white: "#ffffff",
} as const

export interface ColorPalette {
  primary: Record<number, RGBA>
  success: Record<number, RGBA>
  error: Record<number, RGBA>
  warning: Record<number, RGBA>
  info: Record<number, RGBA>
  bg: Record<number, RGBA>
  fg: Record<number, RGBA>
  grays: Record<number, RGBA>
  red: RGBA
  brightRed: RGBA
  green: RGBA
  brightGreen: RGBA
  yellow: RGBA
  brightYellow: RGBA
  blue: RGBA
  brightBlue: RGBA
  cyan: RGBA
  brightCyan: RGBA
  black: RGBA
  white: RGBA
}

async function getTerminalPalette(renderer: CliRenderer) {
  return await renderer.getPalette({ size: 16 })
}

function generateColorScale(baseColor: RGBA, bg: RGBA): Record<number, RGBA> {
  const scale: Record<number, RGBA> = {}
  const bgLum = 0.299 * bg.r * 255 + 0.587 * bg.g * 255 + 0.114 * bg.b * 255
  const isDark = bgLum < 128
  const r = baseColor.r * 255
  const g = baseColor.g * 255
  const b = baseColor.b * 255

  for (let i = 1; i <= 12; i++) {
    const t = i / 12.0
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

function generateGrayScale(bg: RGBA): Record<number, RGBA> {
  return generateColorScale(RGBA.fromInts(128, 128, 128), bg)
}

export async function createColorPalette(
  renderer: CliRenderer,
): Promise<ColorPalette> {
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
    primary: generateColorScale(RGBA.fromHex(ansiCyan), bgBase),
    success: generateColorScale(RGBA.fromHex(ansiGreen), bgBase),
    error: generateColorScale(RGBA.fromHex(ansiRed), bgBase),
    warning: generateColorScale(RGBA.fromHex(ansiYellow), bgBase),
    info: generateColorScale(RGBA.fromHex(ansiBlue), bgBase),
    bg: generateColorScale(bgBase, bgBase),
    fg: generateColorScale(fgBase, bgBase),
    grays: generateGrayScale(bgBase),
    red: RGBA.fromHex(terminal.palette[1] ?? DEFAULT_COLORS.red),
    brightRed: RGBA.fromHex(DEFAULT_COLORS.brightRed),
    green: RGBA.fromHex(terminal.palette[2] ?? DEFAULT_COLORS.green),
    brightGreen: RGBA.fromHex(DEFAULT_COLORS.brightGreen),
    yellow: RGBA.fromHex(terminal.palette[3] ?? DEFAULT_COLORS.yellow),
    brightYellow: RGBA.fromHex(DEFAULT_COLORS.brightYellow),
    blue: RGBA.fromHex(terminal.palette[4] ?? DEFAULT_COLORS.blue),
    brightBlue: RGBA.fromHex(DEFAULT_COLORS.brightBlue),
    cyan: RGBA.fromHex(terminal.palette[6] ?? DEFAULT_COLORS.cyan),
    brightCyan: RGBA.fromHex(DEFAULT_COLORS.brightCyan),
    black: RGBA.fromHex(DEFAULT_COLORS.black),
    white: RGBA.fromHex(DEFAULT_COLORS.white),
  }
}

export function withAlpha(color: RGBA, alpha: number) {
  return RGBA.fromValues(color.r, color.g, color.b, alpha)
}
