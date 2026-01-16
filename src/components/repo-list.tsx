import { For, Show } from "solid-js"
import { TextAttributes, type MouseEvent, RGBA } from "@opentui/core"
import { RepoSchema } from "../services/config"
import { useTheme } from "./provider-theme"
import { RepoItem } from "./repo-item"

export interface RepoItemProps {
  repo: RepoSchema
  status: "synced" | "modified" | "missing"
  lastUpdate?: string
  selected?: boolean
  editing?: boolean
  onClick?: () => void
  onSave?: (url: string) => void
  onCancel?: () => void
}

export function RepoItemComponent(props: RepoItemProps) {
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
    if (!props.editing) {
      props.onClick?.()
    }
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
      <Show
        when={props.editing}
        fallback={
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
        }
      >
        <box flexDirection="row" alignItems="center" gap={2}>
          <box width={2}>
            <text fg={theme()?.info[0] ?? RGBA.fromHex("#00AAFF")}>+</text>
          </box>
          <input
            value={props.repo.url ?? ""}
            onInput={(value) => props.onSave?.(value)}
            placeholder="https://github.com/user/repo.git"
            focused
            style={{
              flexGrow: 1,
              backgroundColor: theme()?.bg[2] ?? RGBA.fromHex("#1a1b26"),
              cursorColor: theme()?.info[0] ?? RGBA.fromHex("#00AAFF"),
            }}
          />
        </box>
      </Show>
    </box>
  )
}

export interface RepoListProps {
  repos: RepoSchema[]
  statuses: Map<string, "synced" | "modified" | "missing">
  selectedIndex: number
  editingIndex: number | null
  editingUrl: string
  onSelect: (index: number) => void
  onEnter?: () => void
  onStartAdd?: () => void
  onSaveEdit?: (url: string) => void
  onCancelEdit?: () => void
}

export function RepoList(props: RepoListProps) {
  const theme = useTheme()

  const totalCount = () => props.repos.length
  const syncedCount = () =>
    Array.from(props.statuses.values()).filter((s) => s === "synced").length
  const missingCount = () =>
    Array.from(props.statuses.values()).filter((s) => s === "missing").length

  const editingRepo = () =>
    props.editingIndex !== null ?
      new RepoSchema({ url: props.editingUrl, name: undefined })
    : null

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      backgroundColor={theme()?.bg[2] ?? RGBA.fromHex("#1a1b26")}
    >
      <box
        paddingLeft={1}
        paddingRight={1}
        paddingTop={1}
        paddingBottom={1}
        backgroundColor={theme()?.bg[1] ?? RGBA.fromHex("#0f0f14")}
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
          when={props.repos.length > 0 || props.editingIndex !== null}
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
          <Show when={editingRepo() !== null}>
            <RepoItem
              repo={editingRepo()!}
              status="missing"
              selected={true}
              editing={true}
              onSave={props.onSaveEdit ?? (() => {})}
              onCancel={props.onCancelEdit ?? (() => {})}
            />
          </Show>
        </Show>
      </box>

      <box
        paddingLeft={1}
        paddingRight={1}
        paddingTop={1}
        paddingBottom={1}
        backgroundColor={theme()?.bg[3] ?? RGBA.fromHex("#252530")}
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
