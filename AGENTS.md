# AGENTS.md

This codebase will outlive you. Every shortcut you take becomes someone else's burden. Every hack compounds into technical debt that slows the whole team down.
You are not just writing code. You are shaping the future of this project. The patterns you establish will be copied. The corners you cut will be cut again.
Fight entropy. Leave the codebase better than you found it.

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
- **UI Framework**: OpenTUI (React-based) with `@opentui/core` and `@opentui/react`
- **Effect System**: Use `@effect/platform`, `@effect/platform-bun`, and the `effect` library

## Code Conventions

Minimize explicit type annotations; let TypeScript infer types where possible

### Formatting

- Run `bun run format` before committing; formatting is enforced by CI
- Use 2 spaces for indentation; do not use tabs
- Maximum line length: 100 characters
- Use trailing commas in multi-line object and array literals
- Use semicolons consistently; the project uses them
- Format import statements alphabetically by module path within groups

### Import

```typescript
import type { SomeType } from "./module" // Type-only imports
import { Concrete, type SomeType } from "./module" // Mixed imports
import { TextAttributes } from "@opentui/core" // Use barrel import
```

### Type Annotations

- Prefer inference for local variables and function return types
- Explicitly type function parameters and public API surfaces
- Use generics instead of `any`; constrain with meaningful bounds
- Use branded types for domain primitives (e.g., `type UserId = string & { readonly brand: unique symbol }`)
- Avoid type assertions (`as`) when safer alternatives exist

## Design Principles

- **Intentional Aesthetics**: Commit to a bold direction before coding—minimalist, maximalist, retro, or experimental. Define purpose, tone, and what makes it unforgettable
- **Spatial Composition**: Use asymmetry, overlap, diagonal flow, and grid-breaking layouts. Create visual tension through unexpected spacing
- **Terminal Typography**: Choose fonts intentionally; avoid default monospace. Consider ANSI color palette, truecolor, and Unicode box-drawing characters
- **Accessibility First**: Support screen readers, keyboard navigation, and high-contrast modes. Ensure readability across terminal emulators
- **Expert Craftsmanship**: Every detail matters—consistent spacing, purposeful color choices, and refined interactions
- **Differentiation**: Avoid generic TUI patterns. Create memorable experiences through unique spatial relationships and visual language

## Context & References

When working with OpenTUI:

- Explore `.context/opentui/` for reference implementations
- Explore `.context/opentui/packages/react/` for React-specific patterns and examples

When working with Effect:

- Explore `.context/effect/` for reference implementations
- Read `https://effect.website/llms.txt` for index of Effect documentation

Use these as authoritative sources for API usage and coding conventions.

## Testing

- Write tests alongside implementation; use the `*.test.ts` naming convention
- Use Effect's `it` and `describe` from `@effect/testing` for consistency
- Mock dependencies using Effect's `MockContext` and `mockService` patterns
- Group related tests with `describe` blocks that match directory/file structure
- Test both success and failure paths; cover error scenarios thoroughly
- Keep test files close to implementation; co-locate in same directory when possible

## Error Handling

- Use Effect's `Cause` and `FiberFailure` for structured error representation
- Prefer `Effect.try` and `Effect.tryPromise` for synchronous and async operations that may throw
- Define specific error types using branded types or tagged error unions
- Use `Effect.catchAll` and `Effect.catchTag` for granular error handling
- Never swallow errors silently; log or propagate using Effect's error channels
- Validate inputs early and fail fast with descriptive error messages
- Avoid try-catch for control flow; use Effect's type-level error tracking instead

## Naming Conventions

- **Files**: kebab-case for components (`sidebar-layout.tsx`), snake_case for utilities (`fetch_api.ts`)
- **Variables**: camelCase for local variables and function parameters
- **Constants**: SCREAMING_SNAKE_CASE for compile-time constants, camelCase for Effect layer constants
- **Functions**: verb-noun pattern for actions (`createUser`, `fetchConfig`), predicate functions start with `is`/`has`/`can`
- **Types/Interfaces**: PascalCase for types, interfaces, and classes; prefix with `T` only for generic placeholders
- **Effect Layers**: suffix with `Layer` (e.g., `HttpClientLayer`, `DatabaseLayer`)
- **Effect Services**: suffix with `Service` (e.g., `LoggerService`, `ConfigService`)
- **Classes**: PascalCase; use singular nouns for entity classes (`User`, `Config`)
- **Booleans**: use positive phrasing (`isEnabled` over `isNotDisabled`)
- **Abbreviations**: avoid unless universally understood (use `config` over `cfg`, `http` over `httpClient`)

## Component Patterns

- Use functional components exclusively; no class components
- Props interfaces should be named `{ComponentName}Props` and exported when reused
- Keep components focused: single responsibility, extract complex logic to custom hooks
- Custom hooks must use `use` prefix and return typed results (`useCounter`, `useLocalStorage`)
- Memoize expensive computations with `useMemo` and callbacks with `useCallback`

## File Organization

- Organize by feature, not by type; group related components, hooks, and utilities together
- Barrel exports (`index.ts`) for public APIs only; avoid deep directory nesting
- Keep `src/` root for entry points and cross-cutting concerns
- Use absolute imports for project modules; relative imports only for sibling/triple-dot parent imports
- Place tests adjacent to implementation; use `__tests__` folder only for integration/e2e tests

## Performance

- Profile before optimizing; use OpenTUI's devtools to identify re-renders
- Use `useMemo` and `useCallback` sparingly; dependency arrays must be accurate
- Virtualize long lists with OpenTUI's `Virtual` component
- Lazy load routes and heavy components using `lazy` and `Suspense`
- Avoid object/array prop mutations; treat props as immutable
- Batch state updates when possible; prefer single state object over multiple useState calls

## Git Workflow

- Write conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Keep commits atomic and focused; one purpose per commit
- Use imperative mood in commit messages ("Add feature" not "Added feature")
- Squash WIP commits before merging; rebase onto main frequently
- Never commit directly to main; use feature branches and pull requests

## Priority Order for Documentation

1. Explore `.context/` directories for reference implementations and patterns
2. Only use the documentation tool (Context7) when information is not available in context or docs directories
3. Use `github_grep` to find real-world code examples from public repositories for implementation patterns and best practices
