import { RGBA, TextAttributes } from "@opentui/core"
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { Effect } from "effect"
import { useMemo, useState } from "react"
import { useRuntime } from "./provider-runtime"

export type RepoStatus =
  | "synced"
  | "modified"
  | "missing"
  | "loading"
  | "syncing"
  | "error"

const TARGET_DIR = `${process.cwd()}/.context`

function getTargetDir() {
  return TARGET_DIR
}

export function useRepoStatus(url: string) {
  const runtime = useRuntime()

  const query = queryOptions({
    queryKey: ["repo-status", url] as const,
    queryFn: () =>
      Effect.gen(function* () {
        const git = yield* Git
        const targetDir = getTargetDir()
        return yield* git.checkStatus(url, targetDir)
      }).pipe(runtime.runPromise),
  })

  return useQuery(query)
}

export function useSyncRepo() {
  const runtime = useRuntime()
  const queryClient = useQueryClient()
  const [syncType, setSyncType] = useState<"clone" | "pull" | null>(null)

  const mutation = useMutation({
    mutationFn: async ({
      url,
      type,
    }: {
      url: string
      type: "clone" | "pull"
    }) => {
      const targetDir = getTargetDir()
      const git = runtime.runSync(Git)
      if (type === "clone") {
        return git.clone(url, targetDir)
      } else {
        return git.pull(url, targetDir)
      }
    },
    onSuccess: (_, { url }) => {
      void queryClient.invalidateQueries({ queryKey: ["repo-status", url] })
      setSyncType(null)
    },
    onError: () => {
      setSyncType(null)
    },
  })

  const sync = (url: string, currentStatus: RepoStatus) => {
    const type = currentStatus === "missing" ? "clone" : "pull"
    setSyncType(type)
    mutation.mutate({ url, type })
  }

  return { sync, isSyncing: mutation.isPending, syncType }
}

import { Git } from "../services/git"
import { theme } from "../lib/theme"

export interface RepoItemProps {
  url: string
  isSelected: boolean
  onSelect: () => void
  syncing?: boolean
  syncType?: "clone" | "pull" | null
  onSync?: () => void
}

function getStatusColor(status: RepoStatus): RGBA {
  switch (status) {
    case "synced":
      return theme.success[0] ?? RGBA.fromHex("#00ff00")
    case "modified":
      return theme.warning[0] ?? RGBA.fromHex("#ffff00")
    case "missing":
      return theme.error[0] ?? RGBA.fromHex("#ff0000")
    case "loading":
      return theme.grays[0] ?? RGBA.fromHex("#888888")
    case "syncing":
      return theme.info[0] ?? RGBA.fromHex("#00AAFF")
    case "error":
      return theme.error[0] ?? RGBA.fromHex("#ff0000")
    default:
      return theme.grays[0] ?? RGBA.fromHex("#888888")
  }
}

function getStatusIcon(status: RepoStatus): string {
  switch (status) {
    case "synced":
      return "✓"
    case "modified":
      return "…"
    case "missing":
      return "✗"
    case "loading":
      return "◐"
    case "syncing":
      return "◐"
    case "error":
      return "!"
    default:
      return "?"
  }
}

function getStatusText(
  status: RepoStatus,
  syncType: "clone" | "pull" | null,
): string {
  switch (status) {
    case "synced":
      return "synced"
    case "modified":
      return "modified"
    case "missing":
      return "missing"
    case "loading":
      return "loading..."
    case "syncing":
      return syncType === "clone" ? "Cloning..." : "Pulling..."
    case "error":
      return "error"
    default:
      return "unknown"
  }
}

export function RepoItem(props: RepoItemProps) {
  const statusQuery = useRepoStatus(props.url)
  const [isHovered, setIsHovered] = useState(false)
  const effectiveStatus: RepoStatus = useMemo(() => {
    if (props.syncing) {
      return "syncing"
    }
    if (statusQuery.isLoading) {
      return "loading"
    }
    if (statusQuery.isError) {
      return "error"
    }
    return statusQuery.data ?? "loading"
  }, [statusQuery, props.syncing])

  const repoName = useMemo(() => {
    const match = parseGithubUrlSync(props.url)
    return match?.repo ?? props.url
  }, [props.url])

  const statusColor = getStatusColor(effectiveStatus)
  const statusIcon = getStatusIcon(effectiveStatus)
  const statusText = getStatusText(effectiveStatus, props.syncType ?? null)

  const hoverBackgroundColor = useMemo(() => {
    return theme.bg[2] ?? RGBA.fromHex("#1a1b26")
  }, [])

  return (
    <box
      backgroundColor={
        props.isSelected ? (theme.bg[3] ?? RGBA.fromHex("#2a2e3f"))
        : isHovered ?
          hoverBackgroundColor
        : "transparent"
      }
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <box flexDirection="row" alignItems="center" flexGrow={1}>
        <text
          attributes={
            props.isSelected ? TextAttributes.BOLD : TextAttributes.NONE
          }
          truncate={true}
        >
          {repoName}
        </text>
      </box>
      <box
        backgroundColor={statusColor}
        paddingLeft={1}
        paddingRight={1}
        flexDirection="row"
        alignItems="center"
      >
        <text>{statusText}</text>
        <text paddingLeft={1}>{statusIcon}</text>
      </box>
    </box>
  )
}

function parseGithubUrlSync(
  url: string,
): { owner: string; repo: string } | null {
  const githubUrlRegex = new RegExp(
    "(?:https:\\/|git@)github\\.com[\\/:](?<owner>[^/]+)\\/(?<repo>[^/]+?)(?:\\.git)?$",
  )
  const match = url.match(githubUrlRegex)
  if (!match || !match.groups) {
    return null
  }
  const owner = match.groups.owner
  const repo = match.groups.repo
  if (owner === undefined || repo === undefined) {
    return null
  }
  return { owner, repo }
}
