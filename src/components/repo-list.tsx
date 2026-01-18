import { RGBA, TextAttributes } from "@opentui/core"
import { useKeyboard } from "@opentui/react"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { Effect } from "effect"
import { useEffect, useState } from "react"
import { match } from "../lib/keybinds"
import { theme } from "../lib/theme"
import { Config } from "../services/config"
import { Git } from "../services/git"
import { useRuntime } from "./provider-runtime"
import { RepoItem, type RepoStatus } from "./repo-item"

export function RepoList() {
  const runtime = useRuntime()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [syncingUrl, setSyncingUrl] = useState<string | null>(null)
  const [syncType, setSyncType] = useState<"clone" | "pull" | null>(null)

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

  const handleSync = async (url: string, currentStatus: RepoStatus) => {
    if (syncingUrl) return

    const type = currentStatus === "missing" ? "clone" : "pull"
    setSyncingUrl(url)
    setSyncType(type)

    try {
      const targetDir = `${process.cwd()}/.context`
      const effect = Effect.gen(function* () {
        const git = yield* Git
        if (type === "clone") {
          yield* git.clone(url, targetDir)
        } else {
          yield* git.pull(url, targetDir)
        }
      })
      await runtime.runPromise(effect)
    } catch {
    } finally {
      setSyncingUrl(null)
      setSyncType(null)
    }
  }

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

    if (match(event, "repo-sync")) {
      const selectedUrl = repos.data[selectedIndex]
      if (selectedUrl) {
        void handleSync(selectedUrl, "synced")
      }
    }
  })

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
      </box>
      <box flexDirection="column">
        {repos.data?.map((url, index) => (
          <RepoItem
            key={url}
            url={url}
            isSelected={index === selectedIndex}
            onSelect={() => setSelectedIndex(index)}
            syncing={syncingUrl === url}
            syncType={syncType}
          />
        ))}
      </box>
    </box>
  )
}
