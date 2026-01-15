## Service Patterns

**Effect.Service** - Use when:

- Service implementation is fixed at compile time
- No need to swap implementations (e.g., mock in tests)
- Convenience of single class definition

**Context.Tag** - Use when:

- Service needs to be provided at runtime
- Implementation may be swapped (polymorphism)
- Multiple implementations exist (real vs mock, different strategies)

```typescript
// Effect.Service - fixed implementation
export class GitService extends Effect.Service<GitService>()("GitService", {
  accessors: true,
  effect: Effect.gen(function*() { ... }),
  dependencies: [BunCommandExecutor.layer],
}) {}

// Context.Tag - swappable implementation
export interface Database {
  readonly query: (sql: string) => Effect<Row[], DbError>
}
export const Database = Context.Tag<Database>("@app/Database")
```

**Effect.fn** - Use for functions that return effects (cleaner than `Effect.gen`):

```typescript
// Instead of:
const myEffect = (input: string) => Effect.gen(function* () { ... })

// Use:
const myEffect = Effect.fn(function* (input: string) { ... })
```

## Naming Conventions

- **Effects**: Suffix with `Effect` (`fetchUsersEffect`)

## Error Handling

- Use `yield* new ErrorType({ ... })` for yieldable errors (no need for `Effect.fail`)
- Define errors with `Data.TaggedError` for proper error class behavior
- No `try/catch` blocks outside Effect context - use `Effect.catch`
- Always handle promise rejections with `.catch()` or use Effect's promise utilities

```typescript
import { Data, Effect } from "effect"

export class GitError extends Data.TaggedError("GitError")<{
  readonly message: string
  readonly exitCode?: number
}> {}

// Use yield* directly, no Effect.fail needed
return yield * new GitError({ message: "Failed", exitCode: 1 })
```
