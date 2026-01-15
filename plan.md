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
4.  **Configuration Persistence:** Store repository list in `.context/config.json`.

## Architecture

### Tech Stack

- **Runtime:** Bun
- **UI:** `@opentui/solid`, `solid-js`
- **Logic/Side Effects:** `effect`
- **Git Operations:** `Bun.$` (via Effect)

### Data Structures

**`.context/config.json`**

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

- `App`: Main layout.
- `RepoList`: Scrollable list of repositories. Displays name, status (synced/missing), and last update.
- `InputBar`: Component for typing commands or URLs (e.g., for adding a repo).
- `StatusBar`: Global status or error messages.

### Services (Effect Layers)

1.  **ConfigService:**
    - `load()`: Read `.context/config.json` (or create default).
    - `addRepo(url)`: Parse URL, update config, save.
    - `removeRepo(name)`: Remove from config, save.
2.  **GitService:**
    - `clone(repo)`: `git clone ...`
    - `pull(repo)`: `git pull ...`
    - `checkStatus(repo)`: Check if directory exists, maybe `git status`.

## Implementation Steps

- [ ] **Setup & Scaffolding**
  - [x] Create `plan.md` (This file).
  - [x] Ensure `.context` directory handling.

- [ ] **Core Logic (Effect Services)**
  - [x] Implement `GitService`: `clone` (default branch) and `pull`.
  - [ ] Implement `ConfigService` for managing `.context/config.json`.

- [ ] **UI Implementation**
  - [ ] Create `RepoList` component.
  - [ ] Create `AddRepo` functionality/component.
  - [ ] Connect UI to Services using Effect runtimes.

- [ ] **Integration**
  - [ ] Update `src/main.tsx` to mount the application.
  - [ ] Verify "Add Repo" flow.
  - [ ] Verify "Sync" flow.
