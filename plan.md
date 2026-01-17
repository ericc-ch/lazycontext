# LazyContext State Migration

## High Level Overview

Migrate the application's state management from React's `useState` and `useEffect` to `effect-atom` to leverage Effect's ecosystem for better async handling, testability, and state isolation.

## Tasks

### [x] Task 1: Infrastructure Setup

Initialize the Atom Registry in the application root.

#### Implementation Guide

- Modify `src/main.tsx` to wrap the `App` component with `RegistryProvider`.

Reference files:

- `src/main.tsx`

#### Detailed Requirements

- Import `RegistryProvider` from `@effect-atom/atom-react`.
- Wrap `<App />` in `<RegistryProvider>`.

### [x] Task 2: Define Atom State

Create a centralized state definition using Atoms.

#### Subtasks

- [x] Create `src/state/atoms.ts` (or `src/state/` folder structure).
- [x] Define atoms for Domain State (Repos, Statuses).
- [x] Define atoms for UI State (Views, Selections, Edit forms).

#### Implementation Guide

- Create `src/state/atoms.ts` (or `src/state/atoms/` for modularity).
- Define `reposAtom` and `statusesAtom` using `Atom.make`.
- Define derived atoms if necessary (e.g. `syncedCountAtom`).
- Define UI atoms: `viewAtom`, `selectedIndexAtom`, `editingIndexAtom`.

#### Detailed Requirements

- **Domain State**:
  - `reposAtom`: `Atom<RepoSchema[]>`
  - `statusesAtom`: `Atom<Map<string, Status>>`
- **UI State**:
  - `viewAtom`: `Atom<"list" | "add">`
  - `selectedIndexAtom`: `Atom<number>`
  - `editingIndexAtom`: `Atom<number | null>`
  - `editingUrlAtom`: `Atom<string>`

### [x] Task 3: Migrate Low-Complexity Components

Refactor simple components to use atoms.

#### Subtasks

- [x] Refactor `src/components/add-repo.tsx`.
- [x] Refactor `src/components/repo-item.tsx`.

#### Implementation Guide

- **AddRepo**:
  - Replace `useState` for `url` and `status` with atoms (possibly local or scoped if appropriate, but global if shared).
  - Use `useAtom` or `useAtomSet`.
- **RepoItem**:
  - Replace local edit state with atoms if they need to be persisted or accessed globally, or keep them local if strict isolation is preferred (but `effect-atom` can handle local too via `useAtom` on a stable atom ref).

#### Detailed Requirements

- Components should no longer use `useState` for logic that affects the broader app or data persistence.

### [x] Task 4: Migrate App Component

Refactor the main App component to remove centralized state management.

#### Subtasks

- [x] Remove `useState<AppState>` from `src/app.tsx`.
- [x] Replace prop drilling with direct Atom usage in children where appropriate, or use Atoms in `App` and pass data.
- [x] Move async logic (loading config, checking statuses) to `Atom.make` with effects or `useAtomMount`/`Atom.fn`.

#### Implementation Guide

- Use `useAtomValue` for reading state.
- Use `useAtomSet` or `Atom.modify` for updates.
- Replace `useEffect` data fetching with Atom-based effects.

#### Detailed Requirements

- `App` component should be significantly simpler, acting mostly as a layout coordinator.
- All state logic moved to `src/state/`.
