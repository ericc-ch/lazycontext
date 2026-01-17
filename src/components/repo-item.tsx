import { useEffect } from "react"
import {
  TextAttributes,
  RGBA,
  type KeyEvent,
  type MouseEvent,
} from "@opentui/core"
import { useAppContext } from "@opentui/react"
import { make } from "@effect-atom/atom/Atom"
import { useAtom } from "@effect-atom/atom-react"
import type { RepoSchema } from "../services/config"
import { theme } from "../lib/theme"
import { parseGithubUrl } from "../lib/url"
import { Effect } from "effect"

interface PasteEvent {
  text: string
}

const RepoItemEditUrlAtom = make<string>("")
const RepoItemParseErrorAtom = make<string | null>(null)

const usePaste = (handler: (event: PasteEvent) => void) => {
  const { keyHandler } = useAppContext()

  useEffect(() => {
    if (!keyHandler) return
    keyHandler.on("paste", handler)
    return () => {
      keyHandler.off("paste", handler)
    }
  }, [keyHandler, handler])
}

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

export function RepoItem(props: RepoItemProps) {
  const [editUrl, setEditUrl] = useAtom(RepoItemEditUrlAtom)
  const [parseError, setParseError] = useAtom(RepoItemParseErrorAtom)

  const statusColor = () => {
    switch (props.status) {
      case "synced":
        return theme.success[6] ?? RGBA.fromHex("#22c55e")
      case "modified":
        return theme.warning[6] ?? RGBA.fromHex("#eab308")
      case "missing":
        return theme.error[6] ?? RGBA.fromHex("#ef4444")
      default:
        return theme.grays[5] ?? RGBA.fromHex("#888888")
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

  const handlePaste = (event: PasteEvent) => {
    if (!props.editing) return
    const pastedText = event.text
    setEditUrl(pastedText)
    Effect.runPromise(parseGithubUrl(pastedText))
      .then(() => setParseError(null))
      .catch(() => setParseError("Invalid GitHub URL"))
  }

  const handleInput = (value: string) => {
    setEditUrl(value)
    setParseError(null)
    if (value) {
      Effect.runPromise(parseGithubUrl(value)).catch(() =>
        setParseError("Invalid GitHub URL"),
      )
    }
  }

  const handleSubmit = () => {
    if (props.editing && editUrl.trim()) {
      Effect.runPromise(parseGithubUrl(editUrl))
        .then(() => props.onSave?.(editUrl))
        .catch(() => setParseError("Invalid GitHub URL"))
    }
  }

  const handleKeyDown = (event: KeyEvent) => {
    if (!props.editing) return
    if (event.name === "escape") {
      props.onCancel?.()
    } else if (event.name === "enter") {
      handleSubmit()
    }
  }

  useEffect(() => {
    if (props.editing) {
      setEditUrl(props.repo.url ?? "")
      if (props.repo.url) {
        Effect.runPromise(parseGithubUrl(props.repo.url)).catch(() =>
          setParseError("Invalid GitHub URL"),
        )
      }
    }
  }, [props.editing, props.repo.url])

  usePaste(handlePaste)

  return (
    <box
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
      backgroundColor={
        props.selected ?
          (theme.fg[3] ?? RGBA.fromHex("#334455"))
        : (theme.bg[2] ?? RGBA.fromHex("#1a1b26"))
      }
      onMouseDown={handleMouseDown}
    >
      {props.editing ?
        <box flexDirection="row" alignItems="center" gap={2}>
          <box width={2}>
            <text fg={theme.info[0] ?? RGBA.fromHex("#00AAFF")}>"+"</text>
          </box>
          <box flexGrow={1}>
            <input
              value={editUrl}
              onInput={handleInput}
              onSubmit={handleSubmit}
              placeholder="https://github.com/user/repo.git"
              focused
              style={{
                flexGrow: 1,
                backgroundColor: theme.bg[2] ?? RGBA.fromHex("#1a1b26"),
                cursorColor: theme.info[0] ?? RGBA.fromHex("#00AAFF"),
              }}
              onKeyDown={handleKeyDown}
            />
          </box>
          {parseError ?
            <text fg={theme.error[6] ?? RGBA.fromHex("#ef4444")}>
              {parseError}
            </text>
          : null}
        </box>
      : <box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <box flexDirection="row" alignItems="center" gap={2}>
            <box width={2}>
              <text
                fg={
                  props.selected ?
                    (theme.info[0] ?? RGBA.fromHex("#00AAFF"))
                  : (theme.grays[5] ?? RGBA.fromHex("#888888"))
                }
              >
                {props.selected ? ">" : " "}
              </text>
            </box>
            <text
              fg={theme.fg[0] ?? RGBA.fromHex("#FFFFFF")}
              attributes={TextAttributes.BOLD}
            >
              {props.repo.name}
            </text>
          </box>
          <box flexDirection="row" alignItems="center" gap={2}>
            <text fg={statusColor()}>{statusText()}</text>
            {props.lastUpdate ?
              <text fg={theme.fg[5] ?? RGBA.fromHex("#666666")}>
                {props.lastUpdate}
              </text>
            : null}
          </box>
        </box>
      }
    </box>
  )
}
