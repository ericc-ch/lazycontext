import { TextAttributes, RGBA } from "@opentui/core"
import { theme } from "../lib/theme"
import { RepoItem } from "./repo-item"

export interface RepoListProps {
  repos: string[]
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
  const totalCount = props.repos.length
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

  const counts = statusCounts()
  const syncedCount = counts.synced
  const missingCount = counts.missing

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      backgroundColor={theme.bg[2] ?? RGBA.fromHex("#1a1b26")}
    >
      <box
        paddingLeft={1}
        paddingRight={1}
        paddingTop={1}
        paddingBottom={1}
        backgroundColor={theme.bg[1] ?? RGBA.fromHex("#0f0f14")}
        flexDirection="row"
        justifyContent="space-between"
      >
        <text
          fg={theme.info[0] ?? RGBA.fromHex("#00AAFF")}
          attributes={TextAttributes.BOLD}
        >
          Repositories
        </text>
        <text fg={theme.grays[5] ?? RGBA.fromHex("#888888")}>
          {syncedCount}/{totalCount} synced
          {missingCount > 0 && (
            <text fg={theme.error[6] ?? RGBA.fromHex("#ef4444")}>
              {" "}
              ({missingCount} missing)
            </text>
          )}
        </text>
      </box>

      <box flexDirection="column" flexGrow={1}>
        {props.repos.length > 0 || props.editingIndex !== null ?
          <>
            {props.repos.map((url, index) => (
              <RepoItem
                url={url}
                status={props.statuses.get(url) ?? "missing"}
                selected={index === props.selectedIndex}
                onClick={() => props.onSelect(index)}
              />
            ))}
            {props.editingIndex !== null ?
              <RepoItem
                url={props.editingUrl}
                status="missing"
                selected={true}
                editing={true}
                onSave={props.onSaveEdit ?? (() => {})}
                onCancel={props.onCancelEdit ?? (() => {})}
              />
            : null}
          </>
        : <box
            flexGrow={1}
            justifyContent="center"
            alignItems="center"
            paddingTop={2}
            paddingBottom={2}
          >
            <text fg={theme.fg[5] ?? RGBA.fromHex("#666666")}>
              No repositories
            </text>
          </box>
        }
      </box>

      <box
        paddingLeft={1}
        paddingRight={1}
        paddingTop={1}
        paddingBottom={1}
        backgroundColor={theme.bg[3] ?? RGBA.fromHex("#252530")}
        flexDirection="row"
        gap={2}
      >
        <text
          fg={theme.fg[5] ?? RGBA.fromHex("#666666")}
          attributes={TextAttributes.DIM}
        >
          navigate
        </text>
        <text
          fg={theme.fg[5] ?? RGBA.fromHex("#666666")}
          attributes={TextAttributes.DIM}
        >
          |
        </text>
        <text
          fg={theme.fg[5] ?? RGBA.fromHex("#666666")}
          attributes={TextAttributes.DIM}
        >
          Enter sync
        </text>
        <text
          fg={theme.fg[5] ?? RGBA.fromHex("#666666")}
          attributes={TextAttributes.DIM}
        >
          |
        </text>
        <text
          fg={theme.fg[5] ?? RGBA.fromHex("#666666")}
          attributes={TextAttributes.DIM}
        >
          a add repo
        </text>
      </box>
    </box>
  )
}
