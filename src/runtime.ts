import {
  BunCommandExecutor,
  BunFileSystem,
  BunPath,
} from "@effect/platform-bun"
import { Layer, ManagedRuntime, pipe } from "effect"
import { Config } from "./services/config"
import { Git } from "./services/git"
import { Atom } from "@effect-atom/atom-react"

const AppLive = pipe(
  Layer.empty,
  Layer.merge(Config.Default),
  Layer.merge(Git.Default),
  Layer.provide(BunPath.layer),
  Layer.provide(BunCommandExecutor.layer),
  Layer.provide(BunFileSystem.layer),
)

export const runtime = ManagedRuntime.make(AppLive, Atom.runtime.memoMap)
export const runtimeAtom = Atom.runtime(AppLive)
