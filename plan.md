# lazycontext TUI Plan

## Goal

Create a TUI application using `@opentui`, `solid-js`, and `effect` to manage a collection of git repositories stored in `.context/`.

## Features

1.  **Repository List:** View all managed repositories.
2.  **Add Repository:** Input a Git URL to add a new repository.
    - Automatically infer name from URL.
    - **Default to remote's default branch** (standard `git clone` behavior).
    - Trigger clone immediately.
3.  **Sync (Clone/Pull):**
    - Clone missing repositories.
    - Pull existing repositories.
    - "Sync All" capability.
4.  **Configuration Persistence:** Store repository list in `lazycontext.json`.

## Architecture

### Tech Stack

- **Runtime:** Bun
- **UI:** `@opentui/solid`, `solid-js`
- **Logic/Side Effects:** `effect`
- **Git Operations:** `Bun.$` (via Effect)

### Data Structures

**`lazycontext.json`**

```json
{
  "repos": [
    {
      "name": "repo-name",
      "url": "https://github.com/user/repo.git"
    }
  ]
}
```

### Components (UI)

- `App`: Main layout coordinating RepoList, InputBar, and StatusBar.
- `RepoList`: Scrollable list of repositories. Displays name, status (synced/missing/modified), and last update.
- `InputBar`: Component for typing commands or URLs (e.g., for adding a repo).
- `StatusBar`: Global status or error messages.

### Services (Effect Layers)

1.  **ConfigService:**
    - `load()`: Read `lazycontext.json` (creates `.context/` dir if needed).
    - `addRepo(url)`: Parse URL, infer name, update config, save.
    - `removeRepo(name)`: Remove from config, save.
2.  **GitService:**
    - `clone(repo)`: `git clone --quiet ...`
    - `pull(repo)`: `git pull --quiet ...`
    - `checkStatus(repo)`: Check directory existence and `git status --porcelain`.

## Implementation Steps

- [ ] **Setup & Scaffolding**
  - [x] Create `plan.md` (This file).
  - [x] Ensure `.context` directory handling.

- [x] **Core Logic (Effect Services)**
  - [x] Implement `GitService`: `clone` (default branch) and `pull`.
  - [x] Implement `ConfigService` for managing `lazycontext.json`.

  - [ ] **UI Implementation**
    - [x] Create `RepoList` component.
    - [x] Create `AddRepo` functionality/component.
    - [x] Create `StatusBar` component for global status/errors.
    - [x] Connect UI to Services using Effect runtimes.

- [ ] **Integration**
  - [ ] Update `src/main.tsx` to mount the application.
  - [ ] Implement main App layout with RepoList, InputBar, and StatusBar.
  - [ ] Wire up "Add Repo" flow from UI to ConfigService.
  - [x] Wire up "Sync" flow (clone/pull) from UI to GitService.
  - [x] Implement "Sync All" functionality.
  - [ ] Verify full workflow end-to-end.
