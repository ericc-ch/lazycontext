# AGENTS.md

## Commands

- `bun run start` — Run the application
- `bun run format` — Run prettier on all files
- `bun run lint` — Run oxlint with type-aware rules
- `bun run typecheck` — Run TypeScript compiler
- `bun test` — Run all tests
- `bun test /path/to/file.test.ts` — Run a single test file
- `bun test --test-name-pattern="pattern"` — Run tests matching a pattern

## Language & Framework

- **Runtime**: Bun (not Node.js)
- **Language**: TypeScript
- **UI Framework**: OpenTUI (Solid.js-based) with `@opentui/core` and `@opentui/solid` — `see docs/opentui.md`
- **Effect System**: Use `@effect/platform`, `@effect/platform-bun`, and the `effect` library

## Code Conventions

Minimize explicit type annotations; let TypeScript infer types where possible

### Import

```typescript
import type { SomeType } from "./module" // Type-only imports
import { Concrete, type SomeType } from "./module" // Mixed imports
import { TextAttributes } from "@opentui/core" // Use barrel import
import { render } from "@opentui/solid"
```

## Design Principles

- **Intentional Aesthetics**: Commit to a bold direction before coding—minimalist, maximalist, retro, or experimental. Define purpose, tone, and what makes it unforgettable
- **Spatial Composition**: Use asymmetry, overlap, diagonal flow, and grid-breaking layouts. Create visual tension through unexpected spacing
- **Terminal Typography**: Choose fonts intentionally; avoid default monospace. Consider ANSI color palette, truecolor, and Unicode box-drawing characters
- **Accessibility First**: Support screen readers, keyboard navigation, and high-contrast modes. Ensure readability across terminal emulators
- **Expert Craftsmanship**: Every detail matters—consistent spacing, purposeful color choices, and refined interactions
- **Differentiation**: Avoid generic TUI patterns. Create memorable experiences through unique spatial relationships and visual language

## Context & References

When working with OpenTUI:

- Read `docs/opentui.md` for components, hooks, styling, and patterns
- Explore `.context/opentui/` for reference implementations

When working with Effect:

- Read `docs/effect.md` for service patterns, error handling, and naming conventions
- Explore `.context/effect/` for reference implementations
- Read `https://effect.website/llms.txt` for index of Effect documentation

Do not use subagents when reading from `docs/*`
Use these as authoritative sources for API usage and coding conventions.

### Priority Order for Documentation

1. First, explore `.context/` directories for reference implementations and patterns
2. Then, read relevant `docs/*.md` files for API usage and conventions
3. Only use the documentation tool (Context7) when information is not available in context or docs directories
4. Use `github_grep` to find real-world code examples from public repositories for implementation patterns and best practices
