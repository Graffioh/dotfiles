---
name: analyze-code-structure
description: Walk the user through a change's APIs, data structures, ownership, naming, runtime flow, and module boundaries before reorganizing the design. Works on a PR, a branch, the working tree, or a named module. Use after creating or updating a PR, or when the user asks to review code structure instead of unit-level implementation.
---

# Analyze code structure

Help the user inspect and direct the shape of a change. Treat the user as the design reviewer. Do not turn the walkthrough into an autonomous refactor proposal.

## Ground the review

- Resolve the PR base and head from the PR metadata when available. Otherwise diff the branch against the merge base of its upstream (`git diff upstream...head`, three-dot, so upstream drift stays out of the review). If more than one base is plausible and the choice changes the review, ask the user.
- With no PR or branch delta, review the working-tree diff against the merge base. For a named module or directory with no delta, review its current structure and skip the delta labeling below.
- Review the delta, not every change on the branch or every file in the repository.
- Read changed declarations, implementations, and tests.
- Trace callers and owners outside the diff when they determine an API's real contract.
- Label structures as introduced by the change, modified by it, or pre-existing context.
- Keep correctness requirements separate from design preferences.

## Build the walkthrough

Scale depth to the change. In each section cover the two to four most structurally significant items in full and list the rest by name only. Keep the whole walkthrough to roughly one screen per major module; the user will drill into whatever matters, so prefer under-explaining to flooding.

Open with the pressure points: three to five bullets naming where the structure is under strain, without assuming the preferred fix. The rest of the walkthrough is the evidence behind those bullets.

Then present the code in this order:

1. State the change's job and system boundary in plain language.
2. Show public and cross-module APIs. Include exact signatures and representative callers.
3. Show each changed or newly important data structure. Explain what it owns, borrows, mutates, and caches.
4. Trace construction, steady-state use, reset, invalidation, and destruction. Skip lifecycle stages that do not exist.
5. For each policy decision in the change — when to invalidate, which path to take, which format or mode to use — name the one module that decides it and the modules that must obey it. Flag any decision made in more than one place.
6. List the names a reader must learn. Flag names that hide mode, ownership, cardinality, or lifetime.

Use a small table, flow, or ownership tree when it makes relationships easier to compare. Link every code claim to the actual file and line.

For each API or type, answer the relevant questions:

- Why does it exist?
- Who creates and destroys it?
- Which state is persistent, per request, per lane, or per call?
- Which pointers or references are borrowed, and how long are they valid?
- Which fields or modes can be absent?
- What causes rebuild or invalidation?
- Does its name describe its role at the call site?

Do not force an answer when a question does not apply. State uncertainty when the source does not establish the contract.

## Hand control to the user

End the walkthrough before editing. Ask focused questions about choices that materially change the structure, especially:

- type and function names;
- whether modes deserve distinct types, suffixes, or explicit operations;
- ownership and nesting;
- module placement;
- which abstractions should disappear.

Do not ask the user to decide facts that source inspection can answer. Do not bury the review in style comments or local implementation details.

When the user chooses a direction, restate the target structure with concrete names and caller examples. Point out compatibility and lifecycle consequences. Implement only when the current request authorizes changes.

## When implementing the chosen direction

- Prefer fewer concepts when two designs enforce the same invariants.
- Do not introduce a type only to avoid a nullable field unless the type removes a real invalid state or ownership hazard.
- Do not preserve a compatibility wrapper for internal callers that can migrate together.
- Keep performance follow-ups separate from structural cleanup unless one requires the other.
- After implementation, show the resulting API and data-structure diff before declaring the structure settled.
