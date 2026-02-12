# Planning Checklists

Use these checklists before finalizing `plan.md`.

## Source-Grounded Planning Checklist

- Read all primary files that are expected to change.
- Read upstream callers and downstream consumers for each major change.
- Confirm existing coding patterns (types, error handling, data access, validation, testing style).
- Confirm whether a migration is needed.
- Confirm whether public API contracts change.
- Confirm which tests already cover the behavior and which do not.
- Ensure each proposal maps to a specific file path.
- Ensure each major proposal includes a realistic snippet.

## Todo List Quality Checklist

- Include a dedicated "Detailed Todo List" section in `plan.md`.
- Break work into explicit phases (for example: schema, backend logic, API surface, tests, rollout).
- Keep each task small enough to mark progress clearly.
- Ensure tasks cover implementation, tests, and rollout steps.
- Ensure each task maps to specific files or workstreams.
- State planning gate clearly: do not implement yet.
- Use markdown checkboxes so execution can be tracked over long sessions.

## Cursor Pagination Migration Checklist

- Identify current offset-based endpoint contract and usage.
- Identify stable ordering field(s) and tie-breaker field.
- Define cursor format (encoded fields + direction + version if needed).
- Define request params (`cursor`, `limit`, optional direction/filter interactions).
- Define response shape (`items`, `nextCursor`, `hasMore` and any metadata).
- Plan query changes to use keyset/cursor semantics instead of offset.
- Plan index changes required for ordered keyset queries.
- Plan backward compatibility (temporary dual support or explicit breaking change).
- Plan test coverage for boundaries:
  - empty page
  - first page
  - middle pages
  - last page
  - concurrent inserts/deletes during pagination

## Reference Implementation Adaptation Checklist

- Capture the provided reference source and target behavior.
- Identify concepts to reuse (algorithm, data model pattern, encoding strategy).
- Identify incompatibilities with local architecture.
- Adapt to local conventions (types, exceptions, layering, DTO style, testing approach).
- Avoid direct copy without context mapping.
- Include snippets that show adapted local usage, not raw pasted reference code.
- Document trade-offs between "copy behavior exactly" and "align with existing system."
