import { createContext, useContext, type ReactNode } from "react"
import { makeRuntime } from "../runtime"

const RuntimeContext = createContext<Awaited<
  ReturnType<typeof makeRuntime>
> | null>(null)

export function ProviderRuntime({
  children,
  runtime,
}: {
  children: ReactNode
  runtime: Awaited<ReturnType<typeof makeRuntime>>
}) {
  return (
    <RuntimeContext.Provider value={runtime}>
      {children}
    </RuntimeContext.Provider>
  )
}

export const useRuntime = () => {
  const context = useContext(RuntimeContext)
  if (!context) {
    throw new Error("useRuntime must be used within a ProviderRuntime")
  }
  return context
}
