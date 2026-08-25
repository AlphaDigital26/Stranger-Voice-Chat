# Implementation Plan
## PitchLine — Voice Stranger Web App

**Author:** Full-Stack Engineering / Project Management
**Status:** Draft v1.0
**Companion docs:** PRD, TRD, App-Flow-Document, UIUX-Design-Brief, Backend-Schema-Document
**Last Updated:** August 18, 2026

**Purpose:** Sequenced, phase-by-phase build plan from zero to launched V1. Each phase lists concrete deliverables, exit criteria (how you know the phase is actually done), and dependencies on prior phases. Phases are ordered to front-load the riskiest/most uncertain technical work (WebRTC matching) rather than saving it for last, since that's where scope surprises are most likely to hide.

---

## 0. Pre-Phase: Decisions Locked

The following decisions have been made and are now binding for the build (see each linked doc for full reasoning):

1. **Audio-buffer capture: not in V1.** Reports capture text/metadata only. No two-party consent recording risk in V1 (TRD §6.1, Schema §17.1).
2. **WebRTC infra: LiveKit Cloud** (TRD §3/§9). Daily.co remains documented fallback only.
3. **Intent tags (final): "Pitch My Idea," "Give Feedback," "Open Discussion," "Founder Chat"** (PRD §4.2, App Flow §5).
4. **Contact nicknames: system-generated placeholders in V1** (e.g., "Stranger #4821") — no user-editable nickname field (App Flow §7, Schema §17.2).
5. **Direct call-to-contact: deferred, not V1.** Random matchmaking only (App Flow §9, Schema §17.3).
6. **Data retention: 30 days** post account-deletion before scheduled hard-purge (Schema §17.4) — working assumption, still pending final legal sign-off.
7. **Monetization: freemium (primary) + AdSense/Ezoic on non-conversation screens (secondary).** No ads on `/call` or messaging screens, per AdSense's private-communications policy. Stripe is the default payment provider (TRD §6.2).

**Remaining open item carried forward:** exact freemium rate-limit thresholds (Schema §18) — default to a conservative 3–5 free matches/day at launch, tune post-launch.

**Deliverable:** This decision log itself, now embedded across all six planning docs (PRD, TRD, App Flow, UIUX Brief, Schema, this plan) — no further sign-off needed before Phase 1 begins.

---

## Phase 1: Project Setup & Foundations

**Goal:** A working, deployable "hello world" skeleton with the full toolchain wired up, so every subsequent phase is additive rather than foundational.

### Tasks
- Initialize monorepo structure (recommend a monorepo given the shared TypeScript types between frontend and the two backend services, per TRD §3): `/apps/web` (Next.js), `/apps/api` (Fastify/NestJS BFF), `/apps/signaling` (matchmaking/signaling service), `/packages/shared-types`.
- Set up TypeScript configs, ESLint, Prettier, shared config packages.
- Set up PostgreSQL locally (Docker Compose) + Redis locally.
- Set up a migration tool (e.g., **Prisma** or **Drizzle ORM** — recommend Prisma for its migration tooling maturity and TypeScript-first schema, given the schema's complexity in the Backend Schema doc) and run the first migration implementing all tables from that document.
- Set up environment variable management (`.env` per app, documented in a `.env.example`).
- Set up CI pipeline skeleton (GitHub Actions): lint + typecheck + test on every PR, no deploy yet.
- Provision staging infrastructure accounts (Vercel, Fly.io/Render, managed Postgres, managed Redis — per TRD §7), but deploy only placeholder "it works" pages/endpoints to confirm the pipeline end-to-end.
- Set up design tokens (colors, spacing, typography from UIUX Design Brief §12) as a Tailwind config / CSS variables file in `/apps/web`.

### Deliverables
- Monorepo with all four apps building and running locally via one command (e.g., `pnpm dev`).
- Postgres schema fully migrated (all 11 tables from Schema doc §2–§12) in local + staging environments.
- CI green on an empty/skeleton PR.
- Staging URLs live, showing placeholder pages, for web + API.
- Design token file matching UIUX Design Brief §12 exactly.

### Exit Criteria
A new engineer can clone the repo, run one setup command, and have the full stack running locally within 15 minutes, with staging deploys working on merge to `main`.

---

## Phase 2: Authentication & User Foundation

**Goal:** Users can sign up, log in, and the app correctly enforces the age-gate and ban-gate on every route, per App Flow §2–§4 and §12–§14 auth rules from the Schema doc.

### Tasks
- Integrate managed auth provider (Clerk or Auth0, per TRD §5 recommendation and Pre-Phase decision).
- Implement `/signup` and `/login` screens per App Flow §2–§3 exactly (all listed states: validation errors, duplicate email, OAuth flow, rate limiting).
- Implement the `users` table sync: on first successful auth, create/update the corresponding `users` row (via webhook from the auth provider or on first authenticated API call) — map `oauth_subject_id`, `auth_provider`, `email`.
- Implement `age_confirmed_at` capture at signup (checkbox) and the `/age-confirm` fallback screen (App Flow §4) for edge cases.
- Implement server-side middleware enforcing (per Schema §14.3–14.4):
  - JWT validation on every protected route.
  - Age-gate check (redirect/error if `age_confirmed_at IS NULL`).
  - Ban-gate check (redirect/error if `status != 'active'`).
- Implement `/banned` screen (App Flow §12).
- Implement global 401/session-expiry handling (App Flow §13) — silent refresh, fallback to `/login` with toast.
- Implement rate limiting on login/signup endpoints (Redis-backed, per TRD §8).

### Deliverables
- Full signup → login → logout loop working end-to-end against staging.
- Age-gate and ban-gate middleware with test coverage (at least one automated test per gate confirming it blocks correctly).
- `/banned` screen fully functional (manually testable by flipping a user's `status` in the DB).

### Exit Criteria
A test user can sign up, get redirected correctly based on age-confirmation state, and a manually-banned test user is correctly routed to `/banned` and blocked from all other authenticated routes — verified via both UI click-through and direct API calls (to confirm server-side enforcement, not just client-side routing).

---

## Phase 3: Core Database & Backend API Layer

**Goal:** All non-real-time backend functionality (everything except matchmaking/WebRTC) is implemented and testable via API, ahead of any UI being wired to it.

### Tasks
- Implement REST API endpoints (BFF, per TRD §3) for:
  - `intent_tags` (read).
  - `contacts` (create/accept request, list, nickname update).
  - `contact_messages` (send, list thread, mark read).
  - `reports` (create, per user's own view).
  - `data_export_requests` (create, status check).
  - `session_feedback` (create).
  - `sessions` — read-only list (call history) for the authenticated user.
  - `users` — self-profile read/update (filters, settings).
- Implement the permissions matrix from Schema §15 as middleware/guards on each endpoint (role checks, ownership checks).
- Implement soft-delete + account deletion flow (§16 rule 5) including the cascading behavior described in the Schema doc.
- Write API-level integration tests for every endpoint's success + error states (this is where the App Flow doc's per-screen error states get validated against real backend behavior, ahead of frontend work).
- Set up background job infra (BullMQ, per TRD §3) with a first real job: the data export job (compiles a user's data, uploads to object storage, emails a link).

### Deliverables
- OpenAPI-documented REST API covering all non-realtime endpoints.
- Integration test suite covering every endpoint (Postman/Insomnia collection or automated test files, either is acceptable, but must be runnable in CI).
- Working data-export flow (async job → email → signed download link), tested manually end-to-end at least once against staging.

### Exit Criteria
Every screen in the App Flow doc that does NOT involve live voice (`/contacts`, `/history`, `/settings`, report submission, feedback submission) can be fully exercised via API calls alone (e.g., via Postman) with correct data returned and correct permission errors on unauthorized attempts.

---

## Phase 4: Matchmaking & Real-Time Signaling (highest-risk phase — front-loaded deliberately)

**Goal:** Two authenticated test users can be randomly paired and a live WebRTC voice connection established between them. This is the technical core of the product and the phase most likely to reveal unknowns, so it's sequenced before general UI polish work.

### Tasks
- Stand up the signaling service (`/apps/signaling`, per TRD §3) with Socket.IO/`ws`, Redis-backed queue.
- Implement queue join/leave logic: intent-tag-aware pairing with fallback-to-random (per PRD §4.2), country/language filter application.
- Integrate chosen WebRTC provider (per Pre-Phase decision — LiveKit/Daily SDK, or raw WebRTC + coturn if self-hosting was chosen).
- Implement the full signaling handshake: SDP offer/answer + ICE candidate exchange over the WebSocket connection, session creation in the `sessions` table at match time.
- Implement JWT-authenticated WebSocket handshake (Schema §14.1 step 5) — reject unauthenticated/expired-token connections.
- Implement `sessions` row lifecycle: created at match, `started_at` set on `connected` state, `ended_at`/`duration_seconds`/`end_reason` set on termination (hangup/skip/report/drop/timeout).
- Implement `session_messages` (in-call text chat) over the same signaling channel or WebRTC data channel.
- Build a minimal test harness (even a bare-bones unstyled page) to manually verify two browser tabs/devices can be matched and hear each other — **do not wait for final UI to validate this core loop.**
- Load-test the matchmaking queue logic with simulated concurrent users (even a simple script spinning up N fake queue joins) to catch obvious race conditions early.

### Deliverables
- Working matchmaking queue (Redis-backed) with intent-tag pairing + fallback logic.
- Two real browsers, two real microphones, successfully connected via WebRTC through the full stack (queue → signaling → peer connection → live audio).
- `sessions` and `session_messages` tables correctly populated by real call activity.
- A documented "known issues" list for anything WebRTC-related that's deferred (e.g., specific NAT traversal edge cases) rather than silently unresolved.

### Exit Criteria
A live demo: two team members on different networks (not same WiFi — to genuinely test NAT traversal/TURN fallback) can join the queue and have a real voice conversation through the deployed staging environment, with the resulting `sessions` row correctly recorded.

---

## Phase 5: Core UI — Primary User Flow

**Goal:** The full primary path from landing page through a live call and back is built and styled per the UIUX Design Brief, connected to the real backend/signaling work from Phases 2–4.

### Tasks (build in this order, matching the user's actual path)
1. `/` Landing page (App Flow §1) — SSR'd, per TRD's SEO reasoning.
2. `/signup`, `/login`, `/age-confirm` (Phase 2 backend already exists — this is the UI layer).
3. `/intent` — intent tag selector, mic permission handling (all states from App Flow §5), filters.
4. `/queue` — connects to the real signaling service from Phase 4, all states (searching, error, cancel).
5. `/call/:sessionId` — the core screen: WebRTC integration, mute/hangup/skip/report controls, audio visualizer (per UIUX Design Brief §6 signature component), text chat panel.
6. Report modal sub-flow (App Flow §7a).
7. `/post-call/:sessionId` — call summary, add-contact second chance, micro-survey.

### Tasks (design system)
- Build the shared component library first (buttons, inputs, cards, modals, toasts) per UIUX Design Brief §6, before building screens — screens should compose from this library, not each invent their own button styles.
- Implement responsive behavior per UIUX Design Brief §8 at each screen, not retrofitted after desktop-only build.
- Implement accessibility requirements (UIUX Design Brief §11) inline as each screen is built — focus states, aria-labels, live regions for call state changes — not as a separate later pass.

### Deliverables
- Fully functional, styled primary user flow: landing → signup → intent → queue → live call → post-call, indistinguishable in behavior from the App Flow doc's specification.
- Shared component library documented (e.g., a lightweight Storybook or an internal component demo page).
- Mobile-responsive verified manually on at least one real iOS and one real Android device (not just browser devtools emulation), given the mobile-first priority on the call screen.

### Exit Criteria
An external tester (someone not on the engineering team) can complete the full loop — sign up, confirm age, pick an intent, get matched with a teammate acting as the "stranger," have a real conversation, and land on the post-call screen — without engineer assistance or explanation.

---

## Phase 6: Secondary Features — Contacts, History, Settings

**Goal:** The utility/dashboard-style screens (App Flow §9–§11) are built against the already-working Phase 3 API.

### Tasks
- `/contacts` — list, empty state, message/call actions.
- `/contacts/:contactId/messages` — async chat thread UI.
- `/history` — call history list, empty state, pagination (per Pre-Phase/open-decision resolution).
- `/settings` — account, privacy (data export/delete), preferences.
- Wire the "Add Contact" request/accept flow fully (in-call trigger from Phase 5 + this phase's list/accept UI).
- Implement direct call-to-contact flow **only if** confirmed in scope during Pre-Phase decisions — otherwise explicitly stub the "Call" button as disabled/hidden with a clear code comment referencing the deferred decision, rather than half-building it.

### Deliverables
- All three utility screens fully functional and styled.
- End-to-end contact flow verified: two test users complete a call, both add each other, contact appears in both `/contacts` lists, messaging between them works.

### Exit Criteria
A returning user can review their history, manage contacts, message a contact, and update/delete their account entirely through the UI without needing direct API/DB access.

---

## Phase 6a: Monetization — Freemium Gating & Ad Integration

**Goal:** The freemium rate limit and payment upgrade path are live, and AdSense (or Ezoic as backup) is integrated on the approved non-conversation screens only.

### Tasks
- Implement `subscriptions` table sync via Stripe webhooks (per Schema §11a) — subscription created/updated/canceled events correctly update `users.subscription_tier`.
- Implement Stripe Checkout flow for upgrading from free to paid (triggered from the `/intent` paywall prompt, per App Flow §5/UIUX Brief §12a).
- Implement the Redis-backed daily match counter and the free-tier gate check on `/queue` join (block with upgrade prompt if limit hit, per App Flow §5).
- Build the "Upgrade to keep talking" prompt UI per UIUX Design Brief §12a (calm, non-punitive tone).
- Apply for AdSense approval early in this phase (approval can take days-to-weeks) — submit with the landing page and blog/content section live, since AdSense review will scrutinize the whole site, not just the ad-eligible pages.
- Integrate ad slot component (per UIUX Brief §12a) on the confirmed AdSense-eligible screens only: landing, `/intent`, `/post-call`, `/history`, `/contacts` (list view), `/settings`.
- **Hard guardrail:** add an automated check (lint rule, code review checklist item, or E2E test) confirming the ad slot component is never imported into `/call/:sessionId` or `/contacts/:id/messages` route files — this is a policy-compliance requirement, not just a design preference, so it should be enforced mechanically, not just by convention.
- Stand up the minimal blog/content section (per PRD §9) — even 3-5 launch articles are enough to support the AdSense application and begin SEO groundwork.
- If AdSense approval is delayed or partial, integrate Ezoic as the interim/parallel ad network on the same eligible screens.

### Deliverables
- Working Stripe Checkout upgrade flow, tested end-to-end (test-mode payment → `subscription_tier` flips to `'paid'` → rate limit lifted).
- Free-tier daily limit correctly enforced and correctly reset on schedule.
- AdSense application submitted (or approved, depending on review turnaround); ad slots rendering correctly on eligible screens.
- Automated guardrail confirming zero ad-slot usage on conversation/messaging screens.
- Minimal blog/content section live with initial articles.

### Exit Criteria
A free-tier test user hits the daily limit, sees the upgrade prompt, completes a test-mode Stripe payment, and immediately regains access without needing to log out/in. The automated guardrail test passes, proving no ad inventory can accidentally ship on the call or messaging screens.

---

## Phase 7: Trust & Safety Integrations

**Goal:** Moderation tooling and AI moderation integrations are live, per PRD §4.4–§4.5 and TRD §6/§8.

### Tasks
- Integrate text moderation API (OpenAI Moderation API / Perspective API / Hive, per Pre-Phase-adjacent TRD decision) on `session_messages` and `contact_messages` — synchronous scan before delivery, per TRD §8.
- Integrate async speech-to-text (Whisper/Deepgram) for reported-session audio buffers **only if** the audio-buffer legal review (Pre-Phase item #1) has cleared — otherwise this task is blocked/skipped for V1 and explicitly logged as deferred.
- Build a minimal internal moderation queue UI (even a simple internal-only admin page) for `moderator`/`admin` roles to review `reports` (per Schema §15 permissions matrix) — list pending reports, view associated session metadata + any available transcript, take action (dismiss/actioned → triggers a `bans` row).
- Implement the ban issuance flow: admin action → `bans` row created → `users.status` updated → user immediately loses access on next request (verify this doesn't require the banned user to log out/back in — should be enforced on their very next API call, per Schema §14.4).
- Implement rate limiting across report submission, contact requests, and queue joins (Redis-backed, per TRD §8) — abuse-prevention layer.

### Deliverables
- Live synchronous text moderation on all chat surfaces.
- Working internal moderation queue (however minimal) for the trust & safety operator to actually use at launch.
- Verified ban enforcement: a test ban issued through the internal tool immediately blocks the target account.

### Exit Criteria
A simulated abuse scenario — a test user sends flagged text content, gets reported, an admin reviews and bans them — works end-to-end through real UI (not manual DB edits) for every step except possibly the initial text moderation trigger, which can be simulated with known trigger phrases.

---

## Phase 8: Testing

**Goal:** Systematic verification across the whole product, not just the ad hoc checks embedded in earlier phases.

### Tasks
- **Unit tests:** backend business logic (permission checks, ban/age-gate middleware, matchmaking pairing logic) — target meaningful coverage on anything safety- or auth-related specifically, not just raw percentage.
- **Integration tests:** full API test suite (extends Phase 3 work) plus signaling service tests (queue join/leave, pairing correctness under concurrent load).
- **End-to-end tests:** automated browser tests (e.g., Playwright) covering the critical path from Phase 5's exit criteria — signup through a completed call — run against staging on every release candidate. WebRTC E2E testing is notoriously hard to fully automate; supplement automated coverage with a documented **manual test script** covering call quality, mic permission edge cases, and multi-device scenarios that must be run before each release.
- **Load testing:** simulate concurrent queue joins and active calls against staging to validate the matchmaking service and TURN/media infra hold up under realistic V1 launch volume (define a target number with product, e.g., "support 500 concurrent users" as a starting benchmark).
- **Security testing:** verify permission matrix (Schema §15) holds under direct API calls attempting to bypass ownership checks (e.g., user A trying to read user B's `contact_messages` via a crafted request) — this should be a deliberate adversarial test pass, not just happy-path testing.
- **Accessibility audit:** screen-reader pass on `/intent`, `/queue`, `/call` per UIUX Design Brief §11's explicit requirement, plus automated a11y linting (axe-core) in CI.
- **Cross-browser/device testing:** Chrome, Safari, Firefox on desktop; Safari iOS and Chrome Android on mobile — WebRTC has historically had browser-specific quirks, this is not optional.

### Deliverables
- CI-integrated unit + integration + E2E test suites, all green.
- Load test report with results against the defined concurrency target.
- Security test checklist completed with any findings resolved (not just documented and deferred, unless explicitly triaged as post-V1 acceptable risk with product sign-off).
- Accessibility audit report.
- Manual test script document for the WebRTC scenarios that resist full automation.

### Exit Criteria
No known critical or high-severity bugs open; load test meets the defined concurrency target; security adversarial tests all pass (no permission bypass found); accessibility audit has no blocking issues on the three flagged screens.

---

## Phase 9: Deployment

**Goal:** Production environment live, monitored, and ready for real users — per TRD §7 deployment plan.

### Tasks
- Provision production infrastructure (separate from staging): Vercel production project, production containers for API/signaling services, production Postgres, production Redis, production object storage.
- Configure production environment variables/secrets via a proper secrets manager (per TRD §8 security requirement).
- Set up production monitoring: Sentry (error tracking, per TRD §6), uptime monitoring, and dashboards for the key metrics from PRD §7 (activation, engagement, retention, trust & safety) — at minimum wired to the analytics tool chosen in TRD §6 (PostHog/Mixpanel).
- Set up alerting for critical failure modes: matchmaking service down, WebRTC connection success rate drop, elevated report rate, elevated 5xx error rate.
- Run a production smoke test: full critical-path walkthrough (Phase 5 exit criteria) against the live production environment before any public traffic.
- Configure domain, SSL, DNS.
- Prepare a rollback plan (documented steps to revert a bad deploy) before the first real production release, not improvised after an incident.

### Deliverables
- Live production environment at the final domain.
- Monitoring dashboards live and verified to be receiving real data.
- Alerting configured and tested (trigger a deliberate test alert to confirm it reaches the right people).
- Documented rollback procedure.

### Exit Criteria
Production smoke test passes cleanly; monitoring/alerting confirmed functional; team has a tested rollback path before opening access to real users.

---

## Phase 10: Final Polish & Launch Readiness

**Goal:** Close remaining gaps between "functionally complete" and "ready for real strangers to use," per PRD's non-functional expectations and UIUX Design Brief's stated principles.

### Tasks
- Full visual QA pass against the UIUX Design Brief — spacing, color, typography, motion/animation timing (§9) all matching spec, not approximate.
- Copy pass: all UI copy reviewed for tone consistency with UIUX Design Brief §1 principles (calm, confident, not gimmicky) — this includes error messages, empty states, and the report/ban flow copy, which are easy to leave as engineer-written placeholder text.
- Legal pages finalized: Terms of Service, Privacy Policy (reflecting the actual data retention, moderation, and audio-buffer decisions locked in Pre-Phase and Phase 7).
- Final review of all `[OPEN DECISION]` items across every prior doc — confirm each has been explicitly resolved and implemented as decided, not left as a default no one consciously chose.
- Performance pass: Lighthouse audit on the landing page (SEO/performance, per TRD's SSR rationale), bundle size check on the call screen (critical path, should load fast even on weaker connections).
- Soft-launch / limited beta: per PRD's cold-start liquidity risk (TRD §8, PRD §9), consider a scheduled "office hours" or limited-cohort launch rather than a full public opening on day one, to ensure enough concurrent users for matchmaking to actually feel instant.
- Final go/no-go review against PRD §7 success metrics instrumentation — confirm every metric listed is actually measurable from what's been built, not just aspirational.

### Deliverables
- Visual QA sign-off.
- Finalized legal pages live.
- Closed-out open-decisions log (from Pre-Phase §0, now with final resolutions documented).
- Performance audit report.
- Launch plan (soft-launch cohort size/timing, or full public launch decision) agreed with product.

### Exit Criteria
Product and engineering jointly sign off that the app matches the PRD, TRD, App Flow, and UIUX specs as built (not as originally planned — deviations are expected and fine, but must be reconciled and documented), and the team is ready to direct real user traffic to it.

---

## Phase Sequencing Summary

```
0. Decisions Locked
      |
1. Setup & Foundations
      |
2. Auth & User Foundation ──────┐
      |                          |
3. Core DB & Backend API         |
      |                          |
4. Matchmaking & WebRTC (risk-first)
      |
5. Core UI — Primary Flow ───────┘  (depends on 2, 3, 4)
      |
6. Secondary Features (Contacts/History/Settings) ── (depends on 3, 5's component library)
      |
6a. Monetization — Freemium & Ads ── (depends on 5's /intent screen, 6's component patterns)
      |
7. Trust & Safety Integrations ── (depends on 3, 5, 6)
      |
8. Testing ── (depends on everything above being feature-complete)
      |
9. Deployment (production)
      |
10. Final Polish & Launch Readiness
```

**Note on parallelization:** Phases 2 and 3 can run partially in parallel once Phase 1 is done (auth and general backend API work don't block each other). Phase 4 (matchmaking/WebRTC) is intentionally sequenced early and can also run in parallel with Phase 3, since it's the highest-uncertainty piece — surfacing its problems early protects the overall timeline. Phase 5's UI work can begin (component library, static screens) before Phase 4 fully completes, but the `/call` screen specifically is blocked on Phase 4's real signaling infrastructure. Phases 6 and 7 can partially overlap. Testing (Phase 8) should not be treated as a phase that only starts after Phase 7 — test-writing should happen continuously alongside Phases 2–7, with Phase 8 representing the *systematic, cross-cutting* pass, not the first time tests are written.

---

## Cross-Cutting Responsibilities (apply throughout, not phase-specific)

- **Documentation-as-you-go:** Every deviation from the PRD/TRD/App Flow/Schema/Design Brief during implementation should be noted (even briefly) rather than silently diverging — these docs are the source of truth for the "final polish" reconciliation pass in Phase 10.
- **Security review is continuous:** the permission matrix (Schema §15) and age/ban gates (Schema §14) should be checked with every new endpoint added, not just in the dedicated Phase 8 security pass.
- **Design system fidelity:** any engineer building UI should be checking against UIUX Design Brief tokens (§12) as they go, not approximating and fixing later — retrofitting design consistency across many screens is far more expensive than building it correctly the first time.
