import { createRoot } from "@opentui/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { App } from "./app"
import { makeRuntime } from "./runtime"
import { ProviderRuntime } from "./components/provider-runtime"
import { ProviderTheme } from "./components/provider-theme"

const queryClient = new QueryClient()

import { createCliRenderer } from "@opentui/core"
import { createColorPalette } from "./lib/color"

async function main() {
  const renderer = await createCliRenderer()
  const theme = await createColorPalette(renderer)
  const runtime = await makeRuntime()

  renderer.on("destroy", () => {
    void runtime.dispose()
  })

  createRoot(renderer).render(
    <QueryClientProvider client={queryClient}>
      <ProviderRuntime runtime={runtime}>
        <ProviderTheme theme={theme}>
          <App />
        </ProviderTheme>
      </ProviderRuntime>
    </QueryClientProvider>,
  )
}

void main()
