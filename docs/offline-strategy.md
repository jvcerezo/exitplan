# Sandalan Offline Strategy

## Phase 1 Support Matrix

### Supported offline after first successful online visit

| Route | Offline behavior | Notes |
| --- | --- | --- |
| `/dashboard` | Opens cached shell and shows last persisted query data | Best-effort read-only view |
| `/accounts` | Opens cached shell and shows last persisted query data | Account list is read-only offline for now |
| `/transactions` | Opens cached shell and shows last persisted query data | New transaction queue is a later phase |
| `/goals` | Opens cached shell and shows last persisted query data | Goal changes still require network |
| `/budgets` | Opens cached shell and shows last persisted query data | Budget changes still require network |
| `/settings` | Opens cached shell | Settings writes remain online-only |

### Fallback-only support

| Route | Offline behavior | Notes |
| --- | --- | --- |
| `/` | Cached landing shell if visited before | Not a priority workflow |
| `/offline` | Dedicated offline fallback page | Used when requested route is uncached |

### Online-only routes in Phase 1

| Route / Capability | Why |
| --- | --- |
| `/login`, `/signup`, `/auth/callback` | Require live auth/session exchange |
| `/admin`, `/admin/users` | Operational views should not rely on stale offline cache |
| Receipt upload / OCR | Requires storage upload and server processing |
| CSV/PDF import commit | Needs server writes and validation |
| Goal funding / transfers | Multi-entity balance-sensitive operations |

## Fallback Rules

1. If a cached navigation route is requested while offline, return the cached page.
2. If the requested route is not cached, route to `/offline`.
3. Persisted React Query data is shown as last-known state.
4. Core create actions (`accounts`, `transactions`, `goals`, `budgets`) can be queued offline and replay on reconnect.

## UX Rules

- Always show the offline banner when the browser is offline.
- Never imply writes have succeeded server-side when offline.
- Show sync state in the banner: offline, syncing, synced, or needs review.

## Next Phases

- Phase 2: IndexedDB mutation queue for accounts, transactions, goals, budgets. ✅
- Phase 3: Sync status UX and admin sync metrics. ✅
- Phase 4: Attachments, imports, transfers, and conflict resolution replay. ✅
- Phase 5: Update/delete parity for core entities + goal funding replay. ✅

## Implemented Queue Scope

- `addAccount`
- `updateAccount`
- `deleteAccount`
- `addTransaction`
- `updateTransaction`
- `deleteTransaction`
- `importTransactions`
- `addGoal`
- `updateGoal`
- `deleteGoal`
- `addFundsToGoal`
- `addBudget`
- `updateBudget`
- `deleteBudget`
- `createTransfer`
- `uploadAttachment`

## Scaffolded Advanced Queue Types

- `runReceiptOcr`

`runReceiptOcr` remains review-required during sync; all other queued types are replayed automatically.
