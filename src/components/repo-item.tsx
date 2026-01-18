import { RGBA } from "@opentui/core"
import { theme } from "../lib/theme"

export interface RepoItemProps {
  url: string
  isSelected: boolean
  onSelect: () => void
}

export function RepoItem(props: RepoItemProps) {
  return (
    <box
      backgroundColor={
        props.isSelected ?
          (theme.bg[3] ?? RGBA.fromHex("#2a2e3f"))
        : "transparent"
      }
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
    >
      <text>{props.url}</text>
    </box>
  )
}
