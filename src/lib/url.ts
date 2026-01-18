import { Data, Effect } from "effect"
import { regex } from "arkregex"

export class UrlError extends Data.TaggedError("UrlError")<{
  message: string
}> {}

const githubUrlRegex = regex(
  "(?:https://|git@)github\\.com[/:](?<owner>[^/]+)/(?<repo>[^/]+?)(?:\\.git)?$",
)

export const parseGithubUrl = Effect.fn(function* (url: string) {
  const match = url.match(githubUrlRegex)
  if (!match || !match.groups) {
    return yield* new UrlError({ message: `Invalid GitHub URL: ${url}` })
  }

  const owner = match.groups.owner
  const repo = match.groups.repo
  if (owner === undefined || repo === undefined) {
    return yield* new UrlError({ message: `Invalid GitHub URL: ${url}` })
  }

  return { owner, repo }
})
