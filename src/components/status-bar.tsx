import { TextAttributes, RGBA } from "@opentui/core"
import { useTheme } from "./provider-theme"
import { useTerminalDimensions } from "@opentui/solid"

export interface StatusBarProps {
  message: string
  type?: "info" | "success" | "error"
}

export function StatusBar(props: StatusBarProps) {
  const theme = useTheme()
  const dimensions = useTerminalDimensions()

  const getColor = () => {
    switch (props.type) {
      case "success":
        return theme()?.success[6]
      case "error":
        return theme()?.error[6]
      default:
        return theme()?.info[6]
    }
  }

  return (
    <box
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
      backgroundColor={theme()?.bg[2] ?? RGBA.fromHex("#1a1b26")}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      border
      borderColor={theme()?.fg[3] ?? RGBA.fromHex("#334455")}
      borderStyle="single"
    >
      <box flexDirection="row" alignItems="center" gap={1}>
        <text
          fg={theme()?.fg[5] ?? RGBA.fromHex("#666666")}
          attributes={TextAttributes.DIM}
        >
          Status
        </text>
        <text fg={getColor() ?? RGBA.fromHex("#888888")}>
          {props.message || "Ready"}
        </text>
      </box>
      <box flexDirection="row" alignItems="center" gap={1}>
        <text
          fg={theme()?.fg[5] ?? RGBA.fromHex("#666666")}
          attributes={TextAttributes.DIM}
        >
          lazycontext v0.1.0
          {dimensions().width}x{dimensions().height}
        </text>
      </box>
    </box>
  )
}
