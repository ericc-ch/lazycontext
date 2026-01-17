import { For, Show } from "solid-js"
import { TextAttributes, RGBA } from "@opentui/core"
import { RepoSchema } from "../services/config"
import { useTheme } from "./provider-theme"
import { RepoItem } from "./repo-item"

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
  const statusCounts = () => {
    const values = Array.from(props.statuses.values())
    let synced = 0
    let missing = 0
    for (const s of values) {
      if (s === "synced") synced++
      else if (s === "missing") missing++
    }
    return { synced, missing }
  }

  const syncedCount = () => statusCounts().synced
  const missingCount = () => statusCounts().missing

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
