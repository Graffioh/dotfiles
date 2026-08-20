### Opening a PR

Invoked at the end of every other playbook.

**Worktree.** Prefer a git worktree off main for isolated PR work. Give parallel writers separate worktrees or branches. Preserve dirty and unrelated user changes. Never reset, discard, or patch out user work without explicit approval; create a fresh worktree instead.

**Commits.** Commit liberally; rebase into small, ordered commits before opening PRs. Each commit is a future PR: landable, ordered to tell the story. Amend when the fix belongs in a just-made commit; new commit when separable.

**PRs.** Run a focused code-cleanup pass before commit; run `$no-comments` before review; apply **unslop** to the PR description and commit bodies. Prefer small, ordered PRs with the stack visible to reviewers. `gh pr view <number>` before referencing PR status. Do not open, update, or merge a PR unless the user authorized that external action.

A subagent that opens a PR runs `interrogate`, a focused code-cleanup pass, and `$no-comments`, returns the URL, and does NOT babysit. Return to the parent.
