# Repo List & Repo Item Implementation

## High Level Overview

Implement two components for managing repository operations:

- **RepoList**: Manages selection state and renders a list of repositories
- **RepoItem**: Displays individual repository status and handles clone/pull mutations

Both components integrate TanStack Query with Effect services for async git operations.

**Note**: Always use `src/lib/url.ts` for parsing GitHub URLs. The `parseGithubUrl` function handles URL validation and extraction of owner/repo components.

## Tasks

### Task 1: Implement RepoList component with selection state

#### Subtasks

- [x] Add `useState` for `selectedIndex` with default value `0`
- [x] Render `RepoItem` components for each repo from query data
- [x] Pass `url`, `isSelected`, and `onSelect` props to each `RepoItem`
- [x] Implement keyboard handling using `useKeyboard` hook (no useEffect)
- [x] Prevent navigation when no repos exist (handle `null`/`undefined` data)

#### Implementation Guide

The `RepoList` component will maintain selection state and render `RepoItem` components. Each item receives its URL and selection status.

Reference files:

- `src/components/repo-list.tsx` - Main component file
- `src/components/repo-item.tsx` - Child component to implement
- `src/lib/keybinds.ts` - Navigation keybindings (`navigate-down`, `navigate-up`)

#### Detailed Requirements

- Selection should wrap around? No, clamp to bounds
- When repos list changes (refetched), reset selection to index 0
- Handle empty repos array gracefully

---

### Task 2: Implement RepoItem component with status fetching

#### Subtasks

- [x] Create `useRepoStatus` hook using `useQuery` with `checkStatus` from Git service
- [x] Display status indicator with color coding:
- [x] Accept `isSelected` prop to apply highlighting style
- [x] Show repository name (derived from URL) and status text

#### Implementation Guide

The `RepoItem` fetches its own status using the Git service. It displays the repository name and current sync status. Uses `cwd + ".context/"` as the target directory (hardcoded for now).

Reference files:

- `src/components/repo-item.tsx` - Component to implement
- `src/services/git.ts` - Git service with `checkStatus` method
- `src/lib/url.ts` - URL parsing utilities (check for `parseGithubUrl`)

#### Detailed Requirements

- Use consistent color palette from `theme`
- Display repository name (not full URL) for better UX
- Show loading indicator while fetching status
- Handle errors gracefully with error state

---

### Task 3: Implement clone/pull mutations with keyboard shortcuts

#### Subtasks

- [x] Create `useSyncRepo` hook using `useMutation` for clone/pull operations
- [x] Invalidate `["repo-status", url]` cache after successful sync
- [x] Handle `repo-sync` keybinding (Enter) when item is selected
- [x] Show syncing state during mutation (disable interactions)
- [x] Display success/error feedback briefly after operation

#### Implementation Guide

When the user presses Enter on a selected repo, the component either clones (if missing) or pulls (if exists) the repository. The status cache is invalidated after a successful mutation.

Reference files:

- `src/services/git.ts` - Git service with `clone` and `pull` methods
- `src/lib/keybinds.ts` - `repo-sync` keybinding mapped to "enter"
- `src/components/repo-list.tsx` - Parent component handling selection

#### Detailed Requirements

- Determine operation (clone vs pull) based on current status
- Show loading state during mutation with "Cloning..." or "Pulling..." text
- Prevent multiple concurrent mutations on same repo
- Auto-refetch status after sync completes
- Handle GitError with user-friendly message display

---

### Task 4: Add visual styling and layout

#### Subtasks

- [ ] Style selected item with distinct background/border color from `theme`
- [ ] Use consistent spacing and typography
- [ ] Add status icon/indicator next to repo name
- [ ] Align items in row layout with status on right side
- [ ] Add hover effect (even without pointer events)

#### Implementation Guide

Visual design following the terminal-first aesthetic with bold colors and clear status indicators.

Reference files:

- `src/lib/theme.ts` - Theme colors and styles
- `@opentui/core` - Box, Text components with styling props

#### Detailed Requirements

- Selected item: bold text, distinct background (e.g., `theme.bg[3]`)
- Status: use both colors AND symbols:
  - `synced`: green background + checkmark (✓)
  - `modified`: yellow background + dots (…)
  - `missing`: red background + cross (✗)
  - `loading`: gray background + spinner
- Status indicator: color background + symbol on the right side
- Repo name truncated if too long with ellipsis
