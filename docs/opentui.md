# OpenTUI + SolidJS Guide

A comprehensive developer guide for building terminal user interfaces with OpenTUI and SolidJS.

## Overview

OpenTUI is a cross-platform terminal UI framework that provides a React-like development experience for building terminal applications. The SolidJS package (`@opentui/solid`) offers declarative component-based UI building with SolidJS's fine-grained reactivity.

## Installation and Setup

> **Reference Files:**
>
> - [.context/opentui/packages/solid/package.json](.context/opentui/packages/solid/package.json)
> - [.context/opentui/packages/solid/tsconfig.json](.context/opentui/packages/solid/tsconfig.json)

### Prerequisites

- Bun runtime (version 1.0 or later recommended)
- TypeScript support

### Installation

```bash
bun install solid-js @opentui/solid
```

### Basic Application Structure

```tsx
// index.tsx
import { render } from "@opentui/solid"

const App = () => <text>Hello, World!</text>

render(App)
```

### Full Configuration Example

```tsx
// index.tsx
import { render } from "@opentui/solid"
import { ConsolePosition } from "@opentui/core"
import App from "./App"

render(App, {
  targetFps: 30,
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    maxStoredLogs: 1000,
    sizePercent: 40,
  },
})
```

## Core Concepts

### Renderables

> **Reference Files:**
>
> - [.context/opentui/packages/core/docs/renderables-vs-constructs.md](.context/opentui/packages/core/docs/renderables-vs-constructs.md)

OpenTUI uses a **Renderable** pattern to describe UI elements. There are two approaches:

**1. Imperative Approach** (direct instantiation):

```typescript
import {
  BoxRenderable,
  TextRenderable,
  InputRenderable,
  createCliRenderer,
} from "@opentui/core"

const renderer = await createCliRenderer()

const box = new BoxRenderable(renderer, {
  width: 20,
  height: 10,
  border: true,
})

const text = new TextRenderable(renderer, {
  content: "Hello",
})
box.add(text)
renderer.root.add(box)
```

**2. Declarative Approach** (JSX with SolidJS):

```tsx
import { render } from "@opentui/solid"

const App = () => (
  <box width={20} height={10} border>
    <text>Hello</text>
  </box>
)

render(App)
```

### Component Catalogue

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/index.ts](.context/opentui/packages/solid/src/index.ts)

OpenTUI provides a catalogue of built-in components that can be extended with custom renderables:

```tsx
import { extend } from "@opentui/solid"
import {
  BoxRenderable,
  type BoxOptions,
  type RenderContext,
} from "@opentui/core"

class CustomButton extends BoxRenderable {
  constructor(ctx: RenderContext, options: BoxOptions & { label?: string }) {
    super(ctx, options)
    this.borderStyle = "single"
    this.padding = 2
  }
}

extend({ customButton: CustomButton })

// Now you can use <customButton> in JSX
```

## Key Components

### Box

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/elements/index.ts](.context/opentui/packages/solid/src/elements/index.ts)

The fundamental container component for layout using Yoga layout engine.

```tsx
<box
  width={80}
  height={20}
  border
  borderStyle="single"
  borderColor="#00AAFF"
  backgroundColor="#001122"
  padding={2}
  marginTop={1}
  flexDirection="column"
  alignItems="center"
  justifyContent="center"
  gap={1}
>
  <text>Content goes here</text>
</box>
```

**Box Props:**

- `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`
- `flexGrow`, `flexShrink`, `flexBasis`
- `flexDirection`, `alignItems`, `justifyContent`, `gap`
- `border`, `borderStyle`, `borderColor`, `focusedBorderColor`
- `padding`, `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`
- `margin`, `marginLeft`, etc.
- `backgroundColor`, `textColor`
- `title`, `titleAlignment`
- `position` ("relative", "absolute")
- `left`, `top`, `zIndex`

### Text

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/elements/index.ts](.context/opentui/packages/solid/src/elements/index.ts)

Displays text content with optional styling.

```tsx
;<text content="Hello, World!" fg="#FFFFFF" bg="#000000" selectable={false} />

{
  /* Inline text with children */
}
;<text>
  Hello <b>World</b>!<span style={{ fg: "red" }}>Red text</span>
  <br />
  New line
</text>
```

**Text Styling:**

- Use `fg` for foreground color, `bg` for background color
- Use `attributes` for text attributes (from `TextAttributes`):

  ```tsx
  import { TextAttributes } from "@opentui/core"
  ;<text attributes={TextAttributes.BOLD | TextAttributes.ITALIC}>
    Bold and Italic
  </text>
  ```

**Text Modifiers:**

- `<b>` or `<strong>` - Bold text
- `<i>` or `<em>` - Italic text
- `<u>` - Underlined text
- `<a href="url">` - Clickable links
- `<br>` - Line break

### Input

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/elements/extras.ts](.context/opentui/packages/solid/src/elements/extras.ts)
> - [.context/opentui/packages/solid/examples/components/input-demo.tsx](.context/opentui/packages/solid/examples/components/input-demo.tsx)

Single-line text input component.

```tsx
const [value, setValue] = createSignal("")

<input
  value={value()}
  onInput={(newValue) => setValue(newValue)}
  onChange={(newValue) => console.log("Changed:", newValue)}
  onSubmit={(value) => console.log("Submitted:", value)}
  placeholder="Enter text..."
  focused
  cursorColor="#00AAFF"
  backgroundColor="#001122"
  focusedBackgroundColor="#003344"
/>
```

**Input Events:**

- `onInput(value)` - Called on every keystroke
- `onChange(value)` - Called when input changes (blur or enter)
- `onSubmit(value)` - Called when Enter is pressed

### Textarea

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/elements/extras.ts](.context/opentui/packages/solid/src/elements/extras.ts)
> - [.context/opentui/packages/solid/examples/components/textarea-demo.tsx](.context/opentui/packages/solid/examples/components/textarea-demo.tsx)

Multi-line text editor with full editing capabilities.

```tsx
<textarea
  initialValue="Initial content..."
  placeholder="Enter text..."
  textColor="#F0F6FC"
  selectionBg="#264F78"
  selectionFg="#FFFFFF"
  wrapMode="word"
  showCursor
  cursorColor="#4ECDC4"
  cursorStyle={{ style: "block", blinking: true }}
  focused
  style={{ flexGrow: 1 }}
/>
```

**Textarea Features:**

- Grapheme-aware cursor movement
- Unicode support (emoji, CJK characters)
- Text wrapping (word/char/none)
- Undo/redo (Ctrl+Z / Ctrl+Shift+Z)
- Word-based navigation and deletion
- Text selection with shift keys

### Select

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/elements/extras.ts](.context/opentui/packages/solid/src/elements/extras.ts)

List selection component with keyboard navigation.

```tsx
<select
  focused
  onSelect={(index, option) => console.log("Selected:", option)}
  options={[
    { name: "Option 1", value: 1, description: "First option" },
    { name: "Option 2", value: 2, description: "Second option" },
  ]}
  style={{
    height: "100%",
    backgroundColor: "transparent",
    focusedBackgroundColor: "transparent",
    selectedBackgroundColor: "#334455",
    selectedTextColor: "#FFFF00",
    descriptionColor: "#888888",
  }}
  showScrollIndicator
  wrapSelection
  fastScrollStep={5}
/>
```

### TabSelect

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/elements/extras.ts](.context/opentui/packages/solid/src/elements/extras.ts)
> - [.context/opentui/packages/solid/examples/components/tab-select-demo.tsx](.context/opentui/packages/solid/examples/components/tab-select-demo.tsx)

Tab-based navigation component.

```tsx
<tab_select
  focused
  onSelect={(index, option) => console.log("Selected tab:", option)}
  options={[{ name: "Tab 1" }, { name: "Tab 2" }, { name: "Tab 3" }]}
  style={{
    backgroundColor: "#001122",
    selectedBackgroundColor: "#00AAFF",
    selectedTextColor: "#FFFFFF",
  }}
/>
```

### ScrollBox

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/elements/extras.ts](.context/opentui/packages/solid/src/elements/extras.ts)
> - [.context/opentui/packages/solid/examples/components/scroll-demo.tsx](.context/opentui/packages/solid/examples/components/scroll-demo.tsx)

Scrollable container for large content.

```tsx
<scrollbox
  style={{
    width: "100%",
    height: "100%",
    flexGrow: 1,
    rootOptions: { backgroundColor: "#24283b", border: true },
    wrapperOptions: { backgroundColor: "#1f2335" },
    viewportOptions: { backgroundColor: "#1a1b26" },
    contentOptions: { backgroundColor: "#16161e" },
    scrollbarOptions: {
      showArrows: true,
      trackOptions: {
        foregroundColor: "#7aa2f7",
        backgroundColor: "#414868",
      },
    },
  }}
  focused
>
  {/* Content here */}
</scrollbox>
```

### Code

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/elements/extras.ts](.context/opentui/packages/solid/src/elements/extras.ts)
> - [.context/opentui/packages/solid/examples/components/code-demo.tsx](.context/opentui/packages/solid/examples/components/code-demo.tsx)

Syntax-highlighted code display.

```tsx
import { SyntaxStyle, RGBA } from "@opentui/core"

const syntaxStyle = SyntaxStyle.fromStyles({
  keyword: { fg: RGBA.fromHex("#ff6b6b"), bold: true },
  string: { fg: RGBA.fromHex("#51cf66") },
  comment: { fg: RGBA.fromHex("#868e96"), italic: true },
  number: { fg: RGBA.fromHex("#ffd43b") },
  default: { fg: RGBA.fromHex("#ffffff") },
})

<code
  content={`function hello() {
  // This is a comment
  const message = "Hello"
  return message
}`}
  filetype="javascript"
  syntaxStyle={syntaxStyle}
/>
```

### LineNumber

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/elements/extras.ts](.context/opentui/packages/solid/src/elements/extras.ts)
> - [.context/opentui/packages/solid/examples/components/line-number-demo.tsx](.context/opentui/packages/solid/examples/components/line-number-demo.tsx)

Line numbers with diff highlights and diagnostics.

```tsx
<line_number
  content={codeContent}
  showLineNumbers={true}
  lineNumberColor="#6b7280"
  activeLineNumberColor="#FFFFFF"
  highlightCurrentLine={true}
  highlightCurrentLineColor="#1f2937"
  showDiffHighlights={true}
  showDiagnostics={true}
/>
```

**LineNumber Methods:**

- `setLineColor(lineIndex, color)` - Set line background color
- `setLineSign(lineIndex, { before, after, beforeColor, afterColor })` - Add line signs

### ASCIIFont

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/elements/extras.ts](.context/opentui/packages/solid/src/elements/extras.ts)

ASCII art text rendering.

```tsx
<ascii_font
  text="HELLO"
  font="tiny"
  style={{
    color: "#00AAFF",
  }}
/>
```

### Diff

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/elements/extras.ts](.context/opentui/packages/solid/src/elements/extras.ts)
> - [.context/opentui/packages/solid/examples/components/diff-demo.tsx](.context/opentui/packages/solid/examples/components/diff-demo.tsx)

Side-by-side or unified diff viewer.

```tsx
<diff
  oldContent={originalCode}
  newContent={modifiedCode}
  viewMode="unified"
  syntaxStyle={syntaxStyle}
  addedLineColor="#1a4d1a"
  removedLineColor="#4d1a1a"
  unchangedLineColor="#333333"
/>
```

## Hooks

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/elements/hooks.ts](.context/opentui/packages/solid/src/elements/hooks.ts)

### useRenderer

Access the renderer instance for low-level operations.

```tsx
import { useRenderer } from "@opentui/solid"

const MyComponent = () => {
  const renderer = useRenderer()

  onMount(() => {
    renderer.setBackgroundColor("#001122")
  })

  // Access renderer properties
  console.log(renderer.width, renderer.height)

  return (
    <text>
      Renderer: {renderer.width}x{renderer.height}
    </text>
  )
}
```

### useKeyboard

Subscribe to keyboard events.

```tsx
import { useKeyboard } from "@opentui/solid"

useKeyboard((key) => {
  console.log("Key pressed:", key.name)
  console.log("Raw:", key.raw)
  console.log("Ctrl:", key.ctrl)
  console.log("Shift:", key.shift)
  console.log("Repeated:", key.repeated)

  if (key.name === "escape") {
    // Handle escape
  }
})

// With release events
useKeyboard(
  (key) => {
    if (key.eventType === "press") keys.add(key.name)
    else keys.delete(key.name)
  },
  { release: true },
)
```

### useTerminalDimensions

Get terminal dimensions with reactivity.

```tsx
import { useTerminalDimensions } from "@opentui/solid"

const MyComponent = () => {
  const dimensions = useTerminalDimensions()

  return (
    <text>
      Terminal: {dimensions().width}x{dimensions().height}
    </text>
  )
}
```

### usePaste

Handle paste events.

```tsx
import { usePaste } from "@opentui/solid"

usePaste((event) => {
  console.log("Pasted:", event.text)
  // Insert text into input
  inputRef?.insertText(event.text)
})
```

### useSelectionHandler

Track text selections.

```tsx
import { useSelectionHandler } from "@opentui/solid"

useSelectionHandler((selection) => {
  console.log("Selection:", selection.start, selection.end)
})
```

### useTimeline

Animation timeline for complex animations.

```tsx
import { useTimeline } from "@opentui/solid"

const MyComponent = () => {
  const timeline = useTimeline({ autoplay: true })

  // Add animations to timeline
  timeline.add({
    duration: 1000,
    onUpdate: (progress) => {
      /* animate */
    },
  })

  return <box>...</box>
}
```

### onResize

React to terminal resize events.

```tsx
import { onResize } from "@opentui/solid"

onResize((width, height) => {
  console.log("Terminal resized:", width, height)
})
```

## SolidJS Integration

> **Reference Files:**
>
> - [.context/opentui/packages/solid/examples/index.tsx](.context/opentui/packages/solid/examples/index.tsx)

### Control Flow

Use SolidJS's built-in control flow components:

```tsx
import { For, Index, Show, Switch, Match } from "solid-js"

// For arrays (re-runs when array changes)
<For each={items}>
  {(item) => <text>{item.name}</text>}
</For>

// For primitives (more efficient for index-based access)
<Index each={items}>
  {(item, index) => <text>{index()}: {item()}</text>}
</Index>

// Conditional rendering
<Show when={isVisible()} fallback={<text>Hidden</text>}>
  <text>Visible!</text>
</Show>

// Switch/match pattern
<Switch>
  <Match when={state() === "loading"}>
    <text>Loading...</text>
  </Match>
  <Match when={state() === "error"}>
    <text>Error!</text>
  </Match>
  <Match when={true}>
    <text>Content</text>
  </Match>
</Switch>
```

### Reactivity

Use SolidJS's signals and derived values:

```tsx
import { createSignal, createMemo, createEffect } from "solid-js"

const [count, setCount] = createSignal(0)
const doubled = createMemo(() => count() * 2)

createEffect(() => {
  console.log("Count changed:", count())
})

// Update
setCount(count() + 1)
```

### Stores

For nested reactivity:

```tsx
import { createStore } from "solid-js/store"

const [state, setState] = createStore({
  user: { name: "John", age: 30 },
  items: [
    { id: 1, name: "A" },
    { id: 2, name: "B" },
  ],
})

// Update nested property
setState("user", "name", "Jane")

// Update array item
setState("items", 0, "name", "Updated")

// Push to array
setState("items", (items) => [...items, { id: 3, name: "C" }])
```

## Event Handling

> **Reference Files:**
>
> - [.context/opentui/packages/solid/examples/components/mouse-demo.tsx](.context/opentui/packages/solid/examples/components/mouse-demo.tsx)

### Mouse Events

Handle mouse interactions on components:

```tsx
<box
  onMouseDown={(event) => console.log("Mouse down:", event.x, event.y)}
  onMouseUp={(event) => console.log("Mouse up:", event.x, event.y)}
  onMouseMove={(event) => console.log("Move:", event.x, event.y)}
  onClick={(event) => console.log("Click:", event.x, event.y)}
  onDoubleClick={(event) => console.log("Double click:", event.x, event.y)}
  onWheel={(event) => console.log("Wheel:", event.deltaY)}
>
  <text>Click me</text>
</box>
```

### Custom Event Handlers

Add custom event handlers via props:

```tsx
<box
  on:mydata={(event) => console.log("Custom event:", event.detail)}
  onCustomEvent={(data) => console.log("Custom prop event:", data)}
>
  <text>Events</text>
</box>
```

### Event Properties

- `x`, `y` - Mouse position
- `type` - Event type ("down", "up", "move", "drag", "drag-end", "click", "double-click", "wheel")
- `stopPropagation()` - Stop event from bubbling
- `preventDefault()` - Prevent default behavior

## Styling

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/types/elements.ts](.context/opentui/packages/solid/src/types/elements.ts)

### Style Prop

Components accept a `style` prop for styling:

```tsx
<box
  style={{
    width: 100,
    height: 50,
    backgroundColor: "#001122",
    border: true,
    borderStyle: "single",
    borderColor: "#00AAFF",
    padding: 2,
    fg: "#FFFFFF",
  }}
/>
```

### CSS-like Properties

- `backgroundColor`, `bg` - Background color
- `textColor`, `fg` - Text color
- `border`, `borderStyle`, `borderColor`
- `padding`, `margin` (with -Left, -Right, -Top, -Bottom variants)
- `opacity` - Transparency (0-1)
- `zIndex` - Layer ordering

### Color Formats

Colors can be specified as:

- Hex: `"#FF0000"` or `"#F00"`
- RGB: `RGBA.fromInts(255, 0, 0, 255)`
- RGBA values: `RGBA.fromValues(1.0, 0.0, 0.0, 1.0)`

```tsx
import { RGBA } from "@opentui/core"

// Pre-defined colors
<text bg="#FF0000">Red background</text>
<text bg={RGBA.fromHex("#00FF00")}>Green background</text>
<text bg={RGBA.fromInts(0, 0, 255, 255)}>Blue background</text>
```

## Custom Renderables

> **Reference Files:**
>
> - [.context/opentui/packages/core/src/types.ts](.context/opentui/packages/core/src/types.ts)
> - [.context/opentui/packages/solid/examples/components/extend-demo.tsx](.context/opentui/packages/solid/examples/components/extend-demo.tsx)

### Extending BoxRenderable

Create custom components by extending existing renderables:

```tsx
import {
  BoxRenderable,
  OptimizedBuffer,
  RGBA,
  type BoxOptions,
  type RenderContext,
} from "@opentui/core"
import { extend } from "@opentui/solid"

class ConsoleButtonRenderable extends BoxRenderable {
  private _label: string = "Button"

  constructor(ctx: RenderContext, options: BoxOptions & { label?: string }) {
    super(ctx, options)

    if (options.label) {
      this._label = options.label
    }

    this.borderStyle = "single"
    this.padding = 2
  }

  protected override renderSelf(buffer: OptimizedBuffer): void {
    super.renderSelf(buffer)

    const centerX = this.x + Math.floor(this.width / 2 - this._label.length / 2)
    const centerY = this.y + Math.floor(this.height / 2)

    buffer.drawText(
      this._label,
      centerX,
      centerY,
      RGBA.fromInts(255, 255, 255, 255),
    )
  }

  get label(): string {
    return this._label
  }

  set label(value: string) {
    this._label = value
    this.requestRender()
  }
}

// TypeScript module augmentation for proper typing
declare module "@opentui/solid" {
  interface OpenTUIComponents {
    consoleButton: typeof ConsoleButtonRenderable
  }
}

// Extend the component catalogue
extend({ consoleButton: ConsoleButtonRenderable })

// Usage
const App = () => (
  <consoleButton
    label="Click Me"
    style={{ border: true, backgroundColor: "green" }}
    onMouseUp={() => console.log("Clicked!")}
  />
)
```

### Creating from Scratch

For complete custom renderables, extend `Renderable`:

```tsx
import {
  Renderable,
  type RenderableOptions,
  type RenderContext,
  OptimizedBuffer,
} from "@opentui/core"

class CustomRenderable extends Renderable {
  constructor(ctx: RenderContext, options: RenderableOptions) {
    super(ctx, options)
    // Custom initialization
  }

  protected override renderSelf(buffer: OptimizedBuffer): void {
    // Custom rendering logic
    buffer.drawText("Custom", this.x, this.y, RGBA.white())
  }

  protected override onResize(width: number, height: number): void {
    // Handle resize
  }

  protected override onMouseEvent(event: MouseEvent): void {
    // Handle mouse events
    if (event.type === "click") {
      // Handle click
    }
  }
}
```

## Text Styling Functions

Use text styling functions for inline formatting:

```tsx
import { t, bold, fg, bg, underline, type TextAttributes } from "@opentui/core"

// Template literal style
const styled = t`${bold("Hello")} ${fg("#FF0000", "Red")} ${underline("Underlined")}`

// Chained styling
const complex = bold(underline(fg("#00AAFF", "Styled Text")))

// Text attributes constant
<text attributes={TextAttributes.BOLD | TextAttributes.ITALIC}>
  Bold and Italic
</text>
```

## Lifecycle

> **Reference Files:**
>
> - [.context/opentui/packages/solid/src/reconciler.ts](.context/opentui/packages/solid/src/reconciler.ts)

### Component Lifecycle

SolidJS components have these lifecycle hooks:

```tsx
import { onMount, onCleanup, onError } from "solid-js"

const MyComponent = () => {
  let interval: NodeJS.Timeout

  onMount(() => {
    console.log("Component mounted")
    interval = setInterval(() => {
      // Periodic update
    }, 1000)
  })

  onCleanup(() => {
    console.log("Component unmounting")
    clearInterval(interval)
  })

  onError((error) => {
    console.error("Error in component:", error)
  })

  return <text>Component</text>
}
```

### Renderable Lifecycle

Renderables have their own lifecycle methods:

```tsx
class CustomRenderable extends Renderable {
  protected override onMount(): void {
    // Called when renderable is added to tree
  }

  protected override onDestroy(): void {
    // Called when renderable is destroyed
    // Clean up resources here
  }

  protected override onFocus(): void {
    // Gained focus
  }

  protected override onBlur(): void {
    // Lost focus
  }

  protected override requestRender(): void {
    // Override to customize rendering behavior
  }
}
```

## Build and Distribution

> **Reference Files:**
>
> - [.context/opentui/packages/solid/scripts/build.ts](.context/opentui/packages/solid/scripts/build.ts)

### Building with Bun

```tsx
// build.ts
import solidPlugin from "@opentui/solid/bun-plugin"

await Bun.build({
  entrypoints: ["./index.tsx"],
  target: "bun",
  outdir: "./build",
  plugins: [solidPlugin],
  compile: {
    target: "bun-darwin-arm64",
    outfile: "myapp-macos",
  },
})
```

### Build Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "build:macos": "bun build.ts --target bun-darwin-arm64",
    "build:linux": "bun build.ts --target bun-linux-x64",
    "build:windows": "bun build.ts --target bun-windows-x64"
  }
}
```

## Debugging

> **Reference Files:**
>
> - [.context/opentui/packages/core/dev/keypress-debug.ts](.context/opentui/packages/core/dev/keypress-debug.ts)

### Debug Overlay

Toggle the debug overlay with `t` key:

```tsx
const renderer = useRenderer()

useKeyboard((key) => {
  if (key.name === "t") {
    renderer.toggleDebugOverlay()
  }
})
```

### Console

Show/hide the debug console with backtick key:

```tsx
useKeyboard((key) => {
  if (key.name === "`") {
    renderer.console.toggle()
  }
})
```

### Hit Grid

Dump the hit grid for debugging with `Ctrl+G`:

```tsx
useKeyboard((key) => {
  if (key.ctrl && key.name === "g") {
    renderer.dumpHitGrid()
  }
})
```

## Gotchas and Limitations

1. **Text Node Parent Requirement**: Text nodes must be children of a `<text>` component. Direct text children of `<box>` will cause errors:

   ```tsx
   // This works
   <box><text>Text</text></box>

   // This will error
   <box>Text</box>
   ```

2. **Imperative Child Addition**: When extending renderables, children must be explicitly added with `this.add(child)` or `this.add(child, index)`.

3. **Reactivity Scope**: Signals are only reactive within the component function scope. Moving refs or callbacks outside the component may break reactivity.

4. **Renderable References**: Use the `ref` prop to get references to renderable instances:

   ```tsx
   let inputRef: InputRenderable
   ;<input ref={(r) => (inputRef = r)} />
   ```

5. **Event Handler Names**: SolidJS uses camelCase event names (`onClick`), but OpenTUI also supports `on:` prefix for custom events (`on:mouse`).

6. **Module Augmentation**: When extending the component catalogue, you must use module augmentation to get proper TypeScript support.

7. **Preload Required**: The `@opentui/solid/preload` script must be in `bunfig.toml` for JSX to work correctly.

8. **Terminal Capabilities**: Some features (like hyperlinks with OSC 8) depend on terminal support.

## Complete Example

```tsx
// index.tsx
import { render } from "@opentui/solid"
import { ConsolePosition } from "@opentui/core"
import App from "./App"

render(App, {
  targetFps: 30,
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    maxStoredLogs: 1000,
    sizePercent: 40,
  },
})

// App.tsx
import { TextAttributes } from "@opentui/core"
import { createSignal, onMount, For } from "solid-js"
import { useRenderer, useKeyboard } from "@opentui/solid"

type Todo = { id: number; text: string; done: boolean }

const App = () => {
  const renderer = useRenderer()
  const [todos, setTodos] = createSignal<Todo[]>([])
  const [inputValue, setInputValue] = createSignal("")
  let inputRef: any

  onMount(() => {
    renderer.setBackgroundColor("#001122")
    inputRef?.focus()
  })

  useKeyboard((key) => {
    if (key.name === "escape") {
      process.exit(0)
    }
  })

  const addTodo = () => {
    if (!inputValue().trim()) return
    setTodos([...todos(), { id: Date.now(), text: inputValue(), done: false }])
    setInputValue("")
    inputRef?.focus()
  }

  const toggleTodo = (id: number) => {
    setTodos(todos().map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  return (
    <box width="100%" height="100%" padding={2} flexDirection="column" gap={1}>
      <text attributes={TextAttributes.BOLD} fg="#00AAFF">
        Todo List
      </text>

      <box flexDirection="row" gap={1}>
        <input
          ref={(r) => (inputRef = r)}
          value={inputValue()}
          onInput={setInputValue}
          onSubmit={addTodo}
          placeholder="Add a todo..."
          style={{ flexGrow: 1, backgroundColor: "#001122" }}
        />
      </box>

      <box border borderColor="#334455" flexDirection="column">
        <For each={todos()} fallback={<text fg="#666">No todos yet</text>}>
          {(todo) => (
            <box
              paddingLeft={1}
              paddingRight={1}
              backgroundColor={todo.done ? "#1a3a1a" : undefined}
              onClick={() => toggleTodo(todo.id)}
            >
              <text fg={todo.done ? "#00AA00" : "#FFFFFF"}>
                [{todo.done ? "X" : " "}] {todo.text}
              </text>
            </box>
          )}
        </For>
      </box>

      <text fg="#666" attributes={TextAttributes.DIM}>
        Press Enter to add, click to toggle, Escape to quit
      </text>
    </box>
  )
}

export default App
```

## Resources

- [OpenTUI GitHub](https://github.com/anomalyco/opentui)
- [SolidJS Documentation](https://www.solidjs.com/docs/latest)
- [Yoga Layout](https://yogalayout.com/) - Layout engine used by OpenTUI
