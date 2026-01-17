import { make, withLabel } from "@effect-atom/atom/Atom"
import type { RepoSchema } from "../services/config"

export type Status = "synced" | "modified" | "missing"

export const reposAtom = withLabel(make<RepoSchema[]>([]), "repos")

export const statusesAtom = withLabel(
  make<Map<string, Status>>(new Map()),
  "statuses",
)

export const viewAtom = withLabel(make<"list" | "add">("list"), "view")

export const selectedIndexAtom = withLabel(make<number>(0), "selectedIndex")

export const editingIndexAtom = withLabel(
  make<number | null>(null),
  "editingIndex",
)

export const editingUrlAtom = withLabel(make<string>(""), "editingUrl")
