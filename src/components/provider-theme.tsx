import { useRenderer } from "@opentui/solid"
import {
  createContext,
  createResource,
  useContext,
  type ParentComponent,
} from "solid-js"
import {
  createColorPalette,
  createDefaultPalette,
  type ColorPalette,
} from "../lib/color"

const ThemeContext = createContext<() => ColorPalette>()

export const ThemeProvider: ParentComponent = (props) => {
  const renderer = useRenderer()

  const [theme] = createResource(renderer, createColorPalette, {
    initialValue: createDefaultPalette(),
  })

  return (
    <ThemeContext.Provider value={theme}>
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
