import { createContext, useContext, type ReactNode } from "react"
import { createColorPalette } from "../lib/color"

export type Theme = Awaited<ReturnType<typeof createColorPalette>>

const ThemeContext = createContext<Theme | null>(null)

export function ProviderTheme({
  children,
  theme,
}: {
  children: ReactNode
  theme: Theme
}) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ProviderTheme")
  }
  return context
}
