import { describe, it, expect } from "bun:test"
import { parseGithubUrl } from "./url"
import { Effect } from "effect"

async function runParse(url: string) {
  return Effect.runPromise(parseGithubUrl(url))
}

async function runParseShouldFail(url: string) {
  return Effect.runPromiseExit(parseGithubUrl(url)).then((exit) => {
    if (exit._tag === "Failure") return true
    return false
  })
}

describe("parseGithubUrl", () => {
  it("parses standard HTTPS URL", async () => {
    const result = await runParse("https://github.com/owner/repo")
    expect(result).toEqual({ owner: "owner", repo: "repo" })
  })

  it("parses HTTPS URL with .git suffix", async () => {
    const result = await runParse("https://github.com/owner/repo.git")
    expect(result).toEqual({ owner: "owner", repo: "repo" })
  })

  it("parses SSH git URL", async () => {
    const result = await runParse("git@github.com:owner/repo")
    expect(result).toEqual({ owner: "owner", repo: "repo" })
  })

  it("parses SSH git URL with .git suffix", async () => {
    const result = await runParse("git@github.com:owner/repo.git")
    expect(result).toEqual({ owner: "owner", repo: "repo" })
  })

  it("parses org URL with dash", async () => {
    const result = await runParse("https://github.com/my-org/my-repo")
    expect(result).toEqual({ owner: "my-org", repo: "my-repo" })
  })

  it("parses repo name with dashes", async () => {
    const result = await runParse("https://github.com/owner/my-awesome-repo")
    expect(result).toEqual({ owner: "owner", repo: "my-awesome-repo" })
  })

  it("throws on non-GitHub URL", async () => {
    const failed = await runParseShouldFail("https://gitlab.com/owner/repo")
    expect(failed).toBe(true)
  })

  it("throws on invalid URL format", async () => {
    const failed = await runParseShouldFail("not-a-url")
    expect(failed).toBe(true)
  })

  it("throws on empty string", async () => {
    const failed = await runParseShouldFail("")
    expect(failed).toBe(true)
  })

  it("throws on URL with only owner", async () => {
    const failed = await runParseShouldFail("https://github.com/owner")
    expect(failed).toBe(true)
  })
})
