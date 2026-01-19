import { useKeyboard, useRenderer } from "@opentui/react"
import { RGBA, TextAttributes } from "@opentui/core"
import { RepoList } from "./components/repo-list"
import { Layout } from "./components/layout"
import { KeybindBar } from "./components/keybind-bar"
import { match } from "./lib/keybinds"
import { useTheme } from "./components/provider-theme"

function AppHeader() {
  const theme = useTheme()

  return (
    <box flexDirection="column">
      <text
        fg={theme.primary[0] ?? RGBA.fromHex("#00ffff")}
        attributes={TextAttributes.BOLD}
        truncate={true}
      >
        LazyContext
      </text>
      <text fg={theme.grays[0] ?? RGBA.fromHex("#888888")} truncate={true}>
        Git repository manager
      </text>
    </box>
  )
}

export function App() {
  const renderer = useRenderer()

  useKeyboard((event) => {
    if (match(event, "toggle-console")) {
      renderer.console.toggle()
      return
    }

    if (match(event, "quit")) {
      renderer.destroy()
    }
  })

  return (
    <Layout
      header={<AppHeader />}
      footer={
        <box border={true}>
          <KeybindBar />
        </box>
      }
    >
      <RepoList />
    </Layout>
  )
}
