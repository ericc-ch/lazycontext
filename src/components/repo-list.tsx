import { RGBA } from "@opentui/core"
import { useKeyboard } from "@opentui/react"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { Effect } from "effect"
import { useEffect, useState } from "react"
import { match } from "../lib/keybinds"
import { Config } from "../services/config"
import { Git, type RepoStatus } from "../services/git"
import { useRuntime } from "./provider-runtime"
import { useTheme } from "./provider-theme"
import { RepoItem } from "./repo-item"

function isRepoStatus(status: unknown): status is RepoStatus {
  return typeof status === "object" && status !== null && "state" in status
}

export function RepoList() {
  const runtime = useRuntime()
  const theme = useTheme()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const reposQuery = queryOptions({
    queryKey: ["repos"] as const,
    queryFn: () =>
      Effect.gen(function* () {
        const configService = yield* Config
        const config = yield* configService.load
        return config.repos
      }).pipe(runtime.runPromise),
  })

  const repos = useQuery(reposQuery)

  useEffect(() => {
    if (repos.data) {
      setSelectedIndex(0)
    }
  }, [repos.data])

  useKeyboard((event) => {
    if (!repos.data?.length) {
      return
    }

    if (match(event, "navigate-down")) {
      setSelectedIndex((prev) => Math.min(prev + 1, repos.data.length - 1))
      return
    }

    if (match(event, "navigate-up")) {
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
      return
    }

    if (match(event, "repo-sync-all")) {
      for (const url of repos.data) {
        const git = runtime.runSync(Git)
        const status = git.checkStatus(url).pipe(runtime.runPromise)
        if (isRepoStatus(status) && status.state === "missing") {
          void git.clone(url).pipe(runtime.runPromise)
        } else {
          void git.pull(url).pipe(runtime.runPromise)
        }
      }
      return
    }
  })

  const renderContent = () => {
    if (repos.isLoading) {
      return (
        <box padding={1} flexDirection="row" alignItems="center">
          <text fg={theme.grays[0] ?? RGBA.fromHex("#888888")}>loading...</text>
          <text paddingLeft={1} fg={theme.grays[0] ?? RGBA.fromHex("#888888")}>
            ◐
          </text>
        </box>
      )
    }

    if (repos.isError) {
      return (
        <box padding={1} flexDirection="column">
          <text fg={theme.error[0] ?? RGBA.fromHex("#ff0000")}>
            Failed to load repositories:
          </text>
          <text fg={theme.error[0] ?? RGBA.fromHex("#ff0000")} paddingLeft={1}>
            {repos.error instanceof Error ?
              repos.error.message
            : String(repos.error)}
          </text>
        </box>
      )
    }

    if (repos.data?.length === 0) {
      return (
        <box padding={1} flexDirection="row" alignItems="center">
          <text fg={theme.grays[0] ?? RGBA.fromHex("#888888")}>
            No repositories found.
          </text>
        </box>
      )
    }

    return (
      <>
        {repos.data?.map((url, index) => (
          <RepoItem
            key={url}
            url={url}
            isHighlighted={index === selectedIndex}
          />
        ))}
      </>
    )
  }

  return (
    <box flexDirection="column">
      <box flexDirection="column">{renderContent()}</box>
    </box>
  )
}
