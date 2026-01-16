import { createContext, useContext, type ParentComponent } from "solid-js"
import { createColorPalette } from "../lib/color"

type Theme = Awaited<ReturnType<typeof createColorPalette>>

const ThemeContext = createContext<() => Theme>()

export const ThemeProvider: ParentComponent<{ theme: Theme }> = (props) => {
  return (
    <ThemeContext.Provider value={() => props.theme}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}
