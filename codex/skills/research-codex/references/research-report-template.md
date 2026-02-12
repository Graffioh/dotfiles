# Research Report Template (`research.md`)

Use this structure when writing deep research deliverables.

## 1. Scope and Questions

- Target area:
- Request intent:
- Questions to answer:
- Out-of-scope:

## 2. Method and Coverage

- How the system was explored:
- Files/directories reviewed:
- Runtime paths traced:
- Confidence level and remaining uncertainty:

## 3. System Understanding

### 3.1 Architecture Summary

- Key components:
- Data/control flow:
- Important dependencies:

### 3.2 End-to-End Flow Walkthroughs

For each major flow, document:

- Trigger
- Preconditions and guards
- Processing steps
- Side effects
- Error handling and retries
- Terminal states

## 4. Invariants and Assumptions

- Invariant 1:
- Invariant 2:
- Assumptions that may be risky:

## 5. Findings and Bugs

For each finding, use this block:

### [ID] Short Title

- Severity: Critical | High | Medium | Low
- Confidence: High | Medium | Low
- Category: Logic | Race condition | Data consistency | Missing guard | Other
- Evidence: `path/to/file.ts:line`
- Why this is a problem:
- Reproduction scenario:
- Likely root cause:
- Recommended fix direction:
- Tests to add:

## 6. Notification System Notes (if applicable)

- Event sources:
- Subscriber/consumer chain:
- Deduplication/idempotency handling:
- Delivery and retry behavior:
- Failure and dead-letter behavior:

## 7. Task Scheduling and Cancellation Notes (if applicable)

- Scheduling entrypoints:
- Cancellation entrypoints:
- Queue/job state transitions:
- Race windows:
- Stale task execution scenarios:
- Locking and idempotency observations:

## 8. Gaps and Open Questions

- Unknowns that block certainty:
- Needed logs/metrics/tests:

## 9. Prioritized Next Actions

1. Immediate risk reduction:
2. Medium-term hardening:
3. Long-term refactor opportunities:
