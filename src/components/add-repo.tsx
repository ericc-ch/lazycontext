import { createSignal, Show } from "solid-js"
import { TextAttributes } from "@opentui/core"
import { Repo } from "../services/config"

export interface AddRepoProps {
  onAdd: (repo: Repo) => void
  onCancel: () => void
}

export type AddRepoStatus = "idle" | "adding" | "cloning" | "success" | "error"

export function AddRepo(props: AddRepoProps) {
  const [url, setUrl] = createSignal("")
  const [status, setStatus] = createSignal<AddRepoStatus>("idle")

  const handleSubmit = () => {
    const inputUrl = url().trim()
    if (!inputUrl) return

    setStatus("adding")
    props.onAdd(new Repo({ url: inputUrl }))
  }

  return (
    <box
      flexDirection="column"
      border
      borderColor="#334455"
      borderStyle="single"
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
    >
      <box flexDirection="row" alignItems="center" gap={1}>
        <text fg="#00AAFF" attributes={TextAttributes.BOLD}>
          Add Repository
        </text>
      </box>

      <box flexDirection="row" alignItems="center" gap={1} marginTop={1}>
        <text fg="#888888">URL:</text>
        <input
          value={url()}
          onInput={setUrl}
          onSubmit={handleSubmit}
          placeholder="https://github.com/user/repo.git"
          focused
          style={{
            flexGrow: 1,
            backgroundColor: "#1a1b26",
            cursorColor: "#00AAFF",
          }}
        />
      </box>

      <box flexDirection="row" alignItems="center" gap={1} marginTop={1}>
        <Show
          when={status() === "idle"}
          fallback={
            <Show when={status() === "adding"}>
              <text fg="#00AAFF">Adding to config...</text>
            </Show>
          }
        >
          <text fg="#666666" attributes={TextAttributes.DIM}>
            Press Enter to add, Escape to cancel
          </text>
        </Show>
        <Show when={status() === "cloning"}>
          <text fg="#00AAFF">Cloning repository...</text>
        </Show>
        <Show when={status() === "success"}>
          <text fg="#22c55e">Repository added successfully!</text>
        </Show>
        <Show when={status() === "error"}>
          <text fg="#ef4444">Error occurred</text>
        </Show>
      </box>
    </box>
  )
}
