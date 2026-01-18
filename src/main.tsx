import { createRoot } from "@opentui/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { App } from "./app"
import { renderer } from "./lib/theme"
import { makeRuntime } from "./runtime"
import { ProviderRuntime } from "./components/provider-runtime"

const queryClient = new QueryClient()

async function main() {
  const runtime = await makeRuntime()
  renderer.on("destroy", () => {
    void runtime.dispose()
  })

  createRoot(renderer).render(
    <QueryClientProvider client={queryClient}>
      <ProviderRuntime runtime={runtime}>
        <App />
      </ProviderRuntime>
    </QueryClientProvider>,
  )
}

void main()
