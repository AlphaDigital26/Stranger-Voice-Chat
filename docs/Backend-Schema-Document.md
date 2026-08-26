# Backend Schema Document
## PitchLine — Voice Stranger Web App

**Author:** Senior Backend Engineering
**Status:** Draft v1.0
**Companion docs:** PRD, TRD, App-Flow-Document, UIUX-Design-Brief
**Database:** PostgreSQL (primary), Redis (ephemeral/cache — see §7)
**Last Updated:** August 18, 2026

**Purpose:** Complete, implementation-ready schema for V1. Every table maps to a feature in the PRD/App Flow doc — nothing is speculative. Types use PostgreSQL conventions. All tables use `uuid` primary keys (not serial ints) to avoid enumeration/scraping of user or session counts, which matters for an anonymity-positioned product.

---

## 1. Conventions

- **Primary keys:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` on every table (requires `pgcrypto` or `pg_uuid_ossp` extension).
- **Timestamps:** All tables include `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`; mutable tables also include `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` maintained via trigger.
- **Soft delete:** Tables holding user-generated or user-account data use `deleted_at TIMESTAMPTZ NULL` (nullable) rather than hard delete, to support the account-deletion + GDPR/CCPA export flow (TRD §8) while preserving referential integrity for reports/moderation history during any legal retention window. Hard-delete/purge is a scheduled job run after the retention window closes, not an immediate `DELETE`.
- **Enums:** Implemented as Postgres `CHECK` constraints on `TEXT` columns (not native `ENUM` types) — easier to extend without migration lock issues as the product evolves.
- **Foreign keys:** `ON DELETE` behavior specified explicitly per table — never left to default.

---

## 2. Table: `users`

Core account record. Created at signup (`/signup`), gates all `[AUTH REQUIRED]` screens per App Flow doc.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | |
| `email` | TEXT | UNIQUE, NOT NULL | Lowercased before insert (case-insensitive uniqueness via functional unique index — see §8). |
| `password_hash` | TEXT | NULL | NULL if account is OAuth-only (Google). Hashing handled by managed auth provider (TRD §5) — this column stores provider-returned hash reference if self-managed, or is unused/omitted if fully delegated to Clerk/Auth0. |
| `auth_provider` | TEXT | NOT NULL, CHECK IN ('email','google') | |
| `oauth_subject_id` | TEXT | NULL | Provider's unique subject id for OAuth accounts (e.g. Google `sub` claim). |
| `age_confirmed_at` | TIMESTAMPTZ | NULL | Set at signup checkbox confirmation (App Flow §2) or via `/age-confirm` (App Flow §4). NULL = must be routed to `/age-confirm`. |
| `status` | TEXT | NOT NULL, DEFAULT 'active', CHECK IN ('active','suspended','banned') | Drives `/banned` screen gate (App Flow §12). |
| `status_reason` | TEXT | NULL | Internal note on suspension/ban cause — disclosure to user is an open decision (App Flow §15.9); column exists regardless of UI exposure. |
| `default_country_filter` | TEXT | NULL | ISO 3166-1 alpha-2 code. Only populated if filter persistence is confirmed in scope (App Flow §15.8). |
| `default_language_filter` | TEXT | NULL | ISO 639-1 code. |
| `last_seen_at` | TIMESTAMPTZ | NULL | Updated on session activity — supports presence features and "last talked" display on contacts (App Flow §9). |
| `subscription_tier` | TEXT | NOT NULL, DEFAULT 'free', CHECK IN ('free','paid') | Drives the freemium rate-limit gate on `/intent` (App Flow §5). |
| `stripe_customer_id` | TEXT | NULL, UNIQUE | Set once the user has a Stripe customer record (created at first checkout attempt, per TRD §6.2). |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| `deleted_at` | TIMESTAMPTZ | NULL | Soft-delete marker (§1). |

**Indexes:**
- `UNIQUE INDEX users_email_lower_idx ON users (LOWER(email)) WHERE deleted_at IS NULL`
- `INDEX users_status_idx ON users (status) WHERE deleted_at IS NULL`
- `INDEX users_oauth_subject_idx ON users (oauth_subject_id) WHERE oauth_subject_id IS NOT NULL`

**Ownership rule:** A user record is owned exclusively by the account holder. No other user can read another user's `email`, `password_hash`, `status_reason`, or `oauth_subject_id` via any API — these fields are never serialized in any public-facing response (see §9 permissions matrix).

---

## 3. Table: `intent_tags`

Lookup table for conversation intent tags (App Flow §5). Kept as a table, not a hardcoded enum, so product can adjust tag copy/availability without a schema migration.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `slug` | TEXT | UNIQUE, NOT NULL | e.g. `pitch_idea`, `give_feedback`, `open_discussion`, `founder_chat`. |
| `label` | TEXT | NOT NULL | Display copy, e.g. "Pitch My Idea". |
| `sort_order` | SMALLINT | NOT NULL, DEFAULT 0 | Controls display order on `/intent`. |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Soft-disable a tag without deleting historical references. |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:** `INDEX intent_tags_active_idx ON intent_tags (is_active, sort_order)`

**Ownership rule:** Public read-only reference data. No user-level ownership; writable only via internal admin tooling.

---

## 4. Table: `sessions` (voice call sessions)

One row per completed or attempted call (App Flow §6–§8, TRD §4 core schema). Distinct from *auth* sessions (§10) — naming kept as `sessions` per TRD's original schema but understood here as "call sessions."

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | This is the `:sessionId` used in `/call/:sessionId` and `/post-call/:sessionId` routes. |
| `user_a_id` | UUID | FK → `users(id)` ON DELETE SET NULL, NOT NULL initially but nullable post-deletion | Nullable so a deleted user's historical session row can persist for the other party's history/moderation record without violating FK integrity. |
| `user_b_id` | UUID | FK → `users(id)` ON DELETE SET NULL | Nullable, same reasoning. NULL only if matched via direct contact-call and matching fails/times out before pairing — otherwise always populated once matched. |
| `intent_tag_a_id` | UUID | FK → `intent_tags(id)` ON DELETE SET NULL | Intent selected by user A at queue time. |
| `intent_tag_b_id` | UUID | FK → `intent_tags(id)` ON DELETE SET NULL | Intent selected by user B. |
| `match_type` | TEXT | NOT NULL, DEFAULT 'random', CHECK IN ('random','direct_contact') | Distinguishes random-queue matches from direct contact-to-contact calls. **`direct_contact` is confirmed deferred, not V1 scope** (App Flow §9) — column exists so the data model supports it without a future migration, but V1 application code only ever writes `'random'`. |
| `country_filter` | TEXT | NULL | Filter applied at match time, if any. |
| `started_at` | TIMESTAMPTZ | NULL | Set when WebRTC connection reaches `connected` state (App Flow §7) — NOT at queue join. NULL if match never connected. |
| `ended_at` | TIMESTAMPTZ | NULL | |
| `duration_seconds` | INTEGER | NULL, CHECK (duration_seconds >= 0) | Derived/stored at call end for fast history queries (avoid recomputing from timestamps on every read). |
| `end_reason` | TEXT | NULL, CHECK IN ('hangup','skip','report','drop','timeout') | Per App Flow §7 action table. |
| `ended_by_user_id` | UUID | FK → `users(id)` ON DELETE SET NULL | Which party triggered the end (NULL if `end_reason = 'drop'` and neither party actively ended it). |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Queue-join time (distinct from `started_at`). |

**Indexes:**
- `INDEX sessions_user_a_idx ON sessions (user_a_id, created_at DESC)`
- `INDEX sessions_user_b_idx ON sessions (user_b_id, created_at DESC)`
- `INDEX sessions_end_reason_idx ON sessions (end_reason)`

**Ownership rule:** A session row is jointly "owned" by `user_a_id` and `user_b_id` for read purposes (each can see it in their own `/history`), but neither can read the *other's* identity beyond what the product intentionally exposes (App Flow's explicit "no name/photo shown" rule, §7) — enforced at the API layer, not the DB layer, since both need row access for their own history view. See §9.

---

## 5. Table: `session_messages` (in-call text chat)

Per-call text chat messages (App Flow §7, PRD §4.1). Separate from `contact_messages` (§6), which is async 1:1 messaging between contacts.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `session_id` | UUID | FK → `sessions(id)` ON DELETE CASCADE, NOT NULL | Deleting a session (rare — only via data-retention purge) cascades to its messages. |
| `sender_id` | UUID | FK → `users(id)` ON DELETE SET NULL | Nullable so historical messages survive account deletion for the counterpart's reference during any retention window. |
| `body` | TEXT | NOT NULL, CHECK (char_length(body) <= 2000) | Reasonable cap to prevent abuse/spam payloads. |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:** `INDEX session_messages_session_idx ON session_messages (session_id, created_at ASC)`

**Ownership rule:** Readable only by the two participants of the parent `session_id`. Never readable by a third party except moderation roles reviewing an associated report (§9).

**Retention note:** Per TRD §8/§6, this is *text* only — no audio is stored here. Text messages ARE retained (unlike audio, which is buffer-only and report-triggered) since they're lower-risk and useful for moderation context; still subject to the same account-deletion soft-delete cascade eventually purging content, per legal review requirements flagged in TRD §10.

---

## 6. Table: `contacts`

Mutual contact relationships (App Flow §9, PRD §4.8, TRD §4 core schema).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → `users(id)` ON DELETE CASCADE, NOT NULL | The "owner" side of this row — see note below on symmetric-row modeling. |
| `contact_user_id` | UUID | FK → `users(id)` ON DELETE CASCADE, NOT NULL | The contact being referenced. |
| `nickname` | TEXT | NULL | **Not user-writable in V1** (confirmed decision, App Flow §7) — column reserved for a future fast-follow. In V1, display name is always a generated placeholder (e.g., "Stranger #4821") computed at read-time from `contact_user_id`, not stored. |
| `source_session_id` | UUID | FK → `sessions(id)` ON DELETE SET NULL | The call that produced this contact — nullable in case the session record is later purged. |
| `status` | TEXT | NOT NULL, DEFAULT 'pending', CHECK IN ('pending','accepted') | Supports the request/confirm flow in App Flow §7 (both parties must add each other). |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Updated when status flips to `accepted`. |

**Modeling note:** Contacts are modeled as **two rows per relationship** (one from A→B, one from B→A), each independently owned, rather than one symmetric row. This is deliberate: it allows each user to set their own private nickname for the other, matches the "request/accept" flow cleanly (A's row starts `pending` until B creates their own row, at which point both flip to `accepted`), and keeps per-user ownership/RLS simple (§9) — a user only ever queries/mutates rows where `user_id = self`.

**Indexes:**
- `UNIQUE INDEX contacts_unique_pair_idx ON contacts (user_id, contact_user_id)`
- `INDEX contacts_user_idx ON contacts (user_id, status, created_at DESC)`

**Ownership rule:** A `contacts` row is owned exclusively by `user_id`. User A can never read or write User B's row of the same relationship (e.g., A cannot see or change the nickname B has privately set for A).

---

## 7. Table: `contact_messages`

Async 1:1 messaging between confirmed contacts (App Flow §9 — `/contacts/:contactId/messages`).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `contact_pair_key` | UUID | NOT NULL | Deterministic value derived from the sorted pair of `(user_id, contact_user_id)` UUIDs (e.g., hash of the two ids in fixed order) — used to group a thread regardless of which of the two `contacts` rows is referenced. See indexing note below. |
| `sender_id` | UUID | FK → `users(id)` ON DELETE SET NULL | |
| `recipient_id` | UUID | FK → `users(id)` ON DELETE SET NULL | |
| `body` | TEXT | NOT NULL, CHECK (char_length(body) <= 2000) | |
| `read_at` | TIMESTAMPTZ | NULL | Supports unread-message indicators. |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:**
- `INDEX contact_messages_pair_idx ON contact_messages (contact_pair_key, created_at ASC)`
- `INDEX contact_messages_recipient_unread_idx ON contact_messages (recipient_id) WHERE read_at IS NULL`

**Ownership rule:** Readable only by `sender_id` and `recipient_id`. A message can only be created between two users with a **mutual `accepted` contact relationship** — enforced at the application/API layer by checking both `contacts` rows exist with `status = 'accepted'` before insert (not enforceable as a pure DB constraint given the two-row contact model, so this is an explicit API-layer business rule, flagged here so it isn't missed).

---

## 8. Table: `reports`

Safety reports (App Flow §7a, PRD §4.4, TRD §4/§8).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `session_id` | UUID | FK → `sessions(id)` ON DELETE SET NULL | Nullable in case the session is later purged, though reports themselves are retained longer than ordinary sessions (moderation/legal necessity). |
| `reporter_id` | UUID | FK → `users(id)` ON DELETE SET NULL | |
| `reported_id` | UUID | FK → `users(id)` ON DELETE SET NULL | |
| `reason_code` | TEXT | NOT NULL, CHECK IN ('harassment','hate_speech','sexual_content','spam_self_promo','other') | Per App Flow §7a. |
| `free_text_note` | TEXT | NULL, CHECK (char_length(free_text_note) <= 280) | Only populated when `reason_code = 'other'`. |
| `audio_buffer_url` | TEXT | NULL | Points to the S3/R2 object. **Confirmed decision: never populated in V1** (TRD §6.1) — no audio buffer capture ships in V1 at all. Column retained in the schema for forward-compatibility only; application code must not contain any path that writes to it in V1. |
| `status` | TEXT | NOT NULL, DEFAULT 'pending', CHECK IN ('pending','reviewed','actioned','dismissed') | |
| `reviewed_by` | UUID | FK → `users(id)` ON DELETE SET NULL | References a moderator/admin user (see `role` in §2 extension, §9). |
| `reviewed_at` | TIMESTAMPTZ | NULL | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:**
- `INDEX reports_status_idx ON reports (status, created_at ASC)` — moderation queue ordering, oldest-pending-first.
- `INDEX reports_reported_user_idx ON reports (reported_id, created_at DESC)` — supports repeat-offender detection.

**Ownership rule:** Readable by the `reporter_id` (their own submission, status only — not full moderation detail) and by users with `role IN ('moderator','admin')` (§9). The `reported_id` user has **no read access to reports made against them** — standard practice to prevent retaliation and preserve reporter safety.

---

## 9. Table: `bans`

Ban/suspension records (App Flow §12, TRD §4).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → `users(id)` ON DELETE CASCADE, NOT NULL | |
| `reason` | TEXT | NOT NULL | Internal moderation note. |
| `related_report_id` | UUID | FK → `reports(id)` ON DELETE SET NULL | Traceability back to the triggering report, if any. |
| `issued_by` | UUID | FK → `users(id)` ON DELETE SET NULL | Moderator/admin who issued it; NULL if system-automated (e.g., auto-ban after N reports — a possible future rule, not V1 logic, but the column supports it). |
| `expires_at` | TIMESTAMPTZ | NULL | NULL = permanent. |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:** `INDEX bans_user_active_idx ON bans (user_id) WHERE expires_at IS NULL OR expires_at > now()`

**Ownership rule:** Fully internal/moderation-only table. No user-facing read access at all — the `/banned` screen reads only the denormalized `users.status` / `users.status_reason` fields (§2), never this table directly, keeping the ban audit trail separate from what's exposed to the affected user.

**Application rule:** On insert, a trigger or application-layer transaction must also set `users.status = 'banned'` (and `status_reason` if disclosure is enabled) — kept as two tables rather than one to preserve full ban *history* (a user could be banned, appealed, unbanned, and re-banned — `users.status` reflects current state, `bans` reflects the full log).

---

## 10. Table: `data_export_requests`

Supports GDPR/CCPA "Download my data" (App Flow §11, TRD §8).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → `users(id)` ON DELETE CASCADE, NOT NULL | |
| `status` | TEXT | NOT NULL, DEFAULT 'pending', CHECK IN ('pending','processing','completed','failed') | |
| `download_url` | TEXT | NULL | Signed, expiring URL emailed on completion. |
| `expires_at` | TIMESTAMPTZ | NULL | Download link expiry (e.g., 7 days). |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| `completed_at` | TIMESTAMPTZ | NULL | |

**Indexes:** `INDEX data_export_user_idx ON data_export_requests (user_id, created_at DESC)`

**Ownership rule:** Owned exclusively by `user_id`.

---

## 11. Table: `session_feedback`

Post-call micro-survey (App Flow §8, PRD §7 success metrics).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `session_id` | UUID | FK → `sessions(id)` ON DELETE CASCADE, NOT NULL | |
| `user_id` | UUID | FK → `users(id)` ON DELETE SET NULL | Which of the two participants gave this feedback. |
| `rating` | SMALLINT | NOT NULL, CHECK (rating IN (0,1)) | 0 = thumbs down, 1 = thumbs up (per App Flow §8's simple thumbs pattern; extendable to a scale later without breaking this column). |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:**
- `UNIQUE INDEX session_feedback_unique_idx ON session_feedback (session_id, user_id)` — one feedback entry per user per session.

**Ownership rule:** Write-once by the submitting user; readable in aggregate by product/analytics roles only (§9), not exposed to either call participant individually (avoids one party seeing "you got a thumbs down").

---

## 11a. Table: `subscriptions`

Tracks paid-tier subscription state, synced from Stripe (per TRD §6.2 build-vs-buy decision — Stripe Billing owns the source of truth for payment state; this table is a local cache/mirror for fast reads, not the system of record).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → `users(id)` ON DELETE CASCADE, NOT NULL, UNIQUE | One active subscription record per user. |
| `stripe_subscription_id` | TEXT | UNIQUE, NOT NULL | |
| `status` | TEXT | NOT NULL, CHECK IN ('active','past_due','canceled','incomplete') | Mirrors Stripe's subscription status enum. |
| `current_period_end` | TIMESTAMPTZ | NOT NULL | Used to determine access even if a webhook is briefly delayed. |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Updated on every Stripe webhook event received for this subscription. |

**Indexes:** `UNIQUE INDEX subscriptions_user_idx ON subscriptions (user_id)`

**Ownership rule:** Owned exclusively by `user_id` for read purposes; writable only by the backend's Stripe webhook handler, never directly by any client request — a user cannot set their own `status` to `active` via the API.

**Application rule:** `users.subscription_tier` is a denormalized convenience field kept in sync with this table's `status` (`active` → `'paid'`, anything else → `'free'`) via the same webhook handler — read paths can check the fast denormalized field without a join, while `subscriptions` retains full billing history/detail.

---

## 12. `users` table extension: role column

Add to §2's `users` table for moderation/admin access control:

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `role` | TEXT | NOT NULL, DEFAULT 'user', CHECK IN ('user','moderator','admin') | Drives permission checks in §14. Not user-editable via any public API — settable only via internal admin tooling/direct DB access. |

---

## 13. Entity Relationship Summary

```
users ||--o{ sessions : "user_a_id / user_b_id"
users ||--o{ session_messages : "sender_id"
users ||--o{ contacts : "user_id (owner side)"
users ||--o{ contacts : "contact_user_id (referenced side)"
users ||--o{ contact_messages : "sender_id / recipient_id"
users ||--o{ reports : "reporter_id / reported_id"
users ||--o{ bans : "user_id"
users ||--o{ data_export_requests : "user_id"
users ||--o{ session_feedback : "user_id"
users ||--o| subscriptions : "user_id"

sessions ||--o{ session_messages : "session_id"
sessions ||--o{ reports : "session_id"
sessions ||--o{ session_feedback : "session_id"
sessions }o--|| intent_tags : "intent_tag_a_id / intent_tag_b_id"

contacts }o--o{ sessions : "source_session_id"
reports ||--o{ bans : "related_report_id"
```

---

## 14. Authentication & Session Handling

Per TRD §5 (managed auth provider — Clerk/Auth0-style), the backend's role is to **validate**, not issue, primary credentials, while owning the app-specific session/authorization layer.

### 14.1 Auth flow
1. Client authenticates against the managed auth provider (email/password or Google OAuth).
2. Provider issues a **short-lived JWT access token** (e.g., 15 min TTL) and a **refresh token** (longer-lived, e.g., 30 days, stored as an httpOnly secure cookie — never in `localStorage`, to reduce XSS token-theft risk).
3. On each API request, the backend validates the JWT signature against the provider's public key (JWKS endpoint), extracts the subject id, and resolves it to the internal `users.id` via the `oauth_subject_id` / provider mapping.
4. If the JWT is expired, the client's HTTP client wrapper transparently attempts a refresh (per App Flow §13 global error convention) before retrying the original request.
5. On WebSocket connection (matchmaking/signaling, TRD §3), the JWT is passed during the handshake (query param or initial auth message) and validated before the connection is allowed to join the matchmaking queue — an unauthenticated or expired-token socket is rejected immediately, not allowed to linger.

### 14.2 Internal session concept vs. `sessions` table
To avoid naming collision with the `sessions` table (which is call sessions, §4), the **auth session** (JWT + refresh token pair) is not stored as its own Postgres table in V1 — it's managed by the auth provider and validated statelessly per-request. If the team later needs server-side session revocation lists (e.g., "log out all devices"), a `auth_sessions` table would be introduced at that point; not required for V1 given the managed-provider approach.

### 14.3 Age-gate enforcement
Every authenticated API route (except `/api/age-confirm` itself and account/logout endpoints) checks `users.age_confirmed_at IS NOT NULL` server-side, in addition to the client-side redirect logic in App Flow §0/§4 — **the client-side gate is a UX convenience, not a security boundary**; the API must independently enforce this, since a client could otherwise be bypassed.

### 14.4 Ban enforcement
Every authenticated API route checks `users.status = 'active'` server-side before processing the request (except the minimal set needed to render `/banned` and log out). Same principle as 14.3 — enforced server-side regardless of client routing.

---

## 15. Permissions Matrix

| Resource | `user` (self) | `user` (other, non-participant) | `moderator` | `admin` |
|---|---|---|---|---|
| `users` — own row, full fields | Read/Write (limited fields: email, filters, nickname prefs) | No access | Read (for moderation context) | Read/Write |
| `users` — other user's row | No access to `email`, `password_hash`, `status_reason` | Same as above | Read (limited) | Read/Write |
| `sessions` — own (as participant) | Read | No access | Read | Read |
| `session_messages` — own session | Read/Write (during active call only) | No access | Read (only if tied to a `reports` row under review) | Read |
| `contacts` — own rows | Read/Write | No access to others' rows for same relationship | No access | Read (support cases only) |
| `contact_messages` — own thread | Read/Write | No access | No access (private unless subject of a report) | Read (support/legal cases only) |
| `reports` — own submission | Read (status only, not full record) | No access | Read/Write (full record, review workflow) | Read/Write |
| `reports` — where user is `reported_id` | No access | — | Read/Write | Read/Write |
| `bans` | No access (sees only denormalized `users.status`) | No access | Read/Write | Read/Write |
| `data_export_requests` — own | Read/Write (create request) | No access | No access | Read |
| `session_feedback` — own submission | Write-once | No access | No access | Read (aggregate) |
| `intent_tags` | Read | Read | Read | Read/Write |

**Enforcement layer:** This matrix is enforced at the **API/application layer** (middleware checking `role` + resource ownership before each handler executes), not via Postgres Row-Level Security (RLS) in V1 — RLS adds operational complexity (connection pooling via a service role bypasses RLS by default, requiring careful setup) that isn't justified yet for a single backend service with no direct client-to-DB access. **Revisit RLS if/when the architecture introduces direct client-to-Postgres access** (e.g., via Supabase client SDKs) — not the case per the TRD's BFF-mediated architecture.

---

## 16. Data Ownership Rules (summary)

1. **A user owns their own account data** (`users` row's private fields, `contacts` rows they created, `contact_messages` they sent/received, `data_export_requests`, `session_feedback` they submitted) and can read/export/delete it.
2. **Call sessions are jointly accessible** to both participants for their own history view, but never expose the counterpart's identity fields — only what the product intentionally shows (intent tag, duration; never email or account id) per App Flow's anonymity-by-design rule.
3. **Reports are one-directional in visibility** — the reporter can confirm submission; the reported user never sees the report; only moderation roles see full detail. This is a deliberate safety design, not an oversight.
4. **Bans are entirely internal** — the audit trail (`bans` table) is never exposed to the affected user, only the current-state summary (`users.status`) is, and only insofar as it's needed to show the `/banned` screen.
5. **Deletion is soft first, hard second** — account deletion (App Flow §11) soft-deletes the `users` row and cascades appropriately, but reports/moderation-relevant data tied to that user may be retained past the user's own deletion for a defined legal/safety retention window before a scheduled hard-purge job removes it — this must be disclosed in the Privacy Policy and is flagged for legal review consistent with TRD §8/§10.

---

## 17. Resolved Decisions (formerly open)

1. **Audio buffer capture:** Not implemented in V1 (§8). `audio_buffer_url` remains permanently NULL for all V1 rows.
2. **Contact nicknames:** System-generated placeholders only in V1 (§6). `contacts.nickname` is schema-present but not API-writable.
3. **Direct call-to-contact:** Deferred, not V1 (§4). `match_type` always `'random'` in V1 application code.
4. **Data retention window:** **30 days** post account-deletion before scheduled hard-purge of soft-deleted records (§16 point 5) — treat as the working engineering assumption; still subject to final legal sign-off per the original flag, but 30 days is what the purge job should be built against now.

## 18. Remaining Open Decision

1. Exact freemium rate-limit thresholds (matches/day on the free tier) — needed to finalize the application-layer logic that checks `users.subscription_tier` against a Redis-backed daily counter before allowing a `/queue` join. Recommend defaulting to a conservative number (e.g., 3–5 matches/day free) at launch and tuning based on early engagement data, rather than blocking build on getting this number perfectly right upfront.
