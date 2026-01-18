import { RGBA, TextAttributes } from "@opentui/core"
import { useKeyboard } from "@opentui/react"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { Effect } from "effect"
import { match } from "../lib/keybinds"
import { theme } from "../lib/theme"
import { Config } from "../services/config"
import { useRuntime } from "./provider-runtime"

export function RepoList() {
  const runtime = useRuntime()

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
    </box>
  )
}
