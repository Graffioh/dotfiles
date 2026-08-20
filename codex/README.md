# Codex dotfiles

This repository tracks only portable Codex files that are safe to publish:

- Custom skills under `skills/`
- Personal plugins under `plugins/`
- The Git marketplace manifest under `.agents/plugins/`
- Keybindings under `codex/`

It intentionally excludes authentication, task history, memories, logs, caches, databases, MCP environment values, trusted-project paths, approval rules, and machine-specific state.

## Install the custom skills

From the cloned repository root:

```bash
mkdir -p "$HOME/.codex/skills"
for skill in skills/*; do
  ln -sfn "$PWD/$skill" "$HOME/.codex/skills/$(basename "$skill")"
done
ln -sfn "$PWD/codex/keybindings.json" "$HOME/.codex/keybindings.json"
```

The glob skips the app-managed hidden `.system` directory.

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
