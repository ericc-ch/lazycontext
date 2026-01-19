import type { ReactNode } from "react"
import { useTheme } from "./provider-theme"

export interface LayoutProps {
  header?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function Layout(props: LayoutProps) {
  const theme = useTheme()

  return (
    <box
      flexDirection="column"
      width="100%"
      height="100%"
      backgroundColor={theme.bg[0] ?? "black"}
    >
      {props.header && (
        <box
          flexShrink={0}
          flexDirection="column"
          paddingLeft={1}
          paddingRight={1}
          paddingTop={1}
          paddingBottom={1}
        >
          {props.header}
        </box>
      )}
      <box flexDirection="column" flexGrow={1} overflow="hidden" border={true}>
        {props.children}
      </box>
      {props.footer && (
        <box
          flexShrink={0}
          flexDirection="column"
          paddingLeft={1}
          paddingRight={1}
          paddingTop={1}
          paddingBottom={1}
        >
          {props.footer}
        </box>
      )}
    </box>
  )
}
