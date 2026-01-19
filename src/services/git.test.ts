import { describe, it, expect, mock } from "bun:test"
import { Effect, Layer } from "effect"
import { Command, CommandExecutor, Path } from "@effect/platform"
import { Git } from "./git"

const runWithGit = (
  effect: Effect.Effect<unknown, unknown, Git>,
  executorMock: Partial<CommandExecutor.CommandExecutor>,
  pathMock: Partial<Path.Path>,
) => {
  const ExecutorLive = Layer.succeed(
    CommandExecutor.CommandExecutor,
    executorMock as unknown as CommandExecutor.CommandExecutor,
  )
  const PathLive = Layer.succeed(Path.Path, pathMock as unknown as Path.Path)
  const GitLive = Git.Default.pipe(
    Layer.provide(ExecutorLive),
    Layer.provide(PathLive),
  )
  return Effect.provide(effect, GitLive).pipe(Effect.runPromise)
}

describe("Git", () => {
  const mockPath = {
    join: (...args: string[]) => args.join("/"),
  }

  const validUrl = "https://github.com/owner/repo"

  describe("clone", () => {
    it("succeeds when git clone returns 0", async () => {
      let capturedCommand: Command.Command | undefined
      const mockExecutor = {
        exitCode: mock((cmd) => {
          capturedCommand = cmd
          return Effect.succeed(CommandExecutor.ExitCode(0))
        }),
      }

      const program = Effect.gen(function* () {
        const git = yield* Git
        return yield* git.clone(validUrl)
      })

      await runWithGit(program, mockExecutor, mockPath)

      expect(mockExecutor.exitCode).toHaveBeenCalled()

      const cmdStr = JSON.stringify(capturedCommand)
      expect(cmdStr).toContain("git")
      expect(cmdStr).toContain("clone")
      expect(cmdStr).toContain(validUrl)
    })

    it("fails with GitError when git clone fails", async () => {
      const mockExecutor = {
        exitCode: mock(() => Effect.succeed(CommandExecutor.ExitCode(128))),
      }

      const program = Effect.gen(function* () {
        const git = yield* Git
        return yield* git.clone(validUrl)
      })

      try {
        await runWithGit(program, mockExecutor, mockPath)
        expect(true).toBe(false)
      } catch (error: unknown) {
        if (error instanceof Error) {
          expect(error.toString()).toContain("GitError")
          expect(error.toString()).toContain("Failed to clone")
        }
      }
    })
  })

  describe("pull", () => {
    it("succeeds when git pull returns 0", async () => {
      let capturedCommand: Command.Command | undefined
      const mockExecutor = {
        exitCode: mock((cmd) => {
          capturedCommand = cmd
          return Effect.succeed(CommandExecutor.ExitCode(0))
        }),
      }

      const program = Effect.gen(function* () {
        const git = yield* Git
        return yield* git.pull(validUrl)
      })

      await runWithGit(program, mockExecutor, mockPath)

      expect(mockExecutor.exitCode).toHaveBeenCalled()
      const cmdStr = JSON.stringify(capturedCommand)
      expect(cmdStr).toContain("git")
      expect(cmdStr).toContain("pull")
      expect(cmdStr).toContain("-C")
    })

    it("fails with GitError when git pull fails", async () => {
      const mockExecutor = {
        exitCode: mock(() => Effect.succeed(CommandExecutor.ExitCode(1))),
      }

      const program = Effect.gen(function* () {
        const git = yield* Git
        return yield* git.pull(validUrl)
      })

      try {
        await runWithGit(program, mockExecutor, mockPath)
        expect(true).toBe(false)
      } catch (error: unknown) {
        if (error instanceof Error) {
          expect(error.toString()).toContain("GitError")
          expect(error.toString()).toContain("Failed to pull")
        }
      }
    })
  })

  describe("checkStatus", () => {
    it("returns missing when directory check fails", async () => {
      const mockExecutor = {
        exitCode: mock((cmd) => {
          const cmdStr = JSON.stringify(cmd)
          if (cmdStr.includes("test") && cmdStr.includes("-d")) {
            return Effect.succeed(CommandExecutor.ExitCode(1))
          }
          return Effect.succeed(CommandExecutor.ExitCode(0))
        }),
      }

      const program = Effect.gen(function* () {
        const git = yield* Git
        return yield* git.checkStatus(validUrl)
      })

      const result = await runWithGit(program, mockExecutor, mockPath)
      expect(result).toEqual({ state: "missing" })
    })

    it("returns modified when git status has output", async () => {
      const mockExecutor = {
        exitCode: mock((_) => Effect.succeed(CommandExecutor.ExitCode(0))), // test -d succeeds
        string: mock((cmd) => {
          const cmdStr = JSON.stringify(cmd)
          if (cmdStr.includes("status")) {
            return Effect.succeed(" M somefile.ts\n")
          }
          return Effect.succeed("")
        }),
      }

      const program = Effect.gen(function* () {
        const git = yield* Git
        return yield* git.checkStatus(validUrl)
      })

      const result = await runWithGit(program, mockExecutor, mockPath)
      expect(result).toEqual({ state: "modified" })
    })

    it("returns up to date when status clean and count is 0", async () => {
      const mockExecutor = {
        exitCode: mock((_) => Effect.succeed(CommandExecutor.ExitCode(0))),
        string: mock((cmd) => {
          const cmdStr = JSON.stringify(cmd)
          if (cmdStr.includes("status")) {
            return Effect.succeed("")
          }
          if (cmdStr.includes("rev-list")) {
            return Effect.succeed("0\n")
          }
          return Effect.succeed("")
        }),
      }

      const program = Effect.gen(function* () {
        const git = yield* Git
        return yield* git.checkStatus(validUrl)
      })

      const result = await runWithGit(program, mockExecutor, mockPath)
      expect(result).toEqual({ state: "up to date" })
    })

    it("returns behind with commit count when count > 0", async () => {
      const mockExecutor = {
        exitCode: mock((_) => Effect.succeed(CommandExecutor.ExitCode(0))),
        string: mock((cmd) => {
          const cmdStr = JSON.stringify(cmd)
          if (cmdStr.includes("status")) {
            return Effect.succeed("")
          }
          if (cmdStr.includes("rev-list")) {
            return Effect.succeed("5\n")
          }
          return Effect.succeed("")
        }),
      }

      const program = Effect.gen(function* () {
        const git = yield* Git
        return yield* git.checkStatus(validUrl)
      })

      const result = await runWithGit(program, mockExecutor, mockPath)
      expect(result).toEqual({ state: "behind", commitCount: 5 })
    })
  })
})
