import { FileSystem, Path } from "@effect/platform"
import { Data, Effect, Schema } from "effect"
import { parseGithubUrl } from "../lib/url"

export class RepoSchema extends Schema.Class<RepoSchema>("RepoSchema")({
  name: Schema.String.pipe(Schema.optional),
  url: Schema.String,
}) {}

export class ConfigSchema extends Schema.Class<ConfigSchema>("ConfigSchema")({
  repos: Schema.Array(RepoSchema),
}) {}

export class ConfigError extends Data.TaggedError("ConfigError")<{
  message: string
}> {}

const defaultConfig = new ConfigSchema({ repos: [] })
const JsonSchema = Schema.parseJson(ConfigSchema, { space: 2 })

export class Config extends Effect.Service<Config>()("Config", {
  accessors: true,
  effect: Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    const cwd = yield* Effect.sync(() => process.cwd())
    const configPath = path.join(cwd, "lazycontext.json")

    const ensureDirExists = Effect.gen(function* () {
      const dirPath = path.join(cwd, ".context")
      yield* fs.makeDirectory(dirPath, { recursive: true })
    })

    const readConfigFile = Effect.gen(function* () {
      const fullPath = path.join(cwd, configPath)
      const exists = yield* fs.exists(fullPath)
      if (!exists) return defaultConfig

      const content = yield* fs.readFileString(fullPath)

      return yield* Schema.decodeUnknown(JsonSchema)(content)
    })

    return {
      load: Effect.fn(function* () {
        yield* ensureDirExists
        return yield* readConfigFile
      }),

      addRepo: Effect.fn(function* (url: string) {
        const { repo } = yield* parseGithubUrl(url)
        const config = yield* readConfigFile

        const existingUrls = new Set(config.repos.map((r) => r.url))
        if (existingUrls.has(url)) {
          return config
        }

        const newConfig = new ConfigSchema({
          repos: [...config.repos, new RepoSchema({ name: repo, url })],
        })
        const content = yield* Schema.encode(JsonSchema)(newConfig)
        yield* ensureDirExists

        yield* fs.writeFileString(configPath, content)
        return newConfig
      }),

      removeRepo: Effect.fn(function* (name: string) {
        const config = yield* readConfigFile

        const filtered = config.repos.filter((repo) => repo.name !== name)
        if (filtered.length === config.repos.length) {
          return yield* new ConfigError({
            message: `Repository ${name} not found`,
          })
        }

        const newConfig = new ConfigSchema({ repos: filtered })
        const content = yield* Schema.encode(JsonSchema)(newConfig)
        yield* ensureDirExists
        const fullPath = path.join(cwd, configPath)
        yield* fs.writeFileString(fullPath, content)
        return newConfig
      }),
    }
  }),
}) {}
