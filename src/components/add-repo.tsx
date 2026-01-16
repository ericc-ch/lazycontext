import { createSignal, Show } from "solid-js"
import { TextAttributes, RGBA } from "@opentui/core"
import { RepoSchema } from "../services/config"
import { useTheme } from "./provider-theme"

export interface AddRepoProps {
  onAdd: (repo: RepoSchema) => void
  onCancel: () => void
}

export type AddRepoStatus = "idle" | "adding" | "cloning" | "success" | "error"

export function AddRepo(props: AddRepoProps) {
  const [url, setUrl] = createSignal("")
  const [status, setStatus] = createSignal<AddRepoStatus>("idle")
  const theme = useTheme()

  const handleSubmit = () => {
    const inputUrl = url().trim()
    if (!inputUrl) return

    setStatus("adding")
    props.onAdd(new RepoSchema({ url: inputUrl }))
  }

  return (
    <box
      flexDirection="column"
      border
      borderColor={theme()?.fg[3] ?? RGBA.fromHex("#334455")}
      borderStyle="single"
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
    >
      <box flexDirection="row" alignItems="center" gap={1}>
        <text
          fg={theme()?.info[0] ?? RGBA.fromHex("#00AAFF")}
          attributes={TextAttributes.BOLD}
        >
          Add Repository
        </text>
      </box>

      <box flexDirection="row" alignItems="center" gap={1} marginTop={1}>
        <text fg={theme()?.grays[5] ?? RGBA.fromHex("#888888")}>URL:</text>
        <input
          value={url()}
          onInput={setUrl}
          onSubmit={handleSubmit}
          placeholder="https://github.com/user/repo.git"
          focused
          style={{
            flexGrow: 1,
            backgroundColor: theme()?.bg[2] ?? RGBA.fromHex("#1a1b26"),
            cursorColor: theme()?.info[0] ?? RGBA.fromHex("#00AAFF"),
          }}
        />
      </box>

      <box flexDirection="row" alignItems="center" gap={1} marginTop={1}>
        <Show
          when={status() === "idle"}
          fallback={
            <Show when={status() === "adding"}>
              <text fg={theme()?.info[0] ?? RGBA.fromHex("#00AAFF")}>
                Adding to config...
              </text>
            </Show>
          }
        >
          <text
            fg={theme()?.fg[5] ?? RGBA.fromHex("#666666")}
            attributes={TextAttributes.DIM}
          >
            Press Enter to add, Escape to cancel
          </text>
        </Show>
        <Show when={status() === "cloning"}>
          <text fg={theme()?.info[0] ?? RGBA.fromHex("#00AAFF")}>
            Cloning repository...
          </text>
        </Show>
        <Show when={status() === "success"}>
          <text fg={theme()?.success[6] ?? RGBA.fromHex("#22c55e")}>
            Repository added successfully!
          </text>
        </Show>
        <Show when={status() === "error"}>
          <text fg={theme()?.error[6] ?? RGBA.fromHex("#ef4444")}>
            Error occurred
          </text>
        </Show>
      </box>
    </box>
  )
}
