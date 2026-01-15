# AGENTS.md

## Build Commands

```sh
bun --watch src/main.tsx      # Development server
bun run dev                   # Same as above
bun run format                # Run prettier on all files
bun run lint                  # Run oxlint with type-aware rules
bun run typecheck             # Run typescript compiler
```

## Testing

This project uses **vitest** for testing. Run all tests with:

```sh
bun test
```

Run a single test file:

```sh
bun test /path/to/file.test.ts
```

Run tests matching a pattern:

```sh
bun test --test-name-pattern="pattern"
```

## Language & Framework

- **Runtime**: Bun (not Node.js)
- **Language**: TypeScript with strict mode
- **UI Framework**: OpenTUI (Solid.js-based) with `@opentui/core` and `@opentui/solid`
- **Effect System**: Use `@effect/platform`, `@effect/platform-bun`, and the `effect` library
- **Database**: bun:sqlite for SQLite

## TypeScript Guidelines

Strict mode is enabled. Follow these rules:

- Enable `exactOptionalPropertyTypes`, `noImplicitOverride`, `noUncheckedIndexedAccess`
- Enable `noUnusedLocals` and `noUnusedParameters`
- Use `verbatimModuleSyntax` - import types with `import type`
- Set `noUncheckedSideEffectImports: true`

## Code Style

**Prettier** formatting is applied:

- No semicolons
- Experimental ternary operators enabled
- Operators at start of lines in multiline expressions

**Oxlint** rules enforced:

- No `any` type (`typescript/no-explicit-any`)
- No `forEach` - use `for...of` instead (`unicorn/no-array-for-each`)
- Use `Set.has()` instead of `Array.includes()` (`unicorn/prefer-set-has`)
- Use `find()` instead of `filter()[0]` (`unicorn/prefer-array-find`)
- Use `flatMap()` when chaining map+filter (`unicorn/prefer-array-flat-map`)
- Prefer `Array.isArray()` over `instanceof Array`
- Default case required in switch statements (`default-case`)
- No bitwise operators except shifts
- No parameter reassignment (`no-param-reassign`)
- Methods must use `this` or be static (`class-methods-use-this`)
- Use named exports over default exports where possible
- No commonjs requires - use ES imports only

## Import Conventions

```typescript
import type { SomeType } from "./module" // Type-only imports
import { Concrete, type SomeType } from "./module" // Mixed imports
import { TextAttributes } from "@opentui/core"
import { render } from "@opentui/solid"
import { Effect } from "effect"
import { HttpClient } from "@effect/platform"
```

## Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Types**: PascalCase (`UserRecord`, `CreateUserError`)
- **Interfaces**: Prefer type aliases over interfaces unless extending
- **Constants**: SCREAMING_SNAKE_CASE for config values
- **Effects**: Suffix with `Effect` (`fetchUsersEffect`)

## Error Handling

- Use `Effect.fail` or error types with Effect
- No `try/catch` blocks outside Effect context - use `Effect.catch`
- Always handle promise rejections with `.catch()` or use Effect's promise utilities

## Web APIs

- Use `Bun.serve()` for HTTP servers, not Express
- Use `bun:sqlite` for SQLite, not better-sqlite3
- Use `Bun.file()` instead of fs.readFile/writeFile
- Use `Bun.$` for subprocess execution

## OpenTUI Components

OpenTUI uses custom elements (not JSX in output):

```tsx
import { TextAttributes } from "@opentui/core"
import { render } from "@opentui/solid"

render(() => (
  <box alignItems="center" justifyContent="center" flexGrow={1}>
    <text attributes={TextAttributes.DIM}>Hello</text>
  </box>
))
```

## Configuration Files

- `tsconfig.json`: Strict TypeScript with Effect language service plugin
- `.oxlintrc.json`: Linting rules for imports, TypeScript, performance
- `.prettierrc.json`: Formatting with no semicolons
- `bunfig.toml`: Bun configuration

## Git Commit Style

Use conventional commits: `feat(scope)`, `fix(scope)`, `docs`, `refactor`, `test`
