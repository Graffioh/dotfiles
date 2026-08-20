---
name: lucebox-function-explainer
description: Explain one specific Lucebox source symbol through a source-faithful annotated view that reproduces its core flow 1:1 while collapsing only genuinely peripheral plumbing into explicit omission comments. Use only when the user identifies or clearly points to a concrete function, method, constructor, destructor, class, struct, kernel, lambda, or similarly bounded definition and asks what it does. Do not use for HTTP-to-generation flow, PRs or diffs, broad architecture questions, or general conceptual questions without a specific symbol.
---

# Lucebox Function Explainer

Explain one concrete source definition by reproducing its core control flow and data transformations with the original executable statements, adding teaching comments without replacing real code with pseudocode. Keep the repository unchanged.

Read [references/annotated-symbol.md](references/annotated-symbol.md) completely before answering.

## Workflow

1. Resolve the exact symbol and revision. If several symbols have the same name, use caller and conversation context; ask only when the ambiguity materially changes the answer.
2. Read the full definition, declaration, immediate caller, relevant types and macros, and directly selected callees privately.
3. Resolve the concrete runtime variant from the request and conversation. When a material choice is unspecified, preserve that branch in the teaching view instead of silently specializing it.
4. Classify the implementation into core behavior, material branches, and plumbing by following [references/annotated-symbol.md](references/annotated-symbol.md).
5. Determine whether it runs on the CPU host, GPU device, or both, and identify ownership, mutation, tensor or memory layout, synchronization, and fallback contracts.
6. Link the exact original definition.
7. Return a source-faithful annotated rendition. Reproduce every statement in the selected core path and its material branches 1:1; add comments around the code, but never replace core statements with invented helper calls, summaries, or pseudocode. Replace only peripheral plumbing with concise comments describing its responsibility and relevant side effects.
8. Add only a compact orientation before the code and a compact contract after it. Leave broader theory for follow-up questions.

Do not edit the source file, run benchmarks, or create a separate teaching artifact unless separately requested.

## Source links

- Use a clickable absolute local link when local `HEAD` is the explained revision and the file is unmodified.
- Otherwise use a GitHub blob permalink pinned to the exact full SHA and range.
- Revalidate the symbol and line range immediately before answering.
- Never switch branches or mutate the worktree for convenient links.

## Follow-up conversation

After the simplified rendition, answer questions naturally. Explain C++, CUDA/HIP, GGML, GPU execution, theory, or callees only when the user asks or when the requested line requires it. Do not require `next`, `back`, `flow`, checkpoints, or other navigation commands.
