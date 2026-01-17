import { TextAttributes, RGBA } from "@opentui/core"
import { useTerminalDimensions } from "@opentui/react"
import { theme } from "../lib/theme"

export interface StatusBarProps {
  message?: string
  type?: "info" | "success" | "error"
  layout?: "horizontal" | "vertical"
}

export function StatusBar(props: StatusBarProps) {
  const { width, height } = useTerminalDimensions()
  const layout = props.layout ?? "horizontal"

  const getColor = () => {
    switch (props.type) {
      case "success":
        return theme.success[6]
      case "error":
        return theme.error[6]
      default:
        return theme.info[6]
    }
  }

  return (
    <box
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
      backgroundColor={theme.bg[2] ?? RGBA.fromHex("#1a1b26")}
      flexDirection={layout === "vertical" ? "column" : "row"}
      justifyContent="space-between"
      alignItems="flex-start"
      gap={layout === "vertical" ? 1 : 0}
    >
      {props.message ?
        <box flexDirection="row" alignItems="center" gap={1}>
          <text
            fg={theme.fg[5] ?? RGBA.fromHex("#666666")}
            attributes={TextAttributes.DIM}
          >
            Status
          </text>
          <text fg={getColor() ?? RGBA.fromHex("#888888")}>
            {props.message || "Ready"}
          </text>
        </box>
      : null}
      <box flexDirection="row" alignItems="center" gap={1}>
        <text
          fg={theme.fg[5] ?? RGBA.fromHex("#666666")}
          attributes={TextAttributes.DIM}
        >
          lazycontext v0.1.0
          {width}x{height}
        </text>
      </box>
    </box>
  )
}
