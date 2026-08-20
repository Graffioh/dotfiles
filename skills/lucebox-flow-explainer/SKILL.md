---
name: lucebox-flow-explainer
description: Trace one Lucebox inference request end to end through the real source, beginning at the HTTP handler in http_server and continuing through request parsing, backend dispatch, prefill, decode or sampling, token emission, and HTTP response completion. Use only when the user asks for the execution flow, request lifecycle, call path, or code path from HTTP input to generated output. Do not use for a specific function, method, class, struct, kernel, or other single symbol; do not use for PR or diff explanations; and do not use for broad conceptual questions such as "how does this feature work?" that do not explicitly ask for an end-to-end code flow.
---

# Lucebox Request Flow Explainer

Trace the complete runtime path of a real Lucebox request. Give the whole flow in the first response so the user can ask ordinary follow-up questions afterward.

## Resolve the path

1. Resolve the requested model, backend, feature, endpoint, and revision from the prompt and conversation. Use the current checkout when none is pinned.
2. Start at the actual handler in `server/src/server/http_server.cpp`, not at a convenient downstream abstraction.
3. Follow the concrete call path through request parsing, `GenerateRequest` construction, backend selection, generation, token callbacks, cancellation, errors, and response completion.
4. Read every symbol on the primary path and enough of each relevant branch to state its condition and consequence accurately.
5. Trace the requested configuration rather than inventorying every model. When a material branch is unspecified, explain the default path and name the alternative briefly.

Inspect privately:

- request and response data shapes;
- threads, queues, callbacks, captures, and object lifetimes;
- backend ownership and selection;
- prompt tokenization and sampler configuration;
- prefill, KV/cache mutation, decode, speculative paths, and fallbacks;
- CPU/GPU and local/remote boundaries;
- streaming, terminal markers, cancellation, and error propagation.

Do not edit code or create a teaching artifact.

## First response

Deliver the complete request lifecycle immediately. Do not introduce checkpoints, progress gates, `next` commands, or staged reading.

Open with:

- the exact revision and request variant being traced;
- a one-sentence summary from HTTP input to HTTP output;
- any assumption needed because the prompt was underspecified.

Then provide:

### Flow at a glance

Show one compact ordered chain of linked symbols from `http_server` to response completion. Include branch labels only where they change the runtime path.

### Runtime walkthrough

Walk the chain in execution order. At every hop:

- link the exact file, symbol, and tight line range;
- state what data arrives and in what representation;
- explain the decision or mutation made there;
- state which symbol runs next and why;
- identify CPU, GPU, IPC, thread, queue, or callback boundaries when present;
- explain failure, cancellation, and fallback behavior at the point where it occurs.

Finish with:

- the end-to-end data transformation;
- the principal mutable state and its lifetime;
- the key correctness invariant;
- the important performance boundary;
- any behavior inferred rather than directly verified.

## Source links

- Link the real code at every flow hop.
- Use clickable absolute local links only when local `HEAD` is the explained revision and the file is unmodified.
- Otherwise use GitHub blob permalinks pinned to the exact full SHA.
- Revalidate symbols and line ranges immediately before answering.
- Never switch branches or mutate the worktree merely to create links.

## Boundary with other requests

- For a named function, method, class, struct, kernel, lambda, or other specific symbol, let `lucebox-function-explainer` handle the request.
- For PRs, commits, diffs, reviews, and general feature explanations, answer normally without this skill unless the user explicitly asks for the HTTP-to-generation flow.
- Follow-up questions after the initial flow are ordinary conversation. Answer the part the user asks about; do not repeat the entire flow unless requested.
