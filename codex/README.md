# Codex dotfiles

This repository tracks only portable Codex files that are safe to publish:

- Personal skills under `skills/`: `ask`, `github`, `grill-me`, `sentry`, and
  `show-me`
- The vendored pstack plugin under `plugins/pstack/`
- The pstack model override under `codex/pstack-models.md`
- The Git marketplace manifest under `.agents/plugins/`
- Keybindings under `codex/`

Codex supplies its bundled and installed skills. Do not copy those into this
repository. This keeps app-managed skills, such as `hatch-pet`, on Codex's
upgrade path instead of pinning stale copies in dotfiles.

It intentionally excludes authentication, task history, memories, logs, caches, databases, MCP environment values, trusted-project paths, approval rules, and machine-specific state.

## Install the custom skills

From the cloned repository root:

```bash
mkdir -p "$HOME/.codex/skills"
for skill in ask github grill-me sentry show-me; do
  ln -sfn "$PWD/skills/$skill" "$HOME/.codex/skills/$skill"
done
ln -sfn "$PWD/codex/keybindings.json" "$HOME/.codex/keybindings.json"
ln -sfn "$PWD/codex/pstack-models.md" "$HOME/.codex/pstack-models.md"
```

The pstack override runs its `$interrogate` reviewer on `gpt-5.6-sol` with
`high` reasoning. Other pstack roles keep their plugin defaults.

## Install pstack from GitHub

```bash
codex plugin marketplace add Graffioh/dotfiles \
  --ref main \
  --sparse .agents/plugins \
  --sparse plugins/pstack
codex plugin add pstack@graffioh
```

To pick up a later version:

```bash
codex plugin marketplace upgrade graffioh
codex plugin add pstack@graffioh
```
