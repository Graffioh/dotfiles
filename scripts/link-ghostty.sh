#!/usr/bin/env bash
# Symlink ~/.config/ghostty -> this repo's ghostty/ so the config and themes live in git.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="${REPO_ROOT}/ghostty"
TARGET="${XDG_CONFIG_HOME:-$HOME/.config}/ghostty"

if [[ ! -d "$SOURCE" ]]; then
  echo "Expected Ghostty config at: $SOURCE" >&2
  exit 1
fi

mkdir -p "$(dirname "$TARGET")"
if [[ -e "$TARGET" && ! -L "$TARGET" ]]; then
  echo "Refusing: $TARGET exists and is not a symlink. Move or rename it first (e.g. to ghostty.bak)." >&2
  exit 1
fi

ln -sfn "$SOURCE" "$TARGET"
echo "Linked $TARGET -> $SOURCE"
