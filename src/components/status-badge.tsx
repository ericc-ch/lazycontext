import { RGBA } from "@opentui/core"
import { useTheme, type Theme } from "./provider-theme"
import type { RepoStatus } from "../services/git"

export type RepoStatusString = "up to date" | "behind" | "missing" | "modified"

export type UiStatus = "loading" | "syncing" | "error"

export type StatusBadgeProps = {
  status: RepoStatusString | UiStatus | RepoStatus
  syncType: "clone" | "pull" | null
  commitCount?: number | undefined
}

type StatusConfig = {
  color: (theme: Theme) => RGBA
  icon: string
  text: (syncType: "clone" | "pull" | null, commitCount?: number) => string
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  "up to date": {
    color: (theme) => theme.success[0] ?? RGBA.fromHex("#00ff00"),
    icon: "✓",
    text: () => "up to date",
  },
  behind: {
    color: (theme) => theme.warning[0] ?? RGBA.fromHex("#ffff00"),
    icon: "…",
    text: (_, commitCount) => `${commitCount} behind`,
  },
  missing: {
    color: (theme) => theme.error[0] ?? RGBA.fromHex("#ff0000"),
    icon: "✗",
    text: () => "missing",
  },
  modified: {
    color: (theme) => theme.warning[0] ?? RGBA.fromHex("#ffff00"),
    icon: "…",
    text: () => "modified",
  },
  loading: {
    color: (theme) => theme.grays[0] ?? RGBA.fromHex("#888888"),
    icon: "◐",
    text: () => "loading...",
  },
  syncing: {
    color: (theme) => theme.info[0] ?? RGBA.fromHex("#00AAFF"),
    icon: "◐",
    text: (syncType) => (syncType === "clone" ? "Cloning..." : "Pulling..."),
  },
  error: {
    color: (theme) => theme.error[0] ?? RGBA.fromHex("#ff0000"),
    icon: "!",
    text: () => "error",
  },
}

const DEFAULT_STATUS_CONFIG: StatusConfig = {
  color: (theme) => theme.grays[0] ?? RGBA.fromHex("#888888"),
  icon: "?",
  text: () => "unknown",
}

function getStatusString(
  status: RepoStatusString | UiStatus | RepoStatus,
): string {
  if (typeof status === "string") {
    return status
  }
  return status.state
}

export function StatusBadge(props: StatusBadgeProps) {
  const theme = useTheme()

  const statusString = getStatusString(props.status)

  const config = (() => {
    const cfg = STATUS_CONFIGS[statusString]
    if (cfg) return cfg
    return DEFAULT_STATUS_CONFIG
  })()

  const statusColor = config.color(theme)
  const statusIcon = config.icon
  const statusText = config.text(props.syncType, props.commitCount)

  return (
    <box
      backgroundColor={statusColor}
      paddingLeft={1}
      paddingRight={1}
      flexDirection="row"
      alignItems="center"
      marginLeft={1}
    >
      <text>{statusText}</text>
      <text paddingLeft={1}>{statusIcon}</text>
    </box>
  )
}
