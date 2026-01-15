import { type Effect, gen, fail } from "effect/Effect"
import { type Layer, succeed } from "effect/Layer"
import { GenericTag } from "effect/Context"
import * as Command from "@effect/platform/Command"
import * as CommandExecutor from "@effect/platform/CommandExecutor"
import type { PlatformError } from "@effect/platform/Error"

export interface Repo {
  readonly name: string
  readonly url: string
}

export interface GitService {
  readonly clone: (
    repo: Repo,
    targetDir: string,
  ) => Effect<void, GitError, CommandExecutor.CommandExecutor>
  readonly pull: (
    repo: Repo,
    targetDir: string,
  ) => Effect<void, GitError, CommandExecutor.CommandExecutor>
  readonly checkStatus: (
    repo: Repo,
    targetDir: string,
  ) => Effect<
    "synced" | "modified" | "missing",
    GitError,
    CommandExecutor.CommandExecutor
  >
}

export type GitError = Readonly<{
  _tag: "GitError"
  message: string
  exitCode?: number | undefined
}>

function gitError(message: string, exitCode?: number): GitError {
  return { _tag: "GitError", message, exitCode }
}

export const GitService = GenericTag<GitService>("@lazycontext/GitService")

export const clone = (
  repo: Repo,
  targetDir: string,
): Effect<void, GitError | PlatformError, CommandExecutor.CommandExecutor> =>
  gen(function* cloneGen() {
    const executor = yield* CommandExecutor.CommandExecutor
    const command = Command.make(
      "git",
      "clone",
      "--quiet",
      repo.url,
      `${targetDir}/${repo.name}`,
    )
    const result = yield* executor.exitCode(command)
    if (result !== 0) {
      yield* fail(gitError(`Failed to clone ${repo.url}`, result))
    }
  })

export const pull = (
  repo: Repo,
  targetDir: string,
): Effect<void, GitError | PlatformError, CommandExecutor.CommandExecutor> =>
  gen(function* pullGen() {
    const executor = yield* CommandExecutor.CommandExecutor
    const command = Command.make(
      "git",
      "-C",
      `${targetDir}/${repo.name}`,
      "pull",
      "--quiet",
    )
    const result = yield* executor.exitCode(command)
    if (result !== 0) {
      yield* fail(gitError(`Failed to pull ${repo.name}`, result))
    }
  })

export const checkStatus = (
  repo: Repo,
  targetDir: string,
): Effect<
  "synced" | "modified" | "missing",
  GitError | PlatformError,
  CommandExecutor.CommandExecutor
> =>
  gen(function* checkStatusGen() {
    const executor = yield* CommandExecutor.CommandExecutor
    const dirCommand = Command.make("test", "-d", `${targetDir}/${repo.name}`)
    const dirResult = yield* executor.exitCode(dirCommand)

    if (dirResult !== 0) {
      return "missing"
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
      return "synced"
    }

    return "modified"
  })

export const live: Layer<GitService, never, CommandExecutor.CommandExecutor> =
  succeed(GitService, {
    clone,
    pull,
    checkStatus,
  } as GitService)
