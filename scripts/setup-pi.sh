#!/usr/bin/env bash
# Install current Pi and link its tracked configuration into ~/.pi/agent.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="${REPO_ROOT}/pi/agent"
TARGET="${HOME}/.pi/agent"

if [[ ! -f "${SOURCE}/settings.json" ]]; then
  echo "Expected Pi settings at: ${SOURCE}/settings.json" >&2
  exit 1
fi

pi_binary="$(command -v pi 2>/dev/null || true)"
if [[ -n "${pi_binary}" && -L "${pi_binary}" ]]; then
  pi_target="$(readlink "${pi_binary}")"
  if [[ "${pi_target}" == *"@mariozechner/pi-coding-agent"* ]]; then
    echo "Removing legacy @mariozechner/pi-coding-agent package"
    npm uninstall --global @mariozechner/pi-coding-agent
  fi
fi

npm install --global @earendil-works/pi-coding-agent
mkdir -p "${TARGET}"

# Remove resource-directory links created by the previous dotfiles layout.
for entry in extensions skills themes; do
  target_path="${TARGET}/${entry}"
  if [[ -L "${target_path}" && "$(readlink "${target_path}")" == "${SOURCE}/${entry}" ]]; then
    unlink "${target_path}"
    echo "Removed legacy link ${target_path}"
  fi
done

for entry in settings.json; do
  source_path="${SOURCE}/${entry}"
  target_path="${TARGET}/${entry}"

  if [[ ! -e "${source_path}" ]]; then
    continue
  fi
  if [[ -e "${target_path}" && ! -L "${target_path}" ]]; then
    echo "Refusing: ${target_path} exists and is not a symlink." >&2
    exit 1
  fi

  ln -sfn "${source_path}" "${target_path}"
  echo "Linked ${target_path} -> ${source_path}"
done

pi install git:github.com/mitsuhiko/agent-stuff
pi install npm:pi-markdown-preview
pi --version
pi list
