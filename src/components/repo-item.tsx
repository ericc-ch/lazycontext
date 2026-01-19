import { RGBA } from "@opentui/core"
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { Effect } from "effect"
import { useMemo, useState } from "react"
import { Git, type RepoStatus } from "../services/git"
import { useRuntime } from "./provider-runtime"
import { useTheme, type Theme } from "./provider-theme"

type UiStatus = "loading" | "syncing" | "error"

export interface RepoItemProps {
  url: string
  isHighlighted: boolean
}

type StatusConfig = {
  color: (theme: Theme) => RGBA
  icon: string
  text: (syncType: "clone" | "pull" | null, commitCount?: number) => string
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  "up to date": {
    color: (theme) => theme.success[0] ?? RGBA.fromHex("#00ff00"),
    icon: "✓",
    text: () => "up to date",
  },
  behind: {
    color: (theme) => theme.warning[0] ?? RGBA.fromHex("#ffff00"),
    icon: "…",
    text: (_, commitCount) => `${commitCount} behind`,
  },
  missing: {
    color: (theme) => theme.error[0] ?? RGBA.fromHex("#ff0000"),
    icon: "✗",
    text: () => "missing",
  },
  modified: {
    color: (theme) => theme.warning[0] ?? RGBA.fromHex("#ffff00"),
    icon: "…",
    text: () => "modified",
  },
  loading: {
    color: (theme) => theme.grays[0] ?? RGBA.fromHex("#888888"),
    icon: "◐",
    text: () => "loading...",
  },
  syncing: {
    color: (theme) => theme.info[0] ?? RGBA.fromHex("#00AAFF"),
    icon: "◐",
    text: (syncType) => (syncType === "clone" ? "Cloning..." : "Pulling..."),
  },
  error: {
    color: (theme) => theme.error[0] ?? RGBA.fromHex("#ff0000"),
    icon: "!",
    text: () => "error",
  },
}

const DEFAULT_STATUS_CONFIG: StatusConfig = {
  color: (theme) => theme.grays[0] ?? RGBA.fromHex("#888888"),
  icon: "?",
  text: () => "unknown",
}

function isRepoStatus(status: RepoStatus | UiStatus): status is RepoStatus {
  return typeof status === "object" && status !== null && "state" in status
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

export function RepoItem(props: RepoItemProps) {
  const runtime = useRuntime()
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [syncType, setSyncType] = useState<"clone" | "pull" | null>(null)

  const query = queryOptions({
    queryKey: ["repo-status", props.url] as const,
    queryFn: () =>
      Effect.gen(function* () {
        const git = yield* Git
        return yield* git.checkStatus(props.url)
      }).pipe(runtime.runPromise),
  })

  const statusQuery = useQuery(query)

  const mutation = useMutation({
    mutationFn: async ({
      url,
      type,
    }: {
      url: string
      type: "clone" | "pull"
    }) => {
      const git = runtime.runSync(Git)
      if (type === "clone") {
        return git.clone(url)
      } else {
        return git.pull(url)
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

  const effectiveStatus: RepoStatus | UiStatus = useMemo(() => {
    if (mutation.isPending) {
      return "syncing"
    }
    if (statusQuery.isLoading) {
      return "loading"
    }
    if (statusQuery.isError) {
      return "error"
    }
    const data = statusQuery.data
    if (data) return data
    return "loading"
  }, [statusQuery, mutation.isPending])

  const repoInfo = useMemo(() => parseGithubUrlSync(props.url), [props.url])

  const config = useMemo(() => {
    if (isRepoStatus(effectiveStatus)) {
      const cfg = STATUS_CONFIGS[effectiveStatus.state]
      if (cfg) return cfg
    } else {
      const cfg = STATUS_CONFIGS[effectiveStatus]
      if (cfg) return cfg
    }
    return DEFAULT_STATUS_CONFIG
  }, [effectiveStatus])

  const statusColor = config.color(theme)
  const statusIcon = config.icon
  const commitCount =
    isRepoStatus(effectiveStatus) && effectiveStatus.state === "behind" ?
      effectiveStatus.commitCount
    : undefined
  const statusText = config.text(syncType, commitCount)

  const highlightColor =
    props.isHighlighted ? RGBA.fromHex("#334455") : "transparent"

  return (
    <box
      backgroundColor={highlightColor}
      paddingLeft={1}
      paddingRight={1}
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <box flexDirection="row" alignItems="center" flexGrow={1}>
        <text fg={theme.grays[1] ?? RGBA.fromHex("#666666")} truncate={true}>
          {repoInfo?.owner ?? ""}
        </text>
        <text fg={theme.fg[0] ?? RGBA.fromHex("#ffffff")} truncate={true}>
          {repoInfo ? ` / ${repoInfo.repo}` : ""}
        </text>
      </box>
      <box
        backgroundColor={statusColor}
        paddingLeft={1}
        paddingRight={1}
        flexDirection="row"
        alignItems="center"
        marginLeft={1}
      >
        <text>{statusText}</text>
        <text paddingLeft={1}>{statusIcon}</text>
      </box>
    </box>
  )
}
