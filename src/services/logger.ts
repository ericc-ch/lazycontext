export interface LogEntry {
  readonly id: string
  readonly timestamp: Date
  readonly type: "info" | "success" | "error" | "command"
  readonly message: string
  readonly details?: string
}

const _logs: LogEntry[] = []

const createEntry = (
  type: LogEntry["type"],
  message: string,
  details?: string,
): LogEntry => ({
  id: crypto.randomUUID(),
  timestamp: new Date(),
  type,
  message,
  ...(details && { details }),
})

export const logStore = {
  getLogs: () => [..._logs],
  addLog: (entry: LogEntry) => {
    _logs.unshift(entry)
    if (_logs.length > 1000) {
      _logs.pop()
    }
  },
  clear: () => {
    _logs.length = 0
  },
}

export const logger = {
  log: (message: string, details?: string) => {
    console.log(message, details ?? "")
    logStore.addLog(createEntry("info", message, details))
  },

  info: (message: string, details?: string) => {
    console.log(message, details ?? "")
    logStore.addLog(createEntry("info", message, details))
  },

  success: (message: string, details?: string) => {
    console.log(message, details ?? "")
    logStore.addLog(createEntry("success", message, details))
  },

  error: (message: string, details?: string) => {
    console.error(message, details ?? "")
    logStore.addLog(createEntry("error", message, details))
  },

  command: (command: string, args: string[]) => {
    const fullCommand = [command, ...args].join(" ")
    console.log(`$ ${fullCommand}`)
    logStore.addLog(createEntry("command", fullCommand))
  },
}
