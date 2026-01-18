import { Command, CommandExecutor } from "@effect/platform"
import { Data, Effect } from "effect"
import { parseGithubUrl } from "../lib/url"

export class GitError extends Data.TaggedError("GitError")<{
  readonly message: string
  readonly exitCode?: number
}> {}

export class Git extends Effect.Service<Git>()("Git", {
  accessors: true,
  effect: Effect.gen(function* () {
    const executor = yield* CommandExecutor.CommandExecutor

    return {
      clone: Effect.fn(function* (url: string, targetDir: string) {
        const { repo: repoName } = yield* parseGithubUrl(url)
        const command = Command.make(
          "git",
          "clone",
          "--quiet",
          url,
          `${targetDir}/${repoName}`,
        )
        const result = yield* executor.exitCode(command)
        if (result !== 0) {
          return yield* new GitError({
            message: `Failed to clone ${url}`,
            exitCode: result,
          })
        }
      }),

      pull: Effect.fn(function* (url: string, targetDir: string) {
        const { repo: repoName } = yield* parseGithubUrl(url)
        const command = Command.make(
          "git",
          "-C",
          `${targetDir}/${repoName}`,
          "pull",
          "--quiet",
        )
        const result = yield* executor.exitCode(command)
        if (result !== 0) {
          return yield* new GitError({
            message: `Failed to pull ${url}`,
            exitCode: result,
          })
        }
      }),

      checkStatus: Effect.fn(function* (url: string, targetDir: string) {
        const { repo: repoName } = yield* parseGithubUrl(url)
        const dirCommand = Command.make(
          "test",
          "-d",
          `${targetDir}/${repoName}`,
        )
        const dirResult = yield* executor.exitCode(dirCommand)

        if (dirResult !== 0) {
          return "missing" as const
        }

        const statusCommand = Command.make(
          "git",
          "-C",
          `${targetDir}/${repoName}`,
          "status",
          "--porcelain",
        )
        const output = yield* executor.string(statusCommand)

        if (output.trim() === "") {
          return "synced" as const
        }

        return "modified" as const
      }),
    }
  }),
}) {}
