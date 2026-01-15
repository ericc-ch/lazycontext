import { createSignal, onMount, Show } from "solid-js"
import { useKeyboard } from "@opentui/solid"
import { ConfigService, type Repo } from "./services/config"
import { GitService } from "./services/git"
import { runApp } from "./runtime"
import { RepoList } from "./components/RepoList"
import { AddRepo } from "./components/AddRepo"
import { StatusBar } from "./components/StatusBar"

type View = "list" | "add"

interface AppState {
  repos: Repo[]
  statuses: Map<string, "synced" | "modified" | "missing">
  selectedIndex: number
  view: View
  message: string
  messageType: "info" | "success" | "error"
}

export function App() {
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
      const config = await runApp(ConfigService.load())
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
        const status = await runApp(GitService.checkStatus(repo, targetDir))
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
      const config = await runApp(ConfigService.addRepo(url))

      setState((prev) => ({
        ...prev,
        repos: [...config.repos],
        message: "Cloning repository...",
        messageType: "info",
      }))

      const newRepo = config.repos.find((r) => r.url === url)
      if (newRepo && newRepo.name) {
        await runApp(GitService.clone(newRepo, targetDir))

        const status = await runApp(GitService.checkStatus(newRepo, targetDir))

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
        await runApp(GitService.clone(repo, targetDir))
      } else {
        await runApp(GitService.pull(repo, targetDir))
      }

      const newStatus = await runApp(GitService.checkStatus(repo, targetDir))

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

  const handleSelect = (index: number) => {
    setState((prev) => ({ ...prev, selectedIndex: index }))
  }

  const handleKeyNavigation = (key: { name: string }) => {
    const currentState = state()

    if (key.name === "j" || key.name === "down") {
      setState((prev) => ({
        ...prev,
        selectedIndex: Math.min(prev.selectedIndex + 1, prev.repos.length - 1),
      }))
    } else if (key.name === "k" || key.name === "up") {
      setState((prev) => ({
        ...prev,
        selectedIndex: Math.max(prev.selectedIndex - 1, 0),
      }))
    } else if (key.name === "a") {
      setState((prev) => ({ ...prev, view: "add" }))
    } else if (key.name === "enter" && currentState.view === "list") {
      void handleSyncRepo()
    } else if (key.name === "escape" && currentState.view === "add") {
      setState((prev) => ({ ...prev, view: "list" }))
    }
  }

  onMount(() => {
    void loadConfig()
    useKeyboard(handleKeyNavigation)
  })

  return (
    <box
      flexDirection="column"
      width="100%"
      height="100%"
      backgroundColor="#0f0f14"
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
    >
      <box flexDirection="column" flexGrow={1} gap={1}>
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
      <StatusBar message={state().message} type={state().messageType} />
    </box>
  )
}
