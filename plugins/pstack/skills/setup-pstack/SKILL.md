---
name: setup-pstack
description: Configure which Codex models pstack uses per role. Detects the available collaboration models and writes a user-scoped override file. Use for $setup-pstack, "configure pstack models", or changing pstack's model choices.
---

# Setup pstack

Write `~/.codex/pstack-models.md`, a pstack configuration file that sets the model per role. Pstack skills read it explicitly and fall back to their inline defaults when a line is absent, so this is an override layer, not a requirement.

## Steps

### 1. Detect available models

Enumerate the model identifiers accepted by Codex's `spawn_agent` tool in this session; its schema is the dependable source. If Codex exposes another authoritative model list, use it only to supplement that schema. If no explicit list is available, use `inherit-parent`, which is always valid because omitting the model override inherits the parent. Never write a model identifier you have not confirmed is available.

### 2. Load current state

The default role-to-model mapping is the rule shape shown in step 5 below. If `~/.codex/pstack-models.md` already exists, read it and treat its values as the current choices. Otherwise start from those defaults.

### 3. Map and confirm

Show every role with its current model, marking any identifier not in the detected set as needing a choice. Ask whether to accept the mapping or change specific roles. Offer the detected models plus `inherit-parent`. Use a structured question tool when one is available; otherwise ask one concise question. For panel roles, one subagent runs per entry, so the list length sets the panel size. `arena cross-judge pool` is also a list, but Arena selects one model different from the primary runner when possible. `swarm workers` is the default worker model unless a race assigns another model per arm.

### 4. Validate

Every model written must be in the detected set; `inherit-parent` always passes. If a chosen model is unavailable, stop and ask again.

### 5. Write the rule

Write `~/.codex/pstack-models.md` with one line per role, using the same labels poteto-mode uses. Ask for filesystem approval immediately before the write if the sandbox requires it. Overwrite the whole file so reruns stay idempotent. Shape:

```
# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` means the role runs on the parent model; omit `spawn_agent.model`.
feature, refactoring: gpt-5.6-luna
bug-fix: gpt-5.6-sol
perf-issue: gpt-5.6-sol
hillclimb: gpt-5.6-sol
judgment and prose: gpt-5.6-terra
hardest tasks: gpt-5.6-terra
how explorer: gpt-5.6-luna
how explainer: gpt-5.6-terra
how critics: gpt-5.6-terra, gpt-5.6-sol, gpt-5.6-luna, gpt-5.5
why investigators: gpt-5.6-luna
why synthesizer: gpt-5.6-terra
reflect tooling: gpt-5.6-sol
reflect judgment, divergent, synthesizer: gpt-5.6-terra
arena runners: gpt-5.6-terra, gpt-5.6-sol, gpt-5.6-luna, gpt-5.5
arena cross-judge pool: gpt-5.6-terra, gpt-5.6-sol, gpt-5.6-luna, gpt-5.5
swarm workers: gpt-5.6-luna
architect runners: gpt-5.6-terra, gpt-5.6-sol, gpt-5.6-luna, gpt-5.5
interrogate reviewers: gpt-5.6-terra, gpt-5.6-sol, gpt-5.6-luna, gpt-5.5
```

### 6. Confirm

Tell the user the configuration was written and that pstack reads it on its next invocation. Rerunning this skill updates it.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof, such as a `verify-*` skill or an existing harness. If not, offer once: "Want a project-local verification skill so Codex can drive the app and prove changes work?" On yes, invoke `$create-verification-skill`. On no, move on.
