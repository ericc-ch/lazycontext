import { render } from "@opentui/solid"
import { App } from "./app"
import { ThemeProvider } from "./components/provider-theme"

void render(() => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
))
