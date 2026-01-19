import { useKeyboard, useRenderer } from "@opentui/react"
import { useTheme } from "./components/provider-theme"
import { RepoList } from "./components/repo-list"
import { match } from "./lib/keybinds"

export function App() {
  const renderer = useRenderer()
  const theme = useTheme()

  useKeyboard((event) => {
    if (match(event, "toggle-console")) {
      renderer.console.toggle()
      return
    }

    if (match(event, "quit")) {
      renderer.destroy()
    }
  })

  const bgColor = () => theme.bg[4]

  return (
    <>
      <box
        flexDirection="column"
        width="100%"
        height="100%"
        backgroundColor={bgColor()}
        paddingLeft={1}
        paddingRight={1}
        paddingTop={1}
        paddingBottom={1}
        gap={1}
      >
        <RepoList />
      </box>
    </>
  )
}
