import { RGBA, type KeyEvent } from "@opentui/core"
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/react"
import { useEffect, useState } from "react"
import { CommandLog } from "./components/command-log"
import { RepoList } from "./components/repo-list"
import { StatusBar } from "./components/status-bar"
import { match } from "./lib/keybinds"
import { theme } from "./lib/theme"

type Repo = {
  name: string
  url: string
}

type Status = "synced" | "modified" | "missing"

const placeholderRepos: Repo[] = [
  { name: "effect", url: "https://github.com/Effect-TS/Effect" },
  { name: "opentui", url: "https://github.com/Effect-TS/OpenTUI" },
]

const placeholderStatuses: Record<string, Status> = {
  effect: "synced",
  opentui: "modified",
}

export function App() {
  const renderer = useRenderer()
  const dimensions = useTerminalDimensions()

  const [repos, setRepos] = useState<Repo[]>(placeholderRepos)
  const [statuses, setStatuses] =
    useState<Record<string, Status>>(placeholderStatuses)
  const [view, setView] = useState<"list" | "add">("list")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingUrl, setEditingUrl] = useState("")

  const loadConfig = () => {
    setRepos([...placeholderRepos])
    setStatuses({ ...placeholderStatuses })
  }

  const handleAddRepo = (url: string) => {
    setView("list")

    const nameMatch = url.match(
      /(?:https:\/\/|git@)github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/,
    )
    if (!nameMatch || !nameMatch[2]) {
      console.error("Invalid GitHub URL")
      return
    }

    const name = nameMatch[2]

    const newRepo: Repo = { name, url }
    setRepos((prev) => [...prev, newRepo])
    setStatuses((prev) => ({ ...prev, [name]: "missing" }))
  }

  const handleSyncRepo = () => {
    const repo = repos[selectedIndex]
    if (!repo || !repo.name) return

    setStatuses((prev) => {
      const newStatuses = { ...prev }
      const currentStatus = newStatuses[repo.name]
      if (currentStatus === "missing") {
        newStatuses[repo.name] = "synced"
      } else if (currentStatus === "synced") {
        newStatuses[repo.name] = "modified"
      } else {
        newStatuses[repo.name] = "synced"
      }
      return newStatuses
    })
  }

  const handleSyncAll = () => {
    if (repos.length === 0) return

    setStatuses((prev) => {
      const newStatuses = { ...prev }
      for (const repo of repos) {
        if (!repo.name) continue
        const currentStatus = newStatuses[repo.name]
        if (currentStatus === "missing") {
          newStatuses[repo.name] = "synced"
        } else {
          newStatuses[repo.name] = "synced"
        }
      }
      return newStatuses
    })
  }

  const handleSelect = (index: number) => {
    setSelectedIndex(index)
  }

  const handleKeyboard = (event: KeyEvent) => {
    if (match(event, "toggle-console")) {
      renderer.console.toggle()
      return
    }

    if (match(event, "navigate-down")) {
      setSelectedIndex((prev) => Math.min(prev + 1, repos.length - 1))
      return
    }

    if (match(event, "navigate-up")) {
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
      return
    }

    if (match(event, "repo-add")) {
      setView("add")
      return
    }

    if (match(event, "repo-sync") && view === "list") {
      handleSyncRepo()
      return
    }

    if (match(event, "repo-sync-all") && view === "list") {
      handleSyncAll()
      return
    }

    if (match(event, "cancel") && view === "add") {
      setView("list")
      return
    }

    if (match(event, "quit")) {
      renderer.destroy()
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  useKeyboard(handleKeyboard)

  const bgColor = () => theme.bg[1] ?? RGBA.fromHex("#0f0f14")
  const isWide = () => dimensions.width >= 100

  const statusesMap = new Map(Object.entries(statuses))

  return (
    <>
      <box
        flexDirection={isWide() ? "row" : "column"}
        width="100%"
        height="100%"
        backgroundColor={bgColor()}
        paddingLeft={1}
        paddingRight={1}
        paddingTop={1}
        paddingBottom={1}
        gap={1}
      >
        <box
          flexDirection="column"
          flexGrow={isWide() ? 1 : 1}
          flexShrink={isWide() ? 1 : 1}
          flexBasis={0}
        >
          {view === "list" && (
            <RepoList
              repos={repos}
              statuses={statusesMap}
              selectedIndex={selectedIndex}
              editingIndex={editingIndex}
              editingUrl={editingUrl}
              onSelect={handleSelect}
              onEnter={handleSyncRepo}
              onStartAdd={() => {
                setEditingIndex(repos.length)
                setEditingUrl("")
                setView("list")
              }}
              onSaveEdit={(url: string) => handleAddRepo(url)}
              onCancelEdit={() => {
                setEditingIndex(null)
                setEditingUrl("")
              }}
            />
          )}
        </box>
        {isWide() && <CommandLog logs={[]} />}
      </box>
      {!isWide() && <StatusBar layout="horizontal" />}
    </>
  )
}
