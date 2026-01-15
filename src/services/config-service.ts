import { type Effect, gen, fail, catchTag } from "effect/Effect"
import { type Layer, succeed } from "effect/Layer"
import { GenericTag } from "effect/Context"
import * as Command from "@effect/platform/Command"
import * as CommandExecutor from "@effect/platform/CommandExecutor"
import type { Repo } from "./git-service"

export interface Config {
  readonly repos: ReadonlyArray<Repo>
}

export interface ConfigService {
  readonly load: () => Effect<
    Config,
    ConfigError,
    CommandExecutor.CommandExecutor
  >
  readonly addRepo: (
    url: string,
  ) => Effect<Config, ConfigError, CommandExecutor.CommandExecutor>
  readonly removeRepo: (
    name: string,
  ) => Effect<Config, ConfigError, CommandExecutor.CommandExecutor>
}

export type ConfigError = Readonly<{
  _tag: "ConfigError"
  message: string
}>

function configError(message: string): ConfigError {
  return { _tag: "ConfigError", message }
}

export const ConfigService = GenericTag<ConfigService>(
  "@lazycontext/ConfigService",
)

const CONFIG_PATH = ".context/config.json"

const defaultConfig: Config = { repos: [] }

function parseRepoName(url: string): string {
  const lastSlash = url.lastIndexOf("/")
  if (lastSlash === -1) {
    return url.replace(/\.git$/, "")
  }
  const nameWithExt = url.slice(lastSlash + 1)
  return nameWithExt.replace(/\.git$/, "")
}

function ensureDirExists(): Effect<
  void,
  ConfigError,
  CommandExecutor.CommandExecutor
> {
  return gen(function* ensureDirGen() {
    const executor = yield* CommandExecutor.CommandExecutor
    const dirCommand = Command.make("test", "-d", ".context")
    const result = yield* executor.exitCode(dirCommand).pipe(
      catchTag("BadArgument", () => fail(configError("Invalid path"))),
      catchTag("SystemError", (e) =>
        fail(configError(`System error: ${e.message}`)),
      ),
    )
    if (result !== 0) {
      const mkdirCommand = Command.make("mkdir", "-p", ".context")
      const mkdirResult = yield* executor.exitCode(mkdirCommand).pipe(
        catchTag("BadArgument", () => fail(configError("Invalid path"))),
        catchTag("SystemError", (e) =>
          fail(configError(`System error: ${e.message}`)),
        ),
      )
      if (mkdirResult !== 0) {
        yield* fail(configError("Failed to create .context directory"))
      }
    }
  })
}

function readConfigFile(): Effect<
  Config,
  ConfigError,
  CommandExecutor.CommandExecutor
> {
  return gen(function* readConfigGen() {
    const executor = yield* CommandExecutor.CommandExecutor
    const fileCommand = Command.make("test", "-f", CONFIG_PATH)
    const existsResult = yield* executor.exitCode(fileCommand).pipe(
      catchTag("BadArgument", () => fail(configError("Invalid path"))),
      catchTag("SystemError", (e) =>
        fail(configError(`System error: ${e.message}`)),
      ),
    )

    if (existsResult !== 0) {
      return defaultConfig
    }

    const catCommand = Command.make("cat", CONFIG_PATH)
    const content = yield* executor.string(catCommand).pipe(
      catchTag("BadArgument", () => fail(configError("Invalid path"))),
      catchTag("SystemError", (e) =>
        fail(configError(`System error: ${e.message}`)),
      ),
    )

    try {
      const parsed = JSON.parse(content)
      if (!Array.isArray(parsed.repos)) {
        return defaultConfig
      }
      return { repos: parsed.repos as Repo[] }
    } catch {
      return defaultConfig
    }
  })
}

function writeConfigFile(
  config: Config,
): Effect<void, ConfigError, CommandExecutor.CommandExecutor> {
  return gen(function* writeConfigGen() {
    const executor = yield* CommandExecutor.CommandExecutor
    const content = JSON.stringify({ repos: config.repos }, null, 2)

    const tempPath = `${CONFIG_PATH}.tmp.${Date.now()}`
    const writeCommand = Command.make(
      "sh",
      "-c",
      `echo '${content.replace(/'/g, "'\\''")}' > ${tempPath} && mv ${tempPath} ${CONFIG_PATH}`,
    )
    yield* executor.exitCode(writeCommand).pipe(
      catchTag("BadArgument", () => fail(configError("Invalid path"))),
      catchTag("SystemError", (e) =>
        fail(configError(`System error: ${e.message}`)),
      ),
    )
  })
}

export const load: Effect<
  Config,
  ConfigError,
  CommandExecutor.CommandExecutor
> = gen(function* loadGen() {
  yield* ensureDirExists()
  return yield* readConfigFile()
})

export const addRepo = (
  url: string,
): Effect<Config, ConfigError, CommandExecutor.CommandExecutor> =>
  gen(function* addRepoGen() {
    const name = parseRepoName(url)
    const config = yield* readConfigFile()

    if (config.repos.some((repo) => repo.name === name)) {
      yield* fail(configError(`Repository ${name} already exists`))
    }

    const newConfig: Config = {
      repos: [...config.repos, { name, url }],
    }
    yield* writeConfigFile(newConfig)
    return newConfig
  })

export const removeRepo = (
  name: string,
): Effect<Config, ConfigError, CommandExecutor.CommandExecutor> =>
  gen(function* removeRepoGen() {
    const config = yield* readConfigFile()

    const filtered = config.repos.filter((repo) => repo.name !== name)
    if (filtered.length === config.repos.length) {
      yield* fail(configError(`Repository ${name} not found`))
    }

    const newConfig: Config = { repos: filtered }
    yield* writeConfigFile(newConfig)
    return newConfig
  })

export const live: Layer<
  ConfigService,
  never,
  CommandExecutor.CommandExecutor
> = succeed(ConfigService, {
  load: () => load,
  addRepo,
  removeRepo,
} as ConfigService)
