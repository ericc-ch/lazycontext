import { TextAttributes, RGBA } from "@opentui/core"
import { make } from "@effect-atom/atom/Atom"
import { useAtom } from "@effect-atom/atom-react"
import { RepoSchema } from "../services/config"
import { theme } from "../lib/theme"
import { parseGithubUrl } from "../lib/url"
import { Effect } from "effect"

export interface AddRepoProps {
  onAdd: (repo: RepoSchema) => void
  onCancel: () => void
}

export type AddRepoStatus = "idle" | "adding" | "cloning" | "success" | "error"

const AddRepoUrlAtom = make<string>("")
const AddRepoStatusAtom = make<AddRepoStatus>("idle")
const AddRepoErrorAtom = make<string | null>(null)

export function AddRepo(props: AddRepoProps) {
  const [url, setUrl] = useAtom(AddRepoUrlAtom)
  const [status, setStatus] = useAtom(AddRepoStatusAtom)
  const [, setError] = useAtom(AddRepoErrorAtom)

  const handleSubmit = async () => {
    const inputUrl = url.trim()
    if (!inputUrl) return

    setStatus("adding")

    const parseResult = await Effect.runPromiseExit(parseGithubUrl(inputUrl))
    if (parseResult._tag === "Failure") {
      setStatus("idle")
      setError("Invalid GitHub URL")
      return
    }

    props.onAdd(new RepoSchema({ url: inputUrl }))
    setStatus("success")
    setError(null)
  }

  return (
    <box
      flexDirection="column"
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
      backgroundColor={theme.bg[2] ?? RGBA.fromHex("#1a1b26")}
    >
      <box flexDirection="row" alignItems="center" gap={1}>
        <text
          fg={theme.info[0] ?? RGBA.fromHex("#00AAFF")}
          attributes={TextAttributes.BOLD}
        >
          Add Repository
        </text>
      </box>

      <box flexDirection="row" alignItems="center" gap={1} marginTop={1}>
        <text fg={theme.grays[5] ?? RGBA.fromHex("#888888")}>URL:</text>
        <input
          value={url}
          onInput={setUrl}
          onSubmit={handleSubmit}
          placeholder="https://github.com/user/repo.git"
          focused
          style={{
            flexGrow: 1,
            backgroundColor: theme.bg[2] ?? RGBA.fromHex("#1a1b26"),
            cursorColor: theme.info[0] ?? RGBA.fromHex("#00AAFF"),
          }}
        />
      </box>

      <box flexDirection="row" alignItems="center" gap={1} marginTop={1}>
        {status === "idle" ?
          <text
            fg={theme.fg[5] ?? RGBA.fromHex("#666666")}
            attributes={TextAttributes.DIM}
          >
            Press Enter to add, Escape to cancel
          </text>
        : status === "adding" ?
          <text fg={theme.info[0] ?? RGBA.fromHex("#00AAFF")}>
            Adding to config...
          </text>
        : status === "cloning" ?
          <text fg={theme.info[0] ?? RGBA.fromHex("#00AAFF")}>
            Cloning repository...
          </text>
        : status === "success" ?
          <text fg={theme.success[6] ?? RGBA.fromHex("#22c55e")}>
            Repository added successfully!
          </text>
        : status === "error" ?
          <text fg={theme.error[6] ?? RGBA.fromHex("#ef4444")}>
            Error occurred
          </text>
        : null}
      </box>
    </box>
  )
}
