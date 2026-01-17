# Migration: SolidJS to React

## High Level Overview

Replace `@opentui/solid` and `solid-js` with `@opentui/react` and `react` across the entire project. This involves updating dependencies, TypeScript configuration, and refactoring all components to use React hooks and patterns instead of SolidJS reactivity.

## Tasks

### [ ] Task 1: Update Dependencies and Configuration

Update `package.json` and `tsconfig.json` to support React and `@opentui/react`.

#### Subtasks

- [x] Remove `solid-js` and `@opentui/solid` from `package.json`
- [x] Add `react`, `@types/react`, and `@opentui/react` to `package.json`
- [x] Update `tsconfig.json` to use `react-jsx` and `@opentui/react` as `jsxImportSource`

#### Implementation Guide

- Use `bun remove solid-js @opentui/solid`
- Use `bun add react @opentui/react` and `bun add -D @types/react`
- Modify `tsconfig.json`:
  - `"jsx": "react-jsx"`
  - `"jsxImportSource": "@opentui/react"`

Reference files:

- `package.json` - dependencies
- `tsconfig.json` - compiler options

### [x] Task 2: Refactor Main Entry Point

Update `src/main.tsx` to use the React root API.

#### Implementation Guide

- Change import from `@opentui/solid` to `@opentui/react`
- Replace `render(App, renderer)` with `createRoot(renderer).render(<App />)`

Reference files:

- `src/main.tsx` - entry point

### [x] Task 3: Refactor Core Application Component

Migrate `src/app.tsx` from SolidJS to React.

#### Implementation Guide

- Replace `createSignal` with `useState`
- Replace `onMount` with `useEffect`
- Update `useTerminalDimensions` usage (it returns an object `{ width, height }` in React, not a function)
- Replace `<Show>` and `<For>` with standard JSX patterns

Reference files:

- `src/app.tsx` - main application logic

### [ ] Task 4: Refactor UI Components

Migrate all components in `src/components/` to React.

#### Subtasks

- [x] Refactor `src/components/repo-list.tsx`
- [x] Refactor `src/components/repo-item.tsx`
- [x] Refactor `src/components/status-bar.tsx`
- [x] Refactor `src/components/command-log.tsx`
- [x] Refactor `src/components/add-repo.tsx`

#### Implementation Guide

- Replace SolidJS specific components (`<For>`, `<Show>`, `<Index>`) with standard JavaScript `map()` and conditional rendering
- Update hook imports to `@opentui/react`
- Ensure props are handled according to React conventions

Reference files:

- `src/components/*.tsx` - UI components

### [ ] Task 5: Verification and Cleanup

Ensure the application runs correctly and remove any leftover SolidJS traces.

#### Subtasks

- [x] Run `bun run start` and verify functionality
- [x] Run `bun run typecheck` to catch any remaining type issues
- [x] Remove any unused imports or files
