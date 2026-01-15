import { TextAttributes } from "@opentui/core"

export interface StatusBarProps {
  message: string
  type?: "info" | "success" | "error"
}

export function StatusBar(props: StatusBarProps) {
  const getColor = () => {
    switch (props.type) {
      case "success":
        return "#22c55e"
      case "error":
        return "#ef4444"
      default:
        return "#888888"
    }
  }

  return (
    <box
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
      backgroundColor="#1a1b26"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      border
      borderColor="#334455"
      borderStyle="single"
    >
      <box flexDirection="row" alignItems="center" gap={1}>
        <text fg="#666666" attributes={TextAttributes.DIM}>
          Status
        </text>
        <text fg={getColor()}>{props.message || "Ready"}</text>
      </box>
      <box flexDirection="row" alignItems="center" gap={1}>
        <text fg="#666666" attributes={TextAttributes.DIM}>
          lazycontext v0.1.0
        </text>
      </box>
    </box>
  )
}
