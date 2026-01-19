# LazyContext TUI Redesign

## 1. Problem & Motivation

- **Context**: The current TUI implementation is functionally "barebones" and lacks visual hierarchy. It is described as "messy" and unappealing.
- **User Pain Points**:
  - Poor readability due to lack of spacing and visual structure.
  - No immediate visibility of available actions (keybinds).
  - Generic, flat appearance that doesn't reflect the tool's power.

## 2. Success Criteria & End State

- **Vision**: A "Refined Industrial" aesthetic—clean, structured, and professional. The interface should feel solid, precise, and crafted.
- **Success Metrics**:
  - **Clarity**: Users can instantly parse the state of all repositories.
  - **Usability**: Keybindings are discoverable on-screen.
  - **Delight**: The interface uses typography and layout to create a satisfying user experience.

## 3. Scope, Constraints & Risks

- **In Scope**:
  - Visual overhaul of `RepoList` and `RepoItem`.
  - Implementation of a global `Layout` component (Header, Footer).
  - Typography and color improvements using the existing `ProviderTheme`.
- **Out of Scope**:
  - Changing core business logic (git operations, config loading).
  - Adding new features (like adding/removing repos via UI).
- **Constraints**:
  - Must rely on `@opentui/react` primitives.
  - Terminal color limitations (standard ANSI/RGB).

## 4. High Level Implementation Strategy

- **Design Direction**: **"Refined Industrial"**
  - **Typography**: Use distinct weights (Bold for Repo Names, Dim for Owner/Metadata).
  - **Layout**: Clear separation of concerns using a standard "Application Layout" (Header, Scrollable Content, Fixed Footer).
  - **Colors**: Monochromatic base (Grays) with purposeful signal colors (Green/Red/Yellow) only for status.
- **Architecture**:
  - **`components/layout.tsx`**: A wrapper component to enforce the Header/Main/Footer structure.
  - **`components/status-badge.tsx`**: A dedicated component for uniform status rendering.
  - **`components/keybind-bar.tsx`**: A bottom bar showing context-aware hotkeys.

## 5. Implementation Roadmap

### Phase 1: Structural Foundation

- Goal: Establish the screen layout and navigation hints.
- Key Deliverables:
  - [x] **`Layout` Component**: Create a reusable container with `Header` (Title/Stats), `Content` (Flex-grow), and `Footer` (Fixed).
  - [x] **`KeybindBar` Component**: A footer component displaying available actions (`↑/↓ Navigate`, `Enter Sync`, `A Sync All`, `Q Quit`).
  - [x] **`App` Refactor**: Update `App.tsx` to use the new `Layout` wrapper.

### Phase 2: List & Item Redesign

- Goal: Improve the readability and aesthetics of the main list.
- Key Deliverables:
  - [x] **`RepoItem` Layout**: Refactor to use `justifyContent="space-between"`. Split URL into `owner / **repo**` for better scanning.
  - [x] **`StatusBadge`**: Create a pill-shaped or bracketed status indicator (e.g., `[ UP TO DATE ]`) with dynamic coloring.
  - [x] **Visual Hierarchy**: Apply specific theme colors (dim gray for owner, bright white for repo name) to reduce visual noise.

### Phase 3: Visual Polish

- Goal: Add final touches to spacing and borders.
- Key Deliverables:
  - [x] **Borders & Separators**: Add box-drawing borders around the main list or header to frame the content.
  - [ ] **Padding & Margins**: Tune the whitespace between items and container edges.
  - [ ] **Loading States**: Improve the visual feedback for loading/syncing (e.g., better spinner or progress text).
