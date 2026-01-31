#!/bin/bash
# Codebase Ripper - Shotgun codebase exploration with iterative passes
#
# Usage:
#   ./run.sh "task description" [-d directory] [--token-budget N] [--max-iterations N] [--json]
#
# Examples:
#   ./run.sh "understand how the auth system works" -d /path/to/project
#   ./run.sh "find all database queries" --max-iterations 3 --json

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Activate virtual environment
if [ -f "$SCRIPT_DIR/.venv/bin/activate" ]; then
    source "$SCRIPT_DIR/.venv/bin/activate"
else
    echo "Error: Virtual environment not found. Run: cd $SCRIPT_DIR && python3 -m venv .venv && source .venv/bin/activate && pip install 'flatagents[local]>=0.7.7' tiktoken" >&2
    exit 1
fi

# Add src and shared to Python path
export PYTHONPATH="$SCRIPT_DIR/src:$SCRIPT_DIR/shared:$PYTHONPATH"

# Run the ripper
python -m codebase_ripper.main "$@"
