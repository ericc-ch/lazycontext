# Project Name: LazyContext UI Refactoring

## High Level Overview

Replace all data fetching logic with placeholder data to enable UI development without backend services, and fix missing atom definitions in the App component. This will make the TUI fully functional in a standalone mode.

## Tasks

### [ ] Task 1: Create state management and placeholder data

#### Subtasks

- [ ] Create `src/lib/state.ts`
- [ ] Define atoms for `repos`, `statuses`, `view`, `selectedIndex`, `editingIndex`, and `editingUrl`
- [ ] Define initial sample data for repositories and statuses
- [ ] Implement `mockParseGithubUrl` helper function

#### Implementation Guide

Create a central state management file using `@effect-atom/atom` to hold all application state that was previously being fetched or was missing.

Reference files:

- `src/lib/state.ts` - New file for atoms and placeholder data
- `src/services/config.ts` - For `RepoSchema` reference

#### Detailed Requirements

- Use `make` from `@effect-atom/atom/Atom` to create atoms
- Export all atoms for use in components
- Provide at least 3 sample repositories with different statuses

---

### [ ] Task 2: Refactor App component to use placeholder data

#### Subtasks

- [ ] Update imports in `src/app.tsx` to use atoms from `src/lib/state.ts`
- [ ] Remove `Config` and `Git` service imports
- [ ] Replace `loadConfig`, `checkAllStatuses`, `handleAddRepo`, `handleSyncRepo`, and `handleSyncAll` implementation
- [ ] Fix `serverRuntime` and other undefined references

#### Implementation Guide

Modify `src/app.tsx` to use the newly created atoms and replace all async Effect-based data fetching logic with synchronous (or simulated async) local state updates.

Reference files:

- `src/app.tsx` - Main application component refactoring

#### Detailed Requirements

- Remove all `serverRuntime.runPromise` calls
- Update `useEffect` to initialize state from sample data
- Ensure all handlers update the atom state correctly

---

### [ ] Task 3: Refactor AddRepo component

#### Subtasks

- [ ] Replace `Effect.runPromiseExit(parseGithubUrl(...))` with `mockParseGithubUrl`
- [ ] Clean up unused Effect and URL parsing imports

#### Implementation Guide

Update `src/components/add-repo.tsx` to use the mock URL parsing logic, removing dependencies on the Effect runtime for this component.

Reference files:

- `src/components/add-repo.tsx` - Add repo form refactoring

#### Detailed Requirements

- Component should still provide validation feedback but using the mock parser

---

### [ ] Task 4: Refactor RepoItem component

#### Subtasks

- [ ] Replace `Effect.runPromise(parseGithubUrl(...))` with `mockParseGithubUrl`
- [ ] Clean up unused imports (`Effect`, `Config`, `parseGithubUrl`)

#### Implementation Guide

Update `src/components/repo-item.tsx` to use mock URL parsing and remove all Effect-based async calls.

Reference files:

- `src/components/repo-item.tsx` - Repository item refactoring

#### Detailed Requirements

- Remove all `Effect.runPromise` calls
- Ensure inline editing still works with mock validation

---

### [ ] Task 5: Verification and Cleanup

#### Subtasks

- [ ] Run `bun run start` to verify UI functionality
- [ ] Run `bun run typecheck` to ensure no TS errors
- [ ] Run `bun test` to verify existing tests

#### Implementation Guide

Perform final checks to ensure the application runs correctly with placeholder data and that all TypeScript errors have been resolved.

#### Detailed Requirements

- Application must boot and display the repository list
- Navigating and syncing (simulated) should work visually
- Adding a repo should update the list in memory
