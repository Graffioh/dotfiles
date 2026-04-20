#!/usr/bin/env bash
# Symlink ~/.config/nvim -> this repo's nvim/ so edits and lazy-lock.json live in git.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="${REPO_ROOT}/nvim"
TARGET="${XDG_CONFIG_HOME:-$HOME/.config}/nvim"

if [[ ! -d "$SOURCE" ]]; then
  echo "Expected LazyVim config at: $SOURCE" >&2
  exit 1
fi

mkdir -p "$(dirname "$TARGET")"
if [[ -e "$TARGET" && ! -L "$TARGET" ]]; then
  echo "Refusing: $TARGET exists and is not a symlink. Move or rename it first (e.g. to nvim.bak)." >&2
  exit 1
fi

ln -sfn "$SOURCE" "$TARGET"
echo "Linked $TARGET -> $SOURCE"
