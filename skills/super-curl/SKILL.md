---
name: super-curl
description: Send configured HTTP requests (named endpoints, JWT, templates, SSE). Use for API testing, webhooks, or scripted calls without the Pi extension. Prefer this skill when the user wants curl-like requests with shared config.
---

# Super-curl (portable)

HTTP client with the same behavior as pi-super-curl’s `send-request` script, but **loads `config.json` from this directory first** (then falls back to `.pi-super-curl/config.json` in the tree or home).

## Setup

1. Copy `config.example.json` to `config.json` in this folder (or pass `--config /path/to/config.json`).
2. Fill `baseUrl`, `auth`, `endpoints` / `templates`, and optional `envFile` as needed.
3. Run with `node` (no extra npm deps).

## Usage

Resolve the script path (this repo, symlinked Cursor skill, or absolute path):

```bash
SCRIPT="/absolute/path/to/dotfiles/skills/super-curl/send-request.cjs"
node "$SCRIPT" GET @get
```

Common flags: `--body '{...}'`, `--header 'Name: value'`, `--stream`, `--save`, `--repeat N`, `--config /path/to/config.json`.

## Install in Cursor

Symlink or copy this folder to a location Cursor loads user skills from (for example `~/.cursor/skills-cursor/super-curl` on your machine, or a project’s `.cursor/skills/super-curl`).

## Notes

- Template variables: `{{uuid}}`, `{{uuidv7}}`, `{{timestamp}}`, `{{env.VAR}}`, etc.
- Optional TTFT metrics require the `ttft-ui` helper on disk; otherwise streaming still works without TTFT.
- **Do not commit real secrets**; keep `config.json` local or use env vars / `envFile`.
