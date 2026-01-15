import { BunFileSystem, BunPath } from "@effect/platform-bun"
import { Effect, Layer, ManagedRuntime } from "effect"
import { GitService } from "./services/git"
import { ConfigService } from "./services/config"

const PlatformLayer = Layer.merge(BunFileSystem.layer, BunPath.layer)

const AppLayer = Layer.merge(GitService.Default, ConfigService.Default).pipe(
  Layer.provide(PlatformLayer),
)

export const runtime = ManagedRuntime.make(AppLayer)

export const runApp = <A, E>(
  effect: Effect.Effect<A, E, GitService | ConfigService>,
) => {
  return runtime.runPromise(effect)
}
