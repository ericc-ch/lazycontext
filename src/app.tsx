import { RGBA, type KeyEvent } from "@opentui/core"
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/react"
import { useAtom } from "@effect-atom/atom-react"
import { useEffect } from "react"
import { theme } from "./lib/theme"
import { CommandLog } from "./components/command-log"
import { RepoList } from "./components/repo-list"
import { StatusBar } from "./components/status-bar"
import { match } from "./lib/keybinds"
import { runtime } from "./runtime"
import { Config } from "./services/config"
import { Git } from "./services/git"
import {
  reposAtom,
  statusesAtom,
  viewAtom,
  selectedIndexAtom,
  editingIndexAtom,
  editingUrlAtom,
  type Status,
} from "./state/atoms"

const targetDir = ".context"

export function App() {
  const renderer = useRenderer()
  const dimensions = useTerminalDimensions()

  const [repos, setRepos] = useAtom(reposAtom)
  const [statuses, setStatuses] = useAtom(statusesAtom)
  const [view, setView] = useAtom(viewAtom)
  const [selectedIndex, setSelectedIndex] = useAtom(selectedIndexAtom)
  const [editingIndex, setEditingIndex] = useAtom(editingIndexAtom)
  const [editingUrl, setEditingUrl] = useAtom(editingUrlAtom)

  const loadConfig = async () => {
    try {
      const config = await runtime.runPromise(Config.load())
      setRepos([...config.repos])
      await checkAllStatuses()
    } catch (error: unknown) {
      console.error(
        "Failed to load config",
        error instanceof Error ? error.message : "Unknown error",
      )
    }
  }

  const checkAllStatuses = async () => {
    const currentRepos = repos
    const statusesMap = new Map<string, Status>()

    for (const repo of currentRepos) {
      if (!repo.name) continue
      try {
        const status = await runtime.runPromise(
          Git.checkStatus(repo, targetDir),
        )
        statusesMap.set(repo.name, status)
      } catch (error: unknown) {
        console.error(
          `Failed to check status for ${repo.name}`,
          error instanceof Error ? error.message : "Unknown error",
        )
        statusesMap.set(repo.name, "missing")
      }
    }

    setStatuses(statusesMap)
  }

  const handleAddRepo = async (url: string) => {
    setView("list")

    try {
      const config = await runtime.runPromise(Config.addRepo(url))

      setRepos([...config.repos])

      const newRepo = config.repos.find((r) => r.url === url)
      if (newRepo && newRepo.name) {
        await runtime.runPromise(Git.clone(newRepo, targetDir))

        const status = await runtime.runPromise(
          Git.checkStatus(newRepo, targetDir),
        )

        setStatuses((prev) => {
          const newStatuses = new Map(prev)
          newStatuses.set(newRepo.name!, status)
          return newStatuses
        })
      }
    } catch (error: unknown) {
      console.error(
        "Failed to add repository",
        error instanceof Error ? error.message : "Unknown error",
      )
    }
  }

  const handleSyncRepo = async () => {
    const repo = repos[selectedIndex]
    if (!repo || !repo.name) return

    try {
      const statusesMap = new Map(statuses)
      const currentStatus = statusesMap.get(repo.name)

      if (currentStatus === "missing") {
        await runtime.runPromise(Git.clone(repo, targetDir))
      } else {
        await runtime.runPromise(Git.pull(repo, targetDir))
      }

      const newStatus = await runtime.runPromise(
        Git.checkStatus(repo, targetDir),
      )

      statusesMap.set(repo.name, newStatus)
      setStatuses(statusesMap)
    } catch (error: unknown) {
      console.error(
        `Failed to sync ${repo.name}`,
        error instanceof Error ? error.message : "Unknown error",
      )
    }
  }

  const handleSyncAll = async () => {
    if (repos.length === 0) return

    try {
      const statusesMap = new Map(statuses)
      let syncedCount = 0
      let failedCount = 0

      for (const repo of repos) {
        if (!repo.name) continue

        try {
          const currentStatus = statusesMap.get(repo.name)

          if (currentStatus === "missing") {
            await runtime.runPromise(Git.clone(repo, targetDir))
          } else {
            await runtime.runPromise(Git.pull(repo, targetDir))
          }

          const newStatus = await runtime.runPromise(
            Git.checkStatus(repo, targetDir),
          )
          statusesMap.set(repo.name, newStatus)
          syncedCount++
        } catch (error: unknown) {
          console.error(
            `Failed to sync ${repo.name}`,
            error instanceof Error ? error.message : "Unknown error",
          )
          statusesMap.set(repo.name, "missing")
          failedCount++
        }
      }

      setStatuses(statusesMap)

      if (syncedCount > 0 || failedCount > 0) {
        console.log(
          `Sync complete: ${syncedCount} synced, ${failedCount} failed`,
        )
      }
    } catch (error: unknown) {
      console.error(
        "Failed to sync repositories",
        error instanceof Error ? error.message : "Unknown error",
      )
    }
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
      void handleSyncRepo()
      return
    }

    if (match(event, "repo-sync-all") && view === "list") {
      void handleSyncAll()
      return
    }

    if (match(event, "cancel") && view === "add") {
      setView("list")
      return
    }

    if (match(event, "quit")) {
      process.exit(0)
    }
  }

  useEffect(() => {
    void loadConfig()
  }, [])

  useKeyboard(handleKeyboard)

  const bgColor = () => theme.bg[1] ?? RGBA.fromHex("#0f0f14")
  const isWide = () => dimensions.width >= 100

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
              statuses={statuses}
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
