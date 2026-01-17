import { createRoot } from "@opentui/react"
import { RegistryProvider } from "@effect-atom/atom-react"
import { App } from "./app"
import { renderer } from "./lib/theme"

createRoot(renderer).render(
  <RegistryProvider>
    <App />
  </RegistryProvider>,
)
