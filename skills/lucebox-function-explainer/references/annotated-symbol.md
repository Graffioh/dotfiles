# Simplified symbol format

## Required response

Open with four short facts:

- `Symbol`: exact name and kind;
- `Source`: clickable exact line range and revision;
- `Role`: one sentence describing observable purpose;
- `Runs on`: CPU host, GPU device, or mixed.

Then show a source-faithful teaching rendition in a fenced code block. Within the selected core flow, reproduce the original executable statements, expressions, conditions, assignments, calls, returns, and state mutations 1:1. Add or translate explanatory comments around them, but do not rewrite them into pseudocode. The excerpt may omit peripheral regions, provided each omission is represented only by an explicit comment and does not hide a material branch.

Use the language requested by the user for explanations and comments. When reusing an existing source comment in an Italian explanation, translate it into Italian instead of retaining the English original.

## What to preserve

For the core flow, preserve source code rather than merely equivalent behavior. In particular:

- keep the original condition expressions and branch structure;
- keep the original assignments, calls, arguments, returns, and mutation order;
- keep real variable, field, type, macro, and callee names;
- keep failure, fallback, synchronization, allocation, device-copy, and cleanup statements at their real conceptual positions;
- never introduce an executable-looking helper or placeholder that does not exist in the source, such as `update_cache_state()`, `run_layers()`, or `copy_argmax_to_host()`.

Preserve code or pseudocode for behavior that affects any of the following:

- inputs, outputs, return values, or externally visible effects;
- primary data transformations and persistent state mutations;
- control flow that selects meaningfully different runtime behavior;
- error, cancellation, retry, fallback, or validation contracts;
- ownership, lifetime, synchronization, CPU/GPU, device-copy, queue, or IPC boundaries;
- configuration-dependent semantics such as greedy versus sampling, fresh versus restored cache, local versus remote execution, or enabled versus disabled features.

Never simplify an unspecified material branch into one concrete variant. For example, do not turn a configurable logits-versus-argmax path into greedy-only code unless the user explicitly asks for the greedy variant. Preserve the deciding condition and both consequences. Even when the user selects one variant, include the exact conditions and fallback branches that can divert that variant at runtime.

## What to collapse

Replace non-core implementation detail with a concise comment only when it would distract from the requested behavior. An omission comment replaces a source region; it must not appear as a fabricated function call or other executable statement. Typical candidates include:

- telemetry collection and timing aggregation;
- logging text and repetitive diagnostics;
- statistics gathering;
- verbose temporary-buffer maintenance;
- feature-specific bookkeeping unrelated to the requested path;
- repeated validation whose contract can be stated once;
- mechanical setup or teardown that does not change the central semantics.

Use an explicit omission comment at the original conceptual position, for example:

```cpp
// Plumbing omesso: aggiorna la finestra di feature DSpark usata dal drafter;
// non modifica la cache KV né la scelta logits/argmax del percorso principale.
```

Name the omitted responsibility, its important side effects, and whether it can fail or alter control flow. Do not use vague placeholders such as `// altro codice`, bare ellipses, comments that hide a material branch, or invented calls such as `aggiorna_posizioni_compressor_e_cache()` in place of real core statements.

## Annotation rules

- Explain intent and data flow before syntax details.
- Preserve each core source statement exactly; put explanations in adjacent comments instead of rewriting the statement.
- Annotate only lines whose meaning is not already obvious from the surrounding explanation.
- For a condition, state why the branch exists and what changes on each path.
- For pointers, say whether they are owning, optional outputs, or borrowed views when relevant.
- For calls, distinguish host orchestration, graph construction, graph execution, kernel launch, device copy, and IPC.
- For tensor shapes, `ne[]`, `nb[]`, pitches, and strides, state dimensions or units when relevant to the core behavior.
- Preserve uncertainty explicitly when the source does not establish intent.

## Closing contract

After the simplified code, give at most five compact bullets:

- inputs;
- returned value and mutations;
- important ownership or lifetime rule;
- key correctness invariant;
- performance or GPU boundary, only when relevant.

Include a short `Omitted plumbing` bullet when meaningful so the reader knows what was collapsed. Do not start a broad theory lesson. Invite normal follow-up questions about any line or concept.
