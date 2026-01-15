import { For, Show } from "solid-js"
import { TextAttributes, type MouseEvent } from "@opentui/core"
import type { Repo } from "../services/config"

export interface RepoItemProps {
  repo: Repo
  status: "synced" | "modified" | "missing"
  lastUpdate?: string
  selected?: boolean
  onClick?: () => void
}

export function RepoItem(props: RepoItemProps) {
  const statusColor = () => {
    switch (props.status) {
      case "synced":
        return "#22c55e"
      case "modified":
        return "#eab308"
      case "missing":
        return "#ef4444"
      default:
        return "#888888"
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
      backgroundColor={props.selected ? "#334455" : "#1a1b26"}
      onMouseDown={handleMouseDown}
    >
      <box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <box flexDirection="row" alignItems="center" gap={2}>
          <box width={2}>
            <text fg={props.selected ? "#00AAFF" : "#888888"}>
              {props.selected ? ">" : " "}
            </text>
          </box>
          <text fg="#FFFFFF" attributes={TextAttributes.BOLD}>
            {props.repo.name}
          </text>
        </box>
        <box flexDirection="row" alignItems="center" gap={2}>
          <text fg={statusColor()}>{statusText()}</text>
          <Show when={props.lastUpdate}>
            <text fg="#666666">{props.lastUpdate}</text>
          </Show>
        </box>
      </box>
    </box>
  )
}

export interface RepoListProps {
  repos: Repo[]
  statuses: Map<string, "synced" | "modified" | "missing">
  selectedIndex: number
  onSelect: (index: number) => void
  onEnter?: () => void
}

export function RepoList(props: RepoListProps) {
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
      borderColor="#334455"
      borderStyle="single"
    >
      <box
        paddingLeft={1}
        paddingRight={1}
        paddingTop={1}
        paddingBottom={1}
        backgroundColor="#1a1b26"
        flexDirection="row"
        justifyContent="space-between"
      >
        <text fg="#00AAFF" attributes={TextAttributes.BOLD}>
          Repositories
        </text>
        <text fg="#888888">
          {syncedCount()}/{totalCount()} synced
          {missingCount() > 0 && (
            <text fg="#ef4444"> ({missingCount()} missing)</text>
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
              <text fg="#666666">No repositories</text>
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
        backgroundColor="#1a1b26"
        flexDirection="row"
        gap={2}
      >
        <text fg="#666666" attributes={TextAttributes.DIM}>
          navigate
        </text>
        <text fg="#666666" attributes={TextAttributes.DIM}>
          |
        </text>
        <text fg="#666666" attributes={TextAttributes.DIM}>
          Enter sync
        </text>
        <text fg="#666666" attributes={TextAttributes.DIM}>
          |
        </text>
        <text fg="#666666" attributes={TextAttributes.DIM}>
          a add repo
        </text>
      </box>
    </box>
  )
}
