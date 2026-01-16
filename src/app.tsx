import { RGBA, type KeyEvent } from "@opentui/core"
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/solid"
import { createSignal, onMount, Show } from "solid-js"
import { AddRepo } from "./components/add-repo"
import { ThemeProvider, useTheme } from "./components/provider-theme"
import { RepoList } from "./components/repo-list"
import { StatusBar } from "./components/status-bar"
import { match } from "./lib/keybinds"
import { runtime } from "./runtime"
import { Config, type RepoSchema } from "./services/config"
import { Git } from "./services/git"

type View = "list" | "add"

interface AppState {
  repos: RepoSchema[]
  statuses: Map<string, "synced" | "modified" | "missing">
  selectedIndex: number
  view: View
  message: string
  messageType: "info" | "success" | "error"
}

export function App() {
  const renderer = useRenderer()
  const theme = useTheme()
  const dimensions = useTerminalDimensions()

  const [state, setState] = createSignal<AppState>({
    repos: [],
    statuses: new Map(),
    selectedIndex: 0,
    view: "list",
    message: "Loading...",
    messageType: "info",
  })

  const targetDir = ".context"

  const loadConfig = async () => {
    try {
      const config = await runtime.runPromise(Config.load())
      setState((prev) => ({
        ...prev,
        repos: [...config.repos],
        message: "Ready",
      }))
      await checkAllStatuses()
    } catch (error) {
      setState((prev) => ({
        ...prev,
        message:
          error instanceof Error ? error.message : "Failed to load config",
        messageType: "error",
      }))
    }
  }

  const checkAllStatuses = async () => {
    const currentState = state()
    const statuses = new Map<string, "synced" | "modified" | "missing">()

    for (const repo of currentState.repos) {
      if (!repo.name) continue
      try {
        const status = await runtime.runPromise(
          Git.checkStatus(repo, targetDir),
        )
        statuses.set(repo.name, status)
      } catch {
        statuses.set(repo.name, "missing")
      }
    }

    setState((prev) => ({ ...prev, statuses }))
  }

  const handleAddRepo = async (url: string) => {
    setState((prev) => ({
      ...prev,
      view: "list",
      message: "Adding repository...",
      messageType: "info",
    }))

    try {
      const config = await runtime.runPromise(Config.addRepo(url))

      setState((prev) => ({
        ...prev,
        repos: [...config.repos],
        message: "Cloning repository...",
        messageType: "info",
      }))

      const newRepo = config.repos.find((r) => r.url === url)
      if (newRepo && newRepo.name) {
        await runtime.runPromise(Git.clone(newRepo, targetDir))

        const status = await runtime.runPromise(
          Git.checkStatus(newRepo, targetDir),
        )

        setState((prev) => {
          const newStatuses = new Map(prev.statuses)
          newStatuses.set(newRepo.name!, status)
          return {
            ...prev,
            statuses: newStatuses,
            message: "Repository added successfully",
            messageType: "success",
          }
        })
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        message:
          error instanceof Error ? error.message : "Failed to add repository",
        messageType: "error",
      }))
    }
  }

  const handleSyncRepo = async () => {
    const currentState = state()
    const repo = currentState.repos[currentState.selectedIndex]
    if (!repo || !repo.name) return

    setState((prev) => ({
      ...prev,
      message: `Syncing ${repo.name}...`,
      messageType: "info",
    }))

    try {
      const statuses = new Map(state().statuses)
      const currentStatus = statuses.get(repo.name)

      if (currentStatus === "missing") {
        await runtime.runPromise(Git.clone(repo, targetDir))
      } else {
        await runtime.runPromise(Git.pull(repo, targetDir))
      }

      const newStatus = await runtime.runPromise(
        Git.checkStatus(repo, targetDir),
      )

      statuses.set(repo.name, newStatus)
      setState((prev) => ({
        ...prev,
        statuses,
        message: `${repo.name} synced successfully`,
        messageType: "success",
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        message:
          error instanceof Error ?
            error.message
          : `Failed to sync ${repo.name}`,
        messageType: "error",
      }))
    }
  }

  const handleSyncAll = async () => {
    const currentState = state()
    if (currentState.repos.length === 0) return

    setState((prev) => ({
      ...prev,
      message: `Syncing all ${currentState.repos.length} repositories...`,
      messageType: "info",
    }))

    try {
      const statuses = new Map(state().statuses)
      let syncedCount = 0
      let failedCount = 0

      for (const repo of currentState.repos) {
        if (!repo.name) continue

        try {
          const currentStatus = statuses.get(repo.name)

          if (currentStatus === "missing") {
            await runtime.runPromise(Git.clone(repo, targetDir))
          } else {
            await runtime.runPromise(Git.pull(repo, targetDir))
          }

          const newStatus = await runtime.runPromise(
            Git.checkStatus(repo, targetDir),
          )
          statuses.set(repo.name, newStatus)
          syncedCount++
        } catch {
          statuses.set(repo.name, "missing")
          failedCount++
        }
      }

      setState((prev) => ({
        ...prev,
        statuses,
        message:
          failedCount === 0 ?
            `All ${syncedCount} repositories synced successfully`
          : `Synced ${syncedCount}, ${failedCount} failed`,
        messageType: failedCount === 0 ? "success" : "error",
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        message:
          error instanceof Error ?
            error.message
          : "Failed to sync repositories",
        messageType: "error",
      }))
    }
  }

  const handleSelect = (index: number) => {
    setState((prev) => ({ ...prev, selectedIndex: index }))
  }

  const handleKeyboard = (event: KeyEvent) => {
    const currentState = state()

    if (match(event, "toggle-console")) {
      renderer.console.toggle()
      return
    }

    if (match(event, "navigate-down")) {
      setState((prev) => ({
        ...prev,
        selectedIndex: Math.min(prev.selectedIndex + 1, prev.repos.length - 1),
      }))
      return
    }

    if (match(event, "navigate-up")) {
      setState((prev) => ({
        ...prev,
        selectedIndex: Math.max(prev.selectedIndex - 1, 0),
      }))
      return
    }

    if (match(event, "repo-add")) {
      setState((prev) => ({ ...prev, view: "add" }))
      return
    }

    if (match(event, "repo-sync") && currentState.view === "list") {
      void handleSyncRepo()
      return
    }

    if (match(event, "repo-sync-all") && currentState.view === "list") {
      void handleSyncAll()
      return
    }

    if (match(event, "cancel") && currentState.view === "add") {
      setState((prev) => ({ ...prev, view: "list" }))
      return
    }
  }

  onMount(() => {
    void loadConfig()
    useKeyboard(handleKeyboard)
  })

  const bgColor = () => theme()?.bg[1] ?? RGBA.fromHex("#0f0f14")
  const isWide = () => dimensions().width >= 100

  return (
    <ThemeProvider>
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
          flexShrink={isWide() ? 0 : 1}
          flexBasis={0}
        >
          <Show when={state().view === "list"}>
            <RepoList
              repos={state().repos}
              statuses={state().statuses}
              selectedIndex={state().selectedIndex}
              onSelect={handleSelect}
              onEnter={handleSyncRepo}
            />
          </Show>
          <Show when={state().view === "add"}>
            <AddRepo
              onAdd={(repo) => handleAddRepo(repo.url!)}
              onCancel={() => setState((prev) => ({ ...prev, view: "list" }))}
            />
          </Show>
        </box>
        <Show when={isWide()}>
          <box width={40}>
            <StatusBar
              message={state().message}
              type={state().messageType}
              layout="vertical"
            />
          </box>
        </Show>
      </box>
      <Show when={!isWide()}>
        <StatusBar message={state().message} type={state().messageType} />
      </Show>
    </ThemeProvider>
  )
}
