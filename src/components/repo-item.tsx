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
import { useTheme } from "./provider-theme"
import { StatusBadge } from "./status-badge"

type UiStatus = "loading" | "syncing" | "error"

export interface RepoItemProps {
  url: string
  isHighlighted: boolean
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
      return "syncing" as const
    }
    if (statusQuery.isLoading) {
      return "loading" as const
    }
    if (statusQuery.isError) {
      return "error" as const
    }
    const data = statusQuery.data
    if (data) return data
    return "loading" as const
  }, [statusQuery, mutation.isPending])

  const repoInfo = useMemo(() => parseGithubUrlSync(props.url), [props.url])

  const isBehindStatus = (
    status: RepoStatus | UiStatus,
  ): status is RepoStatus & { state: "behind"; commitCount: number } => {
    return (
      typeof status === "object"
      && "state" in status
      && status.state === "behind"
    )
  }

  const commitCount =
    isBehindStatus(effectiveStatus) ? effectiveStatus.commitCount : undefined

  const highlightColor =
    props.isHighlighted ? RGBA.fromHex("#334455") : "transparent"

  return (
    <box
      backgroundColor={highlightColor}
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
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
      <StatusBadge
        status={effectiveStatus}
        syncType={syncType}
        commitCount={commitCount}
      />
    </box>
  )
}
