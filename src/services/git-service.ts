import { Command, CommandExecutor } from "@effect/platform"
import { BunCommandExecutor } from "@effect/platform-bun"
import { Data, Effect } from "effect"
import type { Repo } from "./config-service"

export class GitError extends Data.TaggedError("GitError")<{
  readonly message: string
  readonly exitCode?: number
}> {}

export class GitService extends Effect.Service<GitService>()("GitService", {
  accessors: true,
  dependencies: [BunCommandExecutor.layer],
  effect: Effect.gen(function* () {
    const executor = yield* CommandExecutor.CommandExecutor

    return {
      clone: Effect.fn(function* (repo: Repo, targetDir: string) {
        const command = Command.make(
          "git",
          "clone",
          "--quiet",
          repo.url,
          `${targetDir}/${repo.name}`,
        )
        const result = yield* executor.exitCode(command)
        if (result !== 0) {
          return yield* new GitError({
            message: `Failed to clone ${repo.url}`,
            exitCode: result,
          })
        }
      }),

      pull: Effect.fn(function* (repo: Repo, targetDir: string) {
        const command = Command.make(
          "git",
          "-C",
          `${targetDir}/${repo.name}`,
          "pull",
          "--quiet",
        )
        const result = yield* executor.exitCode(command)
        if (result !== 0) {
          return yield* new GitError({
            message: `Failed to clone ${repo.url}`,
            exitCode: result,
          })
        }
      }),

      checkStatus: Effect.fn(function* (repo: Repo, targetDir: string) {
        const dirCommand = Command.make(
          "test",
          "-d",
          `${targetDir}/${repo.name}`,
        )
        const dirResult = yield* executor.exitCode(dirCommand)

        if (dirResult !== 0) {
          return "missing" as const
        }

        const statusCommand = Command.make(
          "git",
          "-C",
          `${targetDir}/${repo.name}`,
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
