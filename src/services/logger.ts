import { PlatformLogger } from "@effect/platform"
import {
  Effect,
  Inspectable,
  Logger,
  LogLevel,
  pipe,
  SubscriptionRef,
} from "effect"
import path from "node:path"
import { PLUGIN_NAME, ProviderConfig } from "../services/config"
import { OpenCodeContext } from "../services/opencode"
import type { OpenCodeLogLevel } from "../types"

interface LogItem {
  level: LogLevel.Literal
  message: string
}

class MemoryLog extends Effect.Service<MemoryLog>()("MemoryLog", {
  accessors: true,
  effect: SubscriptionRef.make<LogItem[]>([]),
}) {}

const makeMemoryLogger = Effect.gen(function* () {
  const log = yield* MemoryLog.ref

  return Logger.make((log) => {
    let level: OpenCodeLogLevel = "debug"

    if (LogLevel.greaterThanEqual(log.logLevel, LogLevel.Error)) {
      level = "error"
    } else if (LogLevel.greaterThanEqual(log.logLevel, LogLevel.Warning)) {
      level = "warn"
    } else if (LogLevel.greaterThanEqual(log.logLevel, LogLevel.Info)) {
      level = "info"
    }

    Effect.ign

    const message = Inspectable.toStringUnknown(log.message)

    void openCode.client.app.log({
      body: {
        level,
        message,
        service: config.SERVICE_NAME,
      },
    })
  })
})

export const combinedLogger = Effect.gen(function* () {
  const openCodeLogger = yield* makeMemoryLogger
  const fileLogger = yield* pipe(
    Logger.jsonLogger,
    PlatformLogger.toFile(path.join(LOG_DIR, `${PLUGIN_NAME}.log`)),
  )
  Logger.rep
  return Logger.zip(openCodeLogger, fileLogger)
})
