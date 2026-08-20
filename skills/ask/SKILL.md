---
name: ask
description: Answer-only mode for genuine questions. Use when the user asks for analysis/explanation and explicitly wants no code or file changes (e.g. "/ask ...", "just answer", "no edits").
---

# Ask

Provide an answer-focused response without modifying files or project state.

## Rules

1. Treat the user message as a genuine question.
2. You may run read-only investigation (search/read/inspect) if needed to answer accurately.
3. Do **not** edit files, create files, apply patches, run formatting, or perform destructive commands.
4. Make tool calls only when they directly improve answer quality.
5. If the request would normally require edits, explain what should be changed conceptually instead of changing it.

## Response Style

- Be direct and practical.
- Include evidence (file paths/commands/findings) when you investigated.
- End with a concise answer or recommendation.
