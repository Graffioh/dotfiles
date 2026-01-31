---
name: codebase-ripper
description: Shotgun codebase exploration with iterative passes - generates many commands, executes in parallel, extracts relevant context. Use before writing code to understand existing patterns, before generating tests, or when exploring unfamiliar codebases.
---

# Codebase Ripper

Quickly gather codebase context with comprehensive coverage. Generates 30-80 shell commands per iteration, executes all in parallel, then extracts relevant context. Default 2 iterations for deeper exploration.

## When to use

- Before writing code that needs to understand existing patterns
- Before generating tests for existing code
- When you need broad coverage quickly
- When exploring unfamiliar codebases

## Usage

Run via bash:

```bash
~/.pi/agent/skills/codebase-ripper/run.sh "<task>" [-d <directory>] [--token-budget N] [--max-iterations N] [--json]
```

### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `<task>` | required | What you want to understand about the codebase |
| `-d, --directory` | `.` | Directory to explore |
| `--token-budget` | 40000 | Maximum tokens for extracted context |
| `--max-iterations` | 2 | Number of exploration passes |
| `--json` | false | Output as JSON instead of text |

## Examples

```bash
# Understand authentication flow in current directory
~/.pi/agent/skills/codebase-ripper/run.sh "Understand the authentication flow"

# Explore specific directory
~/.pi/agent/skills/codebase-ripper/run.sh "Find all API endpoints" -d ./src/api

# Deep exploration with more iterations
~/.pi/agent/skills/codebase-ripper/run.sh "Map out the entire data layer" --max-iterations 4

# Quick single-pass exploration
~/.pi/agent/skills/codebase-ripper/run.sh "Get quick overview" --max-iterations 1

# JSON output for structured processing
~/.pi/agent/skills/codebase-ripper/run.sh "Find database queries" --json
```

## Output

Returns structured context including:
- Narrative overview with key files and architecture notes
- Relevant code snippets and imports
- Stats on commands generated/valid/rejected

## Requirements

Requires an LLM API key. Set one of:
- `ANTHROPIC_API_KEY` - for Claude
- `OPENAI_API_KEY` - for GPT models
- `GROQ_API_KEY` - for Groq

## Security

**Allowed commands:** `tree`, `rg`, `fd`, `head`, `tail`, `cat`, `wc`, `ls`, `file`, `diff`, `du`, `git` (read-only)

**Blocked:** pipes, redirects, command chaining, shell escapes, dangerous commands
