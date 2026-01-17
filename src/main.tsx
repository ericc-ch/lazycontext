import { createRoot } from "@opentui/react"
import { App } from "./app"
import { renderer } from "./lib/theme"

createRoot(renderer).render(<App />)
