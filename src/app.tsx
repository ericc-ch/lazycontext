import { RGBA, type KeyEvent } from "@opentui/core"
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/react"
import { useEffect, useState } from "react"
import { CommandLog } from "./components/command-log"
import { RepoList } from "./components/repo-list"
import { StatusBar } from "./components/status-bar"
import { match } from "./lib/keybinds"
import { theme } from "./lib/theme"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { useRuntime } from "./components/provider-runtime"
import { Effect } from "effect"
import { Config } from "./services/config"

type Status = "synced" | "modified" | "missing"

const placeholderRepos: string[] = [
  "https://github.com/Effect-TS/Effect",
  "https://github.com/Effect-TS/OpenTUI",
]

const placeholderStatuses: Record<string, Status> = {
  "https://github.com/Effect-TS/Effect": "synced",
  "https://github.com/Effect-TS/OpenTUI": "modified",
}

export function App() {
  const renderer = useRenderer()
  const dimensions = useTerminalDimensions()
  const runtime = useRuntime()

  const reposQuery = queryOptions({
    queryKey: ["repos"] as const,
    queryFn: async () =>
      runtime.runPromise(
        Effect.gen(function* () {
          const configService = yield* Config
          const config = yield* configService.load
          return config.repos
        }),
      ),
  })

  const repos = useQuery(reposQuery)

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

    setRepos((prev) => [...prev, url])
    setStatuses((prev) => ({ ...prev, [url]: "missing" }))
  }

  const handleSyncRepo = () => {
    const url = repos[selectedIndex]
    if (!url) return

    setStatuses((prev) => {
      const newStatuses = { ...prev }
      const currentStatus = newStatuses[url]
      if (currentStatus === "missing") {
        newStatuses[url] = "synced"
      } else if (currentStatus === "synced") {
        newStatuses[url] = "modified"
      } else {
        newStatuses[url] = "synced"
      }
      return newStatuses
    })
  }

  const handleSyncAll = () => {
    if (repos.length === 0) return

    setStatuses((prev) => {
      const newStatuses = { ...prev }
      for (const url of repos) {
        newStatuses[url] = "synced"
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
