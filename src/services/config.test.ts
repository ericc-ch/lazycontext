import { describe, it, expect, mock } from "bun:test"
import { Effect, Layer } from "effect"
import { FileSystem, Path } from "@effect/platform"
import { Config } from "./config"

const runWithConfig = (
  effect: Effect.Effect<unknown, unknown, Config>,
  fsLayer: Layer.Layer<FileSystem.FileSystem>,
  pathMock: Partial<Path.Path>,
) => {
  const PathLive = Layer.succeed(Path.Path, pathMock as unknown as Path.Path)
  const ConfigLive = Config.Default.pipe(
    Layer.provide(fsLayer),
    Layer.provide(PathLive),
  )
  return Effect.provide(effect, ConfigLive).pipe(Effect.runPromise)
}

describe("Config", () => {
  const mockPath = {
    join: (...args: string[]) => args.join("/"),
  }

  it("returns default config when file does not exist", async () => {
    const makeDirectoryMock = mock(() => Effect.void)
    const fsLayer = FileSystem.layerNoop({
      exists: () => Effect.succeed(false),
      makeDirectory: makeDirectoryMock,
    })

    const program = Effect.gen(function* () {
      const config = yield* Config
      return yield* config.load
    })

    const result = await runWithConfig(program, fsLayer, mockPath)

    expect(result).toEqual({ repos: [] })
    expect(makeDirectoryMock).toHaveBeenCalled()
  })

  it("returns parsed config when file exists", async () => {
    const validConfig = { repos: ["https://github.com/user/repo"] }
    const fsLayer = FileSystem.layerNoop({
      exists: () => Effect.succeed(true),
      makeDirectory: () => Effect.void,
      readFileString: () => Effect.succeed(JSON.stringify(validConfig)),
    })

    const program = Effect.gen(function* () {
      const config = yield* Config
      return yield* config.load
    })

    const result = await runWithConfig(program, fsLayer, mockPath)

    expect(result).toEqual(validConfig)
  })

  it("fails with error when JSON is invalid", async () => {
    const fsLayer = FileSystem.layerNoop({
      exists: () => Effect.succeed(true),
      makeDirectory: () => Effect.void,
      readFileString: () => Effect.succeed("invalid json"),
    })

    const program = Effect.gen(function* () {
      const config = yield* Config
      return yield* config.load
    })

    try {
      await runWithConfig(program, fsLayer, mockPath)
      expect(true).toBe(false)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it("fails with error when schema validation fails", async () => {
    const invalidConfig = { repos: "not an array" }
    const fsLayer = FileSystem.layerNoop({
      exists: () => Effect.succeed(true),
      makeDirectory: () => Effect.void,
      readFileString: () => Effect.succeed(JSON.stringify(invalidConfig)),
    })

    const program = Effect.gen(function* () {
      const config = yield* Config
      return yield* config.load
    })

    try {
      await runWithConfig(program, fsLayer, mockPath)
      expect(true).toBe(false)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it("creates .context directory", async () => {
    const makeDirectoryMock = mock(() => Effect.void)
    const fsLayer = FileSystem.layerNoop({
      exists: () => Effect.succeed(false),
      makeDirectory: makeDirectoryMock,
    })

    const program = Effect.gen(function* () {
      const config = yield* Config
      return yield* config.load
    })

    await runWithConfig(program, fsLayer, mockPath)

    expect(makeDirectoryMock).toHaveBeenCalled()
  })
})
