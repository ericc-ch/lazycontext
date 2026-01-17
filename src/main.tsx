import { render } from "@opentui/solid"
import { App } from "./app"
import { renderer } from "./lib/theme"

await render(() => <App />, renderer)
