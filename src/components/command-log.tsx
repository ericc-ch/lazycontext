import { For } from "solid-js"
import { TextAttributes, RGBA } from "@opentui/core"
import { useTheme } from "./provider-theme"
import type { LogEntry } from "../services/logger"

export interface CommandLogProps {
  logs: LogEntry[]
}

export function CommandLog(props: CommandLogProps) {
  const theme = useTheme()

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return theme()?.success[6] ?? RGBA.fromHex("#4ade80")
      case "error":
        return theme()?.error[6] ?? RGBA.fromHex("#f87171")
      case "command":
        return theme()?.primary[6] ?? RGBA.fromHex("#60a5fa")
      default:
        return theme()?.fg[4] ?? RGBA.fromHex("#a1a1aa")
    }
  }

  const getTypeLabel = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "OK"
      case "error":
        return "ERR"
      case "command":
        return "CMD"
      default:
        return "INF"
    }
  }

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      flexShrink={1}
      backgroundColor={theme()?.bg[2] ?? RGBA.fromHex("#1a1b26")}
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
    >
      <box flexDirection="row" alignItems="center" gap={1} paddingBottom={1}>
        <text
          fg={theme()?.fg[5] ?? RGBA.fromHex("#71717a")}
          attributes={TextAttributes.DIM}
        >
          Command Log
        </text>
        <text
          fg={theme()?.fg[5] ?? RGBA.fromHex("#71717a")}
          attributes={TextAttributes.DIM}
        >
          {props.logs.length} entries
        </text>
      </box>

      <box flexDirection="column" flexGrow={1} flexShrink={1} gap={0}>
        <For
          each={props.logs}
          fallback={
            <text
              fg={theme()?.fg[5] ?? RGBA.fromHex("#71717a")}
              attributes={TextAttributes.DIM}
            >
              No logs yet
            </text>
          }
        >
          {(entry) => (
            <box flexDirection="column" paddingTop={0} paddingBottom={0}>
              <box flexDirection="row" alignItems="center" gap={1}>
                <text
                  fg={theme()?.fg[5] ?? RGBA.fromHex("#71717a")}
                  attributes={TextAttributes.DIM}
                  style={{ width: 8 }}
                >
                  {formatTime(entry.timestamp)}
                </text>
                <text fg={getTypeColor(entry.type)} style={{ width: 3 }}>
                  {getTypeLabel(entry.type)}
                </text>
                <text fg={theme()?.fg[3] ?? RGBA.fromHex("#a1a1aa")}>
                  {entry.message}
                </text>
              </box>
              {entry.details && (
                <box paddingLeft={12} flexDirection="column">
                  <text
                    fg={theme()?.fg[5] ?? RGBA.fromHex("#71717a")}
                    attributes={TextAttributes.DIM}
                  >
                    {entry.details}
                  </text>
                </box>
              )}
            </box>
          )}
        </For>
      </box>
    </box>
  )
}
