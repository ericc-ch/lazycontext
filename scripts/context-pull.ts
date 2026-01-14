import path from "node:path"
import fs from "node:fs"
import { exec } from "node:child_process"
import { promisify } from "node:util"
import os from "node:os"

const execAsync = promisify(exec)

const rootDir = path.join(import.meta.dirname, "..")
const contextRoot = path.join(rootDir, ".context")

if (!fs.existsSync(contextRoot)) {
  fs.mkdirSync(contextRoot)
}

export const repos = [
  {
    name: "alchemy",
    remote: "https://github.com/alchemy-run/alchemy.git",
    branch: "main",
  },

  {
    name: "orpc",
    remote: "https://github.com/unnoq/orpc.git",
    branch: "main",
  },

  {
    name: "better-auth",
    remote: "https://github.com/better-auth/better-auth.git",
    branch: "main",
  },
  {
    name: "drizzle-orm",
    remote: "https://github.com/drizzle-team/drizzle-orm.git",
    branch: "main",
  },

  {
    name: "zustand",
    remote: "https://github.com/pmndrs/zustand.git",
    branch: "main",
  },

  // tanstack
  {
    name: "tanstack-db",
    remote: "https://github.com/tanstack/db.git",
    branch: "main",
  },
  {
    name: "tanstack-form",
    remote: "https://github.com/tanstack/form.git",
    branch: "main",
  },
  {
    name: "tanstack-router",
    remote: "https://github.com/tanstack/router.git",
    branch: "main",
  },
]

async function parallelLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = []
  let index = 0

  async function runNext(): Promise<void> {
    while (index < tasks.length) {
      const currentIndex = index++
      try {
        const value = await tasks[currentIndex]!()
        results[currentIndex] = { status: "fulfilled", value }
      } catch (reason) {
        results[currentIndex] = { status: "rejected", reason }
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, runNext),
  )
  return results
}

async function processRepo(
  repo: (typeof repos)[number],
): Promise<{ name: string; action: "cloned" | "pulled" }> {
  const repoDir = path.join(contextRoot, repo.name)

  if (!fs.existsSync(repoDir)) {
    const cloneCmd = `git clone --depth 1 --branch ${repo.branch} ${repo.remote} ${repoDir}`
    await execAsync(cloneCmd)
    console.log(`✓ ${repo.name} (cloned)`)
    return { name: repo.name, action: "cloned" }
  } else {
    await execAsync("git pull", { cwd: repoDir })
    console.log(`✓ ${repo.name} (pulled)`)
    return { name: repo.name, action: "pulled" }
  }
}

const concurrency = os.cpus().length
console.log(
  `Processing ${repos.length} repos (concurrency: ${concurrency})...\n`,
)

const tasks = repos.map((repo) => () => processRepo(repo))
const results = await parallelLimit(tasks, concurrency)

const failed = results.filter(
  (r): r is PromiseRejectedResult => r.status === "rejected",
)

console.log()
if (failed.length > 0) {
  console.error(`Failed to process ${failed.length} repo(s):`)
  for (const f of failed) {
    console.error(`  - ${f.reason}`)
  }
  process.exit(1)
}

console.log("Done!")
