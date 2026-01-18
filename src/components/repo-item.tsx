import { useState, useEffect, useCallback } from "react"
import {
  TextAttributes,
  RGBA,
  type KeyEvent,
  type MouseEvent,
} from "@opentui/core"
import { useAppContext } from "@opentui/react"
import type { RepoSchema } from "../services/config"
import { theme } from "../lib/theme"

interface PasteEvent {
  text: string
}

const GITHUB_URL_REGEX = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\.git$/

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
  const [editUrl, setEditUrl] = useState(props.repo.url ?? "")
  const [parseError, setParseError] = useState<string | null>(null)

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

  const handlePaste = useCallback(
    (event: PasteEvent) => {
      if (!props.editing) return
      const pastedText = event.text
      setEditUrl(pastedText)
      if (GITHUB_URL_REGEX.test(pastedText)) {
        setParseError(null)
      } else {
        setParseError("Invalid GitHub URL")
      }
    },
    [props.editing],
  )

  const handleInput = useCallback((value: string) => {
    setEditUrl(value)
    setParseError(null)
    if (value && !GITHUB_URL_REGEX.test(value)) {
      setParseError("Invalid GitHub URL")
    }
  }, [])

  const handleSubmit = useCallback(() => {
    if (props.editing && editUrl.trim()) {
      if (GITHUB_URL_REGEX.test(editUrl)) {
        props.onSave?.(editUrl)
      } else {
        setParseError("Invalid GitHub URL")
      }
    }
  }, [props.editing, editUrl, props])

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
      if (props.repo.url && !GITHUB_URL_REGEX.test(props.repo.url)) {
        setParseError("Invalid GitHub URL")
      } else {
        setParseError(null)
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
