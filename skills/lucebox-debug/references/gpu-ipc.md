# GPU and IPC debugging patterns

Read this reference only for CUDA, HIP, IPC, layer-split, or multi-process GPU work.

## Separate the failure domains

Treat these as distinct stages:

```text
local producer
-> host-visible boundary payload
-> IPC framing and transport
-> remote receiver
-> remote state initialization
-> remote GPU computation
-> response transport
```

A CUDA parent and HIP daemon are separate processes. Their runtime caches and device allocations are not shared merely because they participate in one request. Cross-process handoff bugs and same-process per-device scratch bugs require different tests.

## Boundary fingerprint

For a vector of `float` copied without transformation, use an exact byte hash. FNV-1a is sufficient for a diagnostic fingerprint:

```cpp
uint64_t hash = 1469598103934665603ULL;
const unsigned char * bytes =
    reinterpret_cast<const unsigned char *>(values.data());
for (size_t i = 0; i < values.size() * sizeof(float); ++i) {
    hash ^= (uint64_t)bytes[i];
    hash *= 1099511628211ULL;
}
```

Log at least:

```text
marker pid sequence base_pos n_tokens backend device
layers expected_elems actual_elems hash
```

For a pure handoff, require:

```text
producer payload hash == receiver payload hash == consumer state hash
```

Do not use floating-point tolerance for a byte copy. Use tolerance only after a GPU or CPU computation.

## GPU asynchrony

An error may surface after the launch that caused it. In a focused debug build or run:

- check the backend API result immediately after launches and copies;
- add explicit synchronization only around the suspected stage;
- remove or gate synchronization after diagnosis because it changes performance and scheduling.

Use official current documentation before giving exact sanitizer or debugger flags. Typical tool selection is:

- CUDA memory or synchronization fault: Compute Sanitizer, then `cuda-gdb` if necessary;
- HIP launch attribution: serialized kernel/copy execution, then `rocgdb` if necessary;
- IPC hang: inspect reads, writes, polls, waits, and child state before kernel debugging;
- mixed CUDA/HIP: attach the backend-appropriate debugger to each process separately.

## Cache versus handoff

Keep these proofs separate:

- Handoff correctness: exact payload size and hash at producer, receiver, and consumer.
- Cache correctness: owner/key stability, position progression, reset behavior, and reuse across steps.
- Scratch isolation: simultaneous same-process calls on multiple devices, usually requiring a barrier-based test.

Do not expand a handoff-only investigation into cache or scratch testing unless the evidence points there or the user asks for it.

## Remote instrumentation checklist

When providing one-off remote commands:

1. Verify the exact branch and commit.
2. Back up only the files being instrumented.
3. Insert using stable textual anchors and a unique log marker.
4. Confirm each marker appears once.
5. Run `git diff --check`.
6. Build every affected backend binary.
7. Capture parent and daemon stderr in one timestamped log when possible.
8. Run one small deterministic request.
9. Grep and compare the structured markers.
10. Restore the backups and show repository status.
