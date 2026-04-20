---
name: research-codex
description: Run a mandatory Phase 1 deep research pass before planning or implementation. Use when requests ask to deeply understand a codebase area, study system intricacies, map behavior end-to-end, or find bugs and produce a persistent report (usually research.md). Trigger on prompts like "read this folder in depth," "study the notification system in great detail," and "go through task scheduling flow and find cancellation bugs."
---

# Research Codex

Perform exhaustive, evidence-driven research before planning or code changes, then persist findings in `research.md`.

## Enforce Non-Negotiables

1. Start with deep reading, not implementation.
2. Produce a persistent written artifact (`research.md`), never only a chat summary.
3. Read broadly and deeply enough to explain interactions, edge cases, and side effects.
4. Continue investigation loops until no strong untested hypotheses remain.
5. Avoid absolute guarantees ("all bugs found"); report confidence and residual risk.

## Run Phase 1 Research Workflow

### 1. Define Research Contract

- Extract the concrete scope from the request (folder, subsystem, flow, incident, bug class).
- Extract explicit investigation goals and hypotheses from user language.
- Set output path to `research.md` unless user requests another path.
- Preserve user emphasis words such as "deeply", "intricacies", "everything", and "don't stop until" as strict quality constraints.

### 2. Build a System Map First

- Inventory relevant files with fast search tools.
- Identify entrypoints, orchestrators, background jobs, repositories, entities, configuration, and tests.
- Build a quick architecture map: triggers, state transitions, queues/events, side effects, retries, and failure paths.

### 3. Trace Flows End-to-End

- Trace each core flow from trigger to terminal side effect.
- Read both caller and callee chains; do not stop at function signatures.
- Capture guards, invariants, idempotency keys, cancellation checks, retry logic, and timeout behavior.
- Examine tests and gaps: identify what is asserted and what is missing.

### 4. Run a Bug-Finding Loop

- List expected invariants before searching for defects.
- Generate concrete bug hypotheses and verify each with code evidence.
- For every confirmed or likely bug, record:
  - impact
  - confidence
  - exact files/lines
  - reproduction scenario
  - likely root cause
  - safest fix direction
- Continue looping until no medium/high-confidence hypotheses remain uninvestigated.

### 5. Write `research.md`

- Use `references/research-report-template.md` as the default structure.
- Include enough detail that another engineer can validate conclusions without redoing the full read.
- Prefer specific file references over generic statements.
- Distinguish facts, inferences, and open questions clearly.

### 6. Close Out

- Return a concise chat summary after writing the file.
- Link the `research.md` path and highlight top risks/bugs found.
- If coverage is partial, state exactly what remains and why.

## Apply Domain Checklists

- Use `references/flow-investigation-checklists.md` for deep dives on notification systems and task scheduling/cancellation flows.
- Apply both normal-path and race-condition analysis for asynchronous workflows.

## Output Requirements

- Write or update `research.md` in the requested scope.
- Keep report content technical and evidence-based.
- Include a reviewed file inventory so coverage is auditable.
