import { For, Show } from "solid-js"
import { TextAttributes, type MouseEvent, RGBA } from "@opentui/core"
import type { RepoSchema } from "../services/config"
import { useTheme } from "./provider-theme"

export interface RepoItemProps {
  repo: RepoSchema
  status: "synced" | "modified" | "missing"
  lastUpdate?: string
  selected?: boolean
  onClick?: () => void
}

export function RepoItem(props: RepoItemProps) {
  const theme = useTheme()

  const statusColor = () => {
    switch (props.status) {
      case "synced":
        return theme()?.success[6] ?? RGBA.fromHex("#22c55e")
      case "modified":
        return theme()?.warning[6] ?? RGBA.fromHex("#eab308")
      case "missing":
        return theme()?.error[6] ?? RGBA.fromHex("#ef4444")
      default:
        return theme()?.grays[5] ?? RGBA.fromHex("#888888")
    }
  }

  const statusText = () => {
    switch (props.status) {
      case "synced":
        return "synced"
      case "modified":
        return "modified"
      case "missing":
        return "missing"
      default:
        return "unknown"
    }
  }

  const handleMouseDown = (_event: MouseEvent) => {
    props.onClick?.()
  }

  return (
    <box
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
      backgroundColor={
        props.selected ?
          (theme()?.fg[3] ?? RGBA.fromHex("#334455"))
        : (theme()?.bg[2] ?? RGBA.fromHex("#1a1b26"))
      }
      onMouseDown={handleMouseDown}
    >
      <box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <box flexDirection="row" alignItems="center" gap={2}>
          <box width={2}>
            <text
              fg={
                props.selected ?
                  (theme()?.info[0] ?? RGBA.fromHex("#00AAFF"))
                : (theme()?.grays[5] ?? RGBA.fromHex("#888888"))
              }
            >
              {props.selected ? ">" : " "}
            </text>
          </box>
          <text
            fg={theme()?.fg[0] ?? RGBA.fromHex("#FFFFFF")}
            attributes={TextAttributes.BOLD}
          >
            {props.repo.name}
          </text>
        </box>
        <box flexDirection="row" alignItems="center" gap={2}>
          <text fg={statusColor()}>{statusText()}</text>
          <Show when={props.lastUpdate}>
            <text fg={theme()?.fg[5] ?? RGBA.fromHex("#666666")}>
              {props.lastUpdate}
            </text>
          </Show>
        </box>
      </box>
    </box>
  )
}

export interface RepoListProps {
  repos: RepoSchema[]
  statuses: Map<string, "synced" | "modified" | "missing">
  selectedIndex: number
  onSelect: (index: number) => void
  onEnter?: () => void
}

export function RepoList(props: RepoListProps) {
  const theme = useTheme()

  const totalCount = () => props.repos.length
  const syncedCount = () =>
    Array.from(props.statuses.values()).filter((s) => s === "synced").length
  const missingCount = () =>
    Array.from(props.statuses.values()).filter((s) => s === "missing").length

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      border
      borderColor={theme()?.fg[3] ?? RGBA.fromHex("#334455")}
      borderStyle="single"
    >
      <box
        paddingLeft={1}
        paddingRight={1}
        paddingTop={1}
        paddingBottom={1}
        backgroundColor={theme()?.bg[2] ?? RGBA.fromHex("#1a1b26")}
        flexDirection="row"
        justifyContent="space-between"
      >
        <text
          fg={theme()?.info[0] ?? RGBA.fromHex("#00AAFF")}
          attributes={TextAttributes.BOLD}
        >
          Repositories
        </text>
        <text fg={theme()?.grays[5] ?? RGBA.fromHex("#888888")}>
          {syncedCount()}/{totalCount()} synced
          {missingCount() > 0 && (
            <text fg={theme()?.error[6] ?? RGBA.fromHex("#ef4444")}>
              {" "}
              ({missingCount()} missing)
            </text>
          )}
        </text>
      </box>

      <box flexDirection="column" flexGrow={1}>
        <Show
          when={props.repos.length > 0}
          fallback={
            <box
              flexGrow={1}
              justifyContent="center"
              alignItems="center"
              paddingTop={2}
              paddingBottom={2}
            >
              <text fg={theme()?.fg[5] ?? RGBA.fromHex("#666666")}>
                No repositories
              </text>
            </box>
          }
        >
          <For each={props.repos}>
            {(repo, index) => (
              <RepoItem
                repo={repo}
                status={props.statuses.get(repo.name ?? "") ?? "missing"}
                selected={index() === props.selectedIndex}
                onClick={() => props.onSelect(index())}
              />
            )}
          </For>
        </Show>
      </box>

      <box
        paddingLeft={1}
        paddingRight={1}
        paddingTop={1}
        paddingBottom={1}
        backgroundColor={theme()?.bg[2] ?? RGBA.fromHex("#1a1b26")}
        flexDirection="row"
        gap={2}
      >
        <text
          fg={theme()?.fg[5] ?? RGBA.fromHex("#666666")}
          attributes={TextAttributes.DIM}
        >
          navigate
        </text>
        <text
          fg={theme()?.fg[5] ?? RGBA.fromHex("#666666")}
          attributes={TextAttributes.DIM}
        >
          |
        </text>
        <text
          fg={theme()?.fg[5] ?? RGBA.fromHex("#666666")}
          attributes={TextAttributes.DIM}
        >
          Enter sync
        </text>
        <text
          fg={theme()?.fg[5] ?? RGBA.fromHex("#666666")}
          attributes={TextAttributes.DIM}
        >
          |
        </text>
        <text
          fg={theme()?.fg[5] ?? RGBA.fromHex("#666666")}
          attributes={TextAttributes.DIM}
        >
          a add repo
        </text>
      </box>
    </box>
  )
}
