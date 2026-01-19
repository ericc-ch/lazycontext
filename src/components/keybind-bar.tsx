import { RGBA, TextAttributes } from "@opentui/core"
import { useTheme } from "./provider-theme"

export function KeybindBar() {
  const theme = useTheme()
  const dimColor = theme.grays[1] ?? RGBA.fromHex("#999999")
  const accentColor = theme.primary[0] ?? RGBA.fromHex("#00ffff")

  const keybinds = [
    { keys: ["↑", "↓"], action: "Navigate", color: dimColor },
    { keys: ["Enter"], action: "Sync", color: accentColor },
    { keys: ["A"], action: "Sync All", color: dimColor },
    { keys: ["Q"], action: "Quit", color: dimColor },
  ]

  return (
    <box flexDirection="row" alignItems="center" gap={1}>
      {keybinds.map((kb, index) => (
        <box key={index} flexDirection="row" alignItems="center" gap={1}>
          {index > 0 && (
            <text fg={theme.grays[2] ?? RGBA.fromHex("#666666")}>•</text>
          )}
          <box flexDirection="row" gap={0}>
            {kb.keys.map((key, keyIndex) => (
              <text
                key={keyIndex}
                fg={kb.color}
                attributes={TextAttributes.BOLD}
              >
                {key}
              </text>
            ))}
          </box>
          <text fg={theme.grays[1] ?? RGBA.fromHex("#999999")}>
            {kb.action}
          </text>
        </box>
      ))}
    </box>
  )
}
