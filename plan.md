# Plan: Replace Data Fetching and Effect Atoms with Placeholder Data

## High Level Overview

This plan removes all data fetching logic, Effect services, and `@effect-atom/atom` usage from the UI components. The application will be refactored to use standard React `useState` and hardcoded placeholder data. This simplifies the frontend and removes dependencies on backend services (filesystem and git).

## Tasks

### [x] Task 1: Refactor app.tsx to use React state and placeholder data

#### Subtasks

- [ ] Remove `@effect-atom/atom-react` imports
- [ ] Remove `Config` and `Git` service imports
- [ ] Replace atom hooks (`useAtom`, `useAtomValue`) with standard `useState`
- [ ] Implement `loadConfig` as a dummy function that sets initial placeholder repos
- [ ] Implement `checkAllStatuses`, `handleAddRepo`, `handleSyncRepo`, and `handleSyncAll` as dummy functions that only update local React state
- [ ] Remove all `serverRuntime.runPromise` calls

#### Implementation Guide

1. Define placeholder repositories and statuses at the top of `src/app.tsx` or in a new utility file.
2. Initialize `useState` hooks with these placeholders.
3. Update all event handlers to manipulate the local state directly without calling any Effect services.

Reference files:

- `src/app.tsx` - Main application component to be refactored

#### Detailed Requirements

- No `@effect-atom` usage in `app.tsx`
- No `Effect` usage in `app.tsx`
- App must be fully functional for UI testing with dummy data
- All TypeScript errors regarding missing atoms must be resolved

### [x] Task 2: Refactor add-repo.tsx to remove atoms and Effect logic

#### Subtasks

- [ ] Remove `@effect-atom/atom` and `@effect-atom/atom-react` imports
- [ ] Replace `useAtom` with `useState` for `url`, `status`, and `error`
- [ ] Replace `Effect.runPromiseExit(parseGithubUrl(...))` with a simple regex-based validator or a dummy success result
- [ ] Remove `Effect` and `parseGithubUrl` imports

#### Implementation Guide

1. Move `AddRepoUrlAtom`, `AddRepoStatusAtom`, and `AddRepoErrorAtom` into the component as local `useState` calls.
2. Simplify `handleSubmit` to perform local validation and then call `props.onAdd`.

Reference files:

- `src/components/add-repo.tsx` - Component to be refactored

#### Detailed Requirements

- No `@effect-atom` usage
- No `Effect` usage

### [x] Task 3: Refactor repo-item.tsx to remove atoms and Effect logic

#### Subtasks

- [ ] Remove `@effect-atom/atom` and `@effect-atom/atom-react` imports
- [ ] Replace `useAtom` with `useState` for `editUrl` and `parseError`
- [ ] Replace `Effect.runPromise(parseGithubUrl(...))` with simple dummy logic
- [ ] Remove `Effect`, `Config`, and `parseGithubUrl` imports

#### Implementation Guide

1. Move `RepoItemEditUrlAtom` and `RepoItemParseErrorAtom` into the component as local `useState` calls.
2. Update `handlePaste`, `handleInput`, and `handleSubmit` to work with local state.

Reference files:

- `src/components/repo-item.tsx` - Component to be refactored

#### Detailed Requirements

- No `@effect-atom` usage
- No `Effect` usage

### [ ] Task 4: Cleanup main.tsx and remove ProviderRuntime

#### Subtasks

- [ ] Remove `ProviderRuntime` usage in `src/main.tsx`
- [ ] Remove `ProviderRuntime` component in `src/components/provider-runtime.tsx` (or mark it as unused)
- [ ] Simplify `src/main.tsx` to just render `<App />` directly (optionally keeping the runtime if needed for other non-UI tasks, but the UI won't use it)

#### Implementation Guide

1. Refactor `main.tsx` to remove the `<ProviderRuntime>` wrapper.
2. If `ProviderRuntime` is no longer used anywhere, it can be deleted or its file emptied.

Reference files:

- `src/main.tsx`
- `src/components/provider-runtime.tsx`

### [ ] Task 5: Verification and Final Cleanup

#### Subtasks

- [ ] Run `bun run typecheck` to ensure all type errors are resolved
- [ ] Run `bun run start` to verify the TUI works with placeholder data
- [ ] Remove unused dependencies from `package.json` if confirmed (specifically `@effect-atom/atom` and `@effect-atom/atom-react`)

#### Implementation Guide

1. Ensure no `.tsx` file contains `Effect`, `serverRuntime`, or `Atom` references.
2. Confirm the UI feels responsive and behaves as expected with dummy data.

## Verification Section

- Run `bun run start`: The application should launch, show the placeholder repositories, and allow navigating through them.
- Interaction check: Pressing 'a' should open the add repo view. Entering a URL and pressing Enter should add it to the list.
- Sync check: Pressing Enter on a repo should toggle its status between "synced", "modified", and "missing" (or just show a dummy sync animation/log).
- Typecheck: `bun run typecheck` should return no errors.
