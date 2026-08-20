---
name: lucebox-debug
description: Trace, understand, instrument, and diagnose Lucebox runtime behavior from real source and reproducible executions. Use when the user says they want to debug, investigate, trace, or better understand a Lucebox feature or failure, including inference paths, CUDA/HIP execution, IPC and layer split, cache or state handoff, crashes, hangs, incorrect output, and performance anomalies. Produce concrete build/run/request commands, targeted temporary observability, evidence-based checkpoints, and safe rollback instructions; implement a fix only when the user asks for one.
---

# Lucebox Debug

Build a causal explanation before reaching for a debugger. Trace the real code path, choose the narrowest useful invariant, and design a run that proves where behavior first diverges.

## Workflow

### 1. Establish scope and authority

- Distinguish diagnosis from implementation. Do not fix code when the user only asks to understand or debug it.
- Resolve the repository, branch, PR, build backend, hardware, model, and failing or uncertain behavior from available context.
- Inspect `AGENTS.md`, repository status, relevant docs, and local command notes before suggesting commands.
- If a PR or current branch is involved, verify its current head and changed files. Preserve unrelated local changes.

### 2. Reconstruct the real path

- Search with `rg` and read the concrete caller/callee chain across all relevant files.
- Follow process, device, and transport boundaries rather than stopping at wrapper functions.
- Identify:
  - inputs and outputs at each stage;
  - state that must persist or be transferred;
  - cache ownership and invalidation keys;
  - synchronous versus asynchronous work;
  - parent and daemon processes;
  - device selection and backend-specific paths.
- Summarize the path as a short sequence such as `producer -> boundary -> transport -> consumer -> output`.
- State the expected invariant at each boundary before proposing instrumentation.

For a request that is purely an explanation of one symbol or one end-to-end inference flow, combine with the corresponding Lucebox explainer skill when available. Keep this skill responsible for the diagnostic experiment and evidence.

### 3. Define an oracle and minimal reproduction

- Decide what would prove success before running anything.
- Prefer the strongest available oracle:
  1. exact byte equality when data should only be copied;
  2. shape, sequence, ownership, and position invariants;
  3. numerical tolerance after computation;
  4. final tokens or user-visible output.
- Hold prompt, seed, sampling, model, split, and build revision constant.
- Change one variable at a time. Start with the smallest request that still crosses the suspected boundary.
- Use an explicit split or device placement instead of an automatic heuristic while debugging.

### 4. Use the observability ladder

Escalate only as needed:

1. Existing environment flags, structured logs, and timing output.
2. Temporary structured prints at the producer, boundary, and consumer.
3. Assertions, exact hashes, shape checks, position checks, and explicit GPU synchronization.
4. Sanitizers, API tracing, syscall tracing, and profilers.
5. `gdb`, `cuda-gdb`, or `rocgdb` on the process where the first divergence occurs.

Do not begin with a low-level debugger when a boundary fingerprint can isolate the fault faster.

### 5. Design temporary instrumentation

- Gate durable debug logging behind an environment flag. For one-off remote diagnosis, use a unique prefix that is easy to grep.
- Log compact structured facts, not entire tensors:
  - PID and thread when concurrency matters;
  - request or sequence ID;
  - `base_pos`, token count, layer range, backend, and device;
  - element count and expected count;
  - exact byte hash for pure handoffs;
  - min, max, norm, or a few samples only when numerically useful;
  - cache owner, key, pointer, capacity, and before/after position when cache behavior matters.
- Instrument three points around a handoff:
  1. producer immediately before send;
  2. receiver immediately after transport;
  3. consumer immediately after copy or initialization.
- Require identical hashes across a transport that performs no numerical transformation.
- Synchronize a GPU only in a debug run when asynchronous error attribution is otherwise ambiguous.

Read [references/gpu-ipc.md](references/gpu-ipc.md) when CUDA, HIP, IPC, layer split, GPU state, or cross-process debugging is involved.

### 6. Produce executable commands

- Derive build and run commands from repository docs and the user's machine-specific notes; do not invent model paths or architecture flags when they can be discovered.
- Build every cooperating binary from the same commit.
- Provide commands in execution order:
  1. inspect status;
  2. fetch, switch, and fast-forward safely;
  3. add temporary instrumentation;
  4. configure and build each backend;
  5. launch the server while capturing combined logs;
  6. issue the minimal deterministic request from a second terminal;
  7. extract and compare evidence;
  8. restore temporary changes.
- Prefer `git pull --ff-only`. Avoid destructive resets and broad cleanup commands.
- Separate commands by terminal when a server must remain running.
- Include the exact expected log relationship so the user knows how to interpret the result.

### 7. Handle remote one-off edits safely

When the user asks for `sed` commands:

- anchor insertions to stable source text, not line numbers;
- make backup copies first;
- use a unique marker and check that it is absent before applying;
- show `git diff --check` and a marker grep before building;
- provide exact restore commands using the backups;
- keep the instrumentation compilation-safe and easy to remove.

For local repository edits, use `apply_patch` and verify the diff normally.

### 8. Interpret the first divergence

- If producer state and outbound payload differ, inspect producer output formation.
- If outbound and received payload differ, inspect IPC framing, size, sequence, and transport.
- If received and consumed state differ, inspect copy, resize, aliasing, lifetime, and initialization.
- If all boundary values agree, move downstream to the first computation or cache update that differs.
- For hangs, identify which process and syscall or synchronization point is waiting before inspecting GPU kernels.
- For cache issues, distinguish persistent runtime/graph caches from per-request KV or model state.

### 9. Report evidence

Lead with the result:

- first point of divergence or confirmation that the boundary is correct;
- exact run and revision used;
- evidence that proves the conclusion;
- remaining untested paths or uncertainty;
- next narrow diagnostic step, if needed.

Do not claim a subsystem is correct merely because the final output looks plausible.
