# LazyContext

## 1. Problem & Motivation

- **Context**: Developers often need to manage multiple related git repositories (contexts) and keep them synchronized. Doing this manually for each repo is repetitive.
- **Goal**: Create a TUI tool that reads a readonly configuration (`lazycontext.json`), displays the status of listed repositories, and allows quick synchronization (clone/pull) individually or in bulk.
- **Current Issues**:
  - The codebase has type errors preventing compilation.
  - The "Sync All" feature is missing.
  - Keybindings are not intuitive/configured as requested.
  - The UI theme does not blend with the user's terminal background.

## 2. Success Criteria & End State

- **Functional**:
  - Application compiles with 0 type errors.
  - User can navigate the list of repositories using Arrow keys (Up/Down) or j/k.
  - `s` (lowercase) syncs the currently highlighted repository.
  - `S` (uppercase/Shift+s) syncs ALL repositories sequentially or in parallel.
  - UI accurately reflects the state: "missing", "up to date", "behind" (with count), "modified", "syncing", "error".
- **Visual**:
  - Main background is transparent (matches terminal background).
  - Highlighted item is clearly visible.
- **Configuration**:
  - Reads `lazycontext.json` for repository list (Read-only).

## 3. Scope, Constraints & Risks

- **In Scope**:
  - Fixing TypeScript errors in `src/components/repo-item.tsx` and tests.
  - Implementing "Sync All" logic in `src/components/repo-list.tsx`.
  - Updating keybindings in `src/lib/keybinds.ts`.
  - Adjusting theme in `src/app.tsx`.
- **Out of Scope**:
  - Editing `lazycontext.json` via UI.
  - Handling merge conflicts (fail fast or standard git error).
  - adding new repos via UI.
- **Risks**:
  - "Sync All" might trigger rate limits if many repos are synced concurrently (mitigate with concurrency limit or sequential).
  - Git operations might fail due to auth (ssh keys assumed to be set up).

## 4. High Level Implementation Strategy

- **Type Safety**: Introduce a proper type guard `isRepoStatus` to differentiate between `UiStatus` strings ("loading", "syncing") and `RepoStatus` objects (from backend). Refactor `RepoItem` to use this safe discrimination.
- **Keybindings**: Map `s` to `repo-sync` and `S` (or `shift+s`) to `repo-sync-all`.
- **State Management**:
  - `RepoItem` manages its own sync state.
  - `RepoList` needs to trigger syncs on all items. This can be done by exposing a ref or using a shared query/mutation context, or simply firing multiple mutations from the parent. Given the setup, triggering individual mutations from parent might be cleanest, or a bulk operation in `Git` service.
  - _Decision_: Keep `RepoItem` autonomous for single sync. For "Sync All", `RepoList` will iterate over `repos.data` and call the `clone` or `pull` mutation for each URL.
- **Theme**: Remove specific background color in `App` to allow transparency.

## 5. Implementation Roadmap (Milestones)

### Phase 1: Fix & Stabilize

- Goal: Get the app running without errors.
- Key Deliverables:
  - [x] **Type Fixes**: Fix `UiStatus` vs `RepoStatus` mismatch in `src/components/repo-item.tsx`.
  - [x] **Test Fixes**: Resolve `unknown` type errors in `src/services/git.test.ts`.

### Phase 2: Core Interactions

- Goal: Implement requested keybinds and sync logic.
- Key Deliverables:
  - [x] **Keybind Config**: Update `src/lib/keybinds.ts` (Sync=`s`, SyncAll=`S`).
  - [x] **Sync One**: Update `RepoItem` to respond to the new keybind.
  - [x] **Sync All**: Implement `S` handler in `RepoList` to trigger sync for all listed repositories.

### Phase 3: Visual Polish

- Goal: Match terminal aesthetics.
- Key Deliverables:
  - [x] **Transparent Background**: Update `src/app.tsx` to remove hardcoded background color.
  - [x] **Highlighting**: Ensure navigation highlight remains visible against transparent background.
