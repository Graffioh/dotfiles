# Pi setup

This is a fresh, package-only Pi configuration. Run:

```sh
./scripts/setup-pi.sh
```

The script installs the current `@earendil-works/pi-coding-agent`, links the tracked settings into `~/.pi/agent`, and installs the configured packages.

Installed resources:

- selected extensions and skills from `mitsuhiko/agent-stuff`
- `pi-markdown-preview`

The `agent-stuff` package tracks its default branch and is deliberately filtered in `agent/settings.json`. Run `pi update` to refresh unpinned packages.
