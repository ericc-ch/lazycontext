import { RGBA } from "@opentui/core"
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/react"
import { RepoList } from "./components/repo-list"
import { match } from "./lib/keybinds"
import { theme } from "./lib/theme"

export function App() {
  const renderer = useRenderer()
  const dimensions = useTerminalDimensions()

  useKeyboard((event) => {
    if (match(event, "toggle-console")) {
      renderer.console.toggle()
      return
    }

    if (match(event, "quit")) {
      renderer.destroy()
    }
  })

  const bgColor = () => theme.bg[1] ?? RGBA.fromHex("#0f0f14")
  const isWide = () => dimensions.width >= 100

  return (
    <>
      <box
        flexDirection={isWide() ? "row" : "column"}
        width="100%"
        height="100%"
        backgroundColor={bgColor()}
        paddingLeft={1}
        paddingRight={1}
        paddingTop={1}
        paddingBottom={1}
        gap={1}
      >
        <box
          flexDirection="column"
          flexGrow={isWide() ? 1 : 1}
          flexShrink={isWide() ? 1 : 1}
          flexBasis={0}
        >
          <RepoList />
        </box>
      </box>
    </>
  )
}
