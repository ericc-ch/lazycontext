import { createCliRenderer } from "@opentui/core"
import { render } from "@opentui/solid"
import { App } from "./app"
import { ThemeProvider } from "./components/provider-theme"
import { createColorPalette } from "./lib/color"
import { runtime } from "./runtime"

const main = async () => {
  const renderer = await createCliRenderer({
    onDestroy: () => {
      void runtime.dispose()
    },
  })
  const theme = await createColorPalette(renderer)

  await render(
    () => (
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    ),
    renderer,
  )
}

void main()
