# Flow Investigation Checklists

Use these checklists to force deeper system understanding and avoid shallow reads.

## Notification System Checklist

- Map every producer of notification events (API actions, cron jobs, workers, hooks).
- Map every consumer/dispatcher and their filtering logic.
- Verify idempotency strategy (dedupe keys, unique constraints, de-bounce windows).
- Verify scheduling semantics (immediate, delayed, batched).
- Trace retry policy and backoff behavior.
- Confirm cancellation/suppression paths (user settings, state checks, feature flags).
- Check delivery channels independently (email, push, websocket, internal events).
- Identify race conditions between state change and send execution.
- Confirm what happens when downstream providers fail or time out.
- Verify observability: logs, metrics, traces, dead-letter queues.

## Task Scheduling and Cancellation Checklist

- Trace scheduler entrypoints and where tasks are enqueued.
- Trace cancellation entrypoints and all persisted cancellation flags/state.
- Verify whether workers re-check cancellation state at execution time.
- Check delayed-job windows: task canceled after enqueue but before execution.
- Check retry behavior: canceled tasks being retried due to stale state.
- Verify locking and concurrency guards around scheduler/worker overlap.
- Verify idempotency keys or "already processed" protections.
- Inspect clock/timezone assumptions for delayed/cron tasks.
- Check transactional boundaries around state update + enqueue/dequeue operations.
- Confirm queue cleanup behavior for canceled or superseded tasks.
- Inspect tests for race conditions, retries, and cancellation timing edges.

## Bug Evidence Standard

Require at least one of:

- direct code path demonstrating violation
- deterministic reproduction scenario from code reasoning
- test demonstrating failing invariant

Tag weaker claims as hypotheses, not confirmed bugs.
