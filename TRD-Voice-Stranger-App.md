# Technical Requirements Document
## PitchLine — Voice Stranger Web App

**Author:** Engineering / Architecture
**Status:** Draft v1.0
**Companion doc:** PRD-Voice-Stranger-App.md
**Last Updated:** August 18, 2026

---

## 1. Architecture Overview

PitchLine is a real-time, low-latency web application with three core technical demands:

1. **Real-time signaling & matchmaking** (pairing two strangers, handling queue state)
2. **Real-time media transport** (WebRTC peer-to-peer voice + fallback relay)
3. **Standard web app concerns** (auth, accounts, contacts, moderation, history) served by a conventional REST/GraphQL backend

Given this split, the architecture separates **stateful real-time services** (matchmaking queue, signaling, presence) from **stateless CRUD services** (accounts, contacts, reports), rather than forcing everything through one monolith.

```
┌─────────────────────────────────────────────────────────┐
│                        Browser (Client)                  │
│  Next.js SPA/SSR · WebRTC · WebSocket client              │
└───────────────┬───────────────────────┬───────────────────┘
                │ HTTPS (REST)          │ WSS (signaling)
┌───────────────▼───────────────┐  ┌─────▼─────────────────┐
│   API Gateway / BFF            │  │  Matchmaking &         │
│   (Node.js, Express/Fastify)   │  │  Signaling Service     │
│                                 │  │  (Node.js + ws/Socket.IO,│
│  - Auth                        │  │   Redis-backed queue) │
│  - Accounts/Contacts           │  └─────┬─────────────────┘
│  - Reports/Moderation admin    │        │
│  - Call history                │        │ TURN/STUN
└───────────┬─────────────────────┘  ┌─────▼─────────────────┐
            │                        │  Media Relay (TURN)   │
┌───────────▼─────────────┐          │  coturn / managed WebRTC│
│  PostgreSQL (primary DB) │          │  infra (e.g. LiveKit) │
└───────────────────────────┘        └───────────────────────┘
┌───────────────────────────┐
│  Redis (queue, presence,   │
│  rate limiting, sessions)  │
└───────────────────────────┘
┌───────────────────────────┐
│  Moderation pipeline        │
│  (async workers + AI APIs)  │
└───────────────────────────┘
```

---

## 2. Frontend Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js (React)** | SSR for fast first paint on the landing/marketing pages (SEO matters for organic growth, per the AirTALK reference), SPA behavior for the in-app call experience. Large ecosystem, easy hiring. |
| Language | **TypeScript** | Type safety across a codebase with WebRTC state machines and async signaling — this is exactly the kind of code where runtime type bugs are expensive to debug. |
| Styling | **Tailwind CSS** | Fast iteration, consistent design tokens, small bundle with purge. |
| Real-time client | **Native WebRTC API** wrapped in a custom hook/service layer, or **LiveKit/Daily client SDK** (see §9 build-vs-buy) | Abstracts ICE/SDP negotiation pain if using a managed provider; raw WebRTC if self-hosting media. |
| State management | **Zustand** or React Context + hooks | Call state (idle/queued/connecting/in-call) is a small, well-defined state machine — doesn't need Redux-level ceremony. |
| WebSocket client | **Socket.IO client** or native WS | Matchmaking queue status, signaling messages, presence updates. |
| Audio permission/UX | **getUserMedia + custom mic-check UI** | Users must explicitly grant mic access; need clear pre-call permission UX and mic-level meter for confidence. |

**Not chosen:** Video elements/camera UI — deliberately excluded from the frontend entirely in V1 (no `<video>` tag wired to local camera stream), reinforcing the audio-only product decision at the code level, not just policy.

---

## 3. Backend Stack

| Service | Choice | Reason |
|---|---|---|
| API/BFF | **Node.js + Fastify** (or NestJS if team prefers structure) | JS/TS across the stack reduces context switching; Fastify is lightweight and fast for a REST layer handling auth, accounts, contacts. NestJS is a reasonable alternative if the team wants stronger DI/module conventions as the codebase grows. |
| Matchmaking/Signaling | **Node.js + Socket.IO (or raw `ws`)**, backed by **Redis** | Matchmaking is fundamentally a queue + pairing problem — Redis lists/sorted sets are a natural fit for FIFO-ish queues with intent-tag partitioning and low-latency pop/pair operations. Node's event loop suits high-concurrency, low-CPU signaling workloads well. |
| Media transport | **WebRTC (peer-to-peer)** with **TURN relay fallback** | P2P keeps media cost near-zero for calls where NAT traversal succeeds; TURN (via **coturn**, self-hosted, or a managed provider) handles the ~15-20% of connections that need relay. |
| Background jobs | **BullMQ (Redis-backed)** | Async moderation review, report processing, scheduled cleanup (rolling audio buffer expiry), email notifications. |
| Moderation pipeline | Async workers calling **speech-to-text + toxicity/moderation APIs** (see §6) | Keep moderation off the real-time critical path; process flagged/reported buffers asynchronously in V1 rather than blocking calls on live classification (per PRD's cost-driven V1 scoping). |

---

## 4. Database

| Store | Choice | Reason |
|---|---|---|
| Primary relational DB | **PostgreSQL** | Strong fit for structured, relational data: users, contacts, reports, call metadata, ban records. ACID guarantees matter for ban enforcement and report integrity. |
| Cache / ephemeral state | **Redis** | Matchmaking queue, presence ("who's online/available"), rate-limiting counters, session tokens, short-TTL rolling audio buffer metadata. |
| Object storage | **S3-compatible storage (e.g. AWS S3 / Cloudflare R2)** | Short-lived audio buffer clips for moderation review (auto-expiring lifecycle policy, e.g. 7–14 days), never full call recordings. |
| Search (deferred) | Not needed in V1 (no user-generated content corpus to search yet) | Avoid premature infra. |

### Core schema (simplified)

```
users
  id, email, auth_provider, age_confirmed_at, created_at,
  status (active/banned/suspended), banned_reason

sessions (calls)
  id, user_a_id, user_b_id, intent_tag_a, intent_tag_b,
  started_at, ended_at, duration_seconds, end_reason (skip/hangup/report/drop)

contacts
  id, user_id, contact_user_id, created_at, source_session_id

reports
  id, session_id, reporter_id, reported_id, reason_code,
  status (pending/reviewed/actioned), audio_buffer_url, created_at, reviewed_at

bans
  id, user_id, reason, issued_by, expires_at (nullable = permanent)

intent_tags (lookup)
  id, label
```

---

## 5. Authentication

| Requirement | Approach | Reason |
|---|---|---|
| Signup method | **Email/password + Google OAuth** (via **Auth0**, **Clerk**, or **NextAuth/Auth.js** self-managed) | Lightweight friction per PRD, but persistent identity needed for ban enforcement — fully anonymous accountless auth is explicitly rejected in the PRD's "features to avoid" list. |
| Recommendation | **Managed auth provider (Clerk or Auth0)** for V1 | Building auth in-house is a common early-stage time sink; a managed provider handles password hashing, OAuth flows, session/JWT issuance, and basic bot/abuse protection out of the box. Revisit self-hosted auth only if cost or customization becomes a real constraint post-PMF. |
| Session tokens | **JWT (short-lived access token) + refresh token** | Standard stateless auth pattern; access token validated on API and WebSocket handshake without a DB round-trip. |
| Age verification | **Self-attestation checkbox at signup**, logged with timestamp | True identity-document age verification is disproportionate for V1 and adds friction/cost; self-attestation + ToS acceptance is the pragmatic V1 baseline, with the timestamp providing an audit trail if ever challenged. Flag as a legal review item (§8). |
| WebSocket auth | JWT passed on connection handshake, validated before joining matchmaking queue | Prevents unauthenticated users from consuming matchmaking/signaling resources. |

---

## 6. APIs & Third-Party Services

| API/Service | Purpose | Notes |
|---|---|---|
| **REST API (internal, BFF)** | Auth, accounts, contacts, reports, call history | Fastify/NestJS, OpenAPI-documented. |
| **WebSocket API (internal)** | Matchmaking queue join/leave, pairing notification, WebRTC signaling (SDP/ICE exchange) | Socket.IO namespace or raw `ws` protocol with a defined message schema. |
| **TURN/STUN** | NAT traversal for WebRTC | Self-hosted **coturn** cluster, or managed (Twilio Network Traversal, Cloudflare Calls) — see §9. |
| **Managed WebRTC infra** | **LiveKit Cloud (decided for V1)** | Confirmed choice for V1: generous self-serve free tier, open-source core (option to self-host later without a rewrite if costs grow), solid SDK support for building the intent-tag-aware room/matching logic on top. Daily.co remains a documented fallback if a pricing spike at target concurrent-call volume makes LiveKit unattractive — see build-vs-buy in §9. |
| **Speech-to-text** | Transcribe reported audio buffers for moderation review | **Deferred for V1** — decided not to capture audio buffers at all in V1 (see §6.1). Revisit this integration only alongside the audio-buffer legal review. |
| **Text/content moderation** | Classify transcript + in-call text chat for toxicity/hate/sexual content/spam | e.g. OpenAI Moderation API, Perspective API, or Hive Moderation. |
| **Email** | Verification, notifications (contact came online, ban notice) | e.g. Postmark, Resend, or SES. |
| **Analytics** | Activation/engagement/retention metrics from PRD §7 | e.g. PostHog or Mixpanel — self-hostable options preferable given the sensitive nature of the product. |
| **Error monitoring** | Sentry | Frontend + backend error tracking. |

---

### 6.1 Decision: No Audio Buffer Capture in V1

Given two-party consent recording laws vary by jurisdiction and legal review was not clearable in time for V1, **reports capture text transcript (in-call chat log, if used) and session metadata only — no audio is recorded or stored, ever, in V1.** The `reports.audio_buffer_url` column (Backend Schema §8) exists in the schema for forward-compatibility but must remain NULL for all V1 report rows; do not implement any code path that populates it. This also means the moderation pipeline's speech-to-text step is out of scope for V1 (see API table above) — moderation review works from text/metadata only.

### 6.2 Monetization-Driven Technical Requirements

Per the product's freemium + ad-supported model:
- **Ad placement is restricted by policy to non-call, non-messaging screens** (landing, intent, post-call, history, settings, and a planned blog/content section) — the frontend must never render ad slots inside `/call/:sessionId` or `/contacts/:id/messages`, and this should be enforced structurally (ad component only imported/used in the eligible screens' route files) rather than left to a styling convention that could be violated later.
- **Freemium rate limiting** requires tracking daily/rolling match counts per user (Redis counter, similar pattern to existing rate-limiting infra in §8) and a `subscription_tier` or equivalent field to distinguish free vs. paid users — see Backend Schema for the exact column addition.
- **Payment processing** (for the paid tier) needs a provider decision — **Stripe** is the default recommendation for V1 (Checkout + Billing for subscription management) given its maturity and low integration overhead; this is a build-vs-buy decision in the same spirit as auth/WebRTC (§9) — do not build custom subscription/invoicing logic.

---

## 7. Deployment Plan

| Environment | Approach |
|---|---|
| **Hosting** | **Vercel** for the Next.js frontend (fast SSR deploys, edge caching for marketing pages); **containerized services (Docker) on a managed platform** — e.g. **Fly.io**, **Render**, or **AWS ECS/Fargate** — for the API, matchmaking/signaling service, and background workers. |
| **Signaling service scaling** | Stateful WebSocket service needs sticky sessions or a Redis pub/sub adapter (e.g. `@socket.io/redis-adapter`) so matchmaking works correctly across multiple horizontally-scaled instances. |
| **TURN infra** | If self-hosting coturn: deploy in the same regions as expected user concentration, autoscale based on concurrent call volume. If using managed WebRTC (LiveKit/Daily), this is handled by the provider. |
| **Database hosting** | Managed Postgres (e.g. **Supabase**, **Neon**, or **AWS RDS**) — avoids self-managing backups/failover pre-PMF. |
| **Redis hosting** | Managed Redis (e.g. **Upstash** or **AWS ElastiCache**). |
| **CI/CD** | GitHub Actions → build/test → deploy to staging → manual promote to production. Separate pipelines for frontend (Vercel auto-deploy on merge) and backend services (Docker build → push → deploy). |
| **Environments** | `dev` → `staging` → `production`, with staging used for load-testing the matchmaking queue and WebRTC connection success rate before each release. |
| **Regions** | Start single-region (closest to initial user base) given V1 liquidity concerns from the PRD; expand multi-region once concurrent user volume justifies it (matchmaking works best with concentrated, not fragmented, user pools anyway). |

---

## 8. Security Requirements

| Area | Requirement |
|---|---|
| **Transport security** | TLS everywhere (HTTPS, WSS); WebRTC media is encrypted by default (DTLS-SRTP). |
| **Auth** | Password hashing via provider (bcrypt/argon2 under the hood if self-managed); short-lived JWTs; refresh token rotation; rate-limited login attempts. |
| **Rate limiting & abuse prevention** | Redis-backed rate limits on: signup, matchmaking queue joins, report submissions, contact-add requests — prevents bot floods and spam/solicitation abuse flagged in the PRD's risk section. |
| **Report/audio buffer handling** | Rolling buffer (e.g. last 30-60 sec) stored client-side or server-side only upon report trigger, encrypted at rest in object storage, auto-expiring lifecycle (7-14 days), access restricted to moderation role. **Legal review required** on two-party consent recording laws before shipping this feature — jurisdictions vary (PRD flags this explicitly); may need to disclose recording-on-report in ToS and/or geo-restrict the feature. |
| **PII minimization** | Store only what's needed (email, hashed password/OAuth id, age-confirmation timestamp) — no unnecessary personal data collection, consistent with the anonymity-focused product positioning. |
| **Ban enforcement** | Bans tied to account id (and secondarily to device fingerprint/IP hash as a deterrent against trivial re-signup evasion — note: IP-based enforcement has false-positive risk on shared/NAT'd IPs, use as a signal not sole determinant). |
| **Content moderation** | Text chat scanned synchronously (low latency, cheap) before delivery or immediately after with rapid takedown; audio moderation async via reports in V1 (per PRD cost tradeoff), reassessed for real-time once volume justifies cost. |
| **WebRTC security** | Signaling server validates that only two matched, authenticated users can exchange SDP/ICE for a given session id — prevent session hijacking/eavesdropping on signaling channel. |
| **Data access control** | Role-based access (user / moderator / admin) enforced at API layer for report review, ban issuance, and account admin actions. |
| **Dependency/infra hygiene** | Automated dependency vulnerability scanning (Dependabot/Snyk), regular secrets rotation, secrets stored in a proper secrets manager (not env files in repo). |
| **Compliance** | GDPR/CCPA-aware data handling (right to deletion, data export) even if not immediately legally mandated — cheaper to build in from the start than retrofit. Age-restriction (18+) claims should be defensible given the self-attestation approach (§5) — consult legal on whether this is sufficient for target launch markets. |

---

## 9. Key Technical Decisions & Build-vs-Buy

| Decision | Choice | Reasoning |
|---|---|---|
| **WebRTC infra: self-host vs. managed** | **Recommend managed (LiveKit Cloud or Daily.co) for V1** | Building and operating a reliable TURN/SFU stack at scale is a significant, easy-to-underestimate engineering investment (NAT traversal edge cases, scaling signaling, monitoring call quality). A managed provider lets the team validate product-market fit on the *matchmaking + conversation quality* problem — which is the actual differentiator — rather than reinventing WebRTC infrastructure. Revisit self-hosting only if managed costs become prohibitive at scale post-PMF. |
| **Auth: self-built vs. managed** | **Managed (Clerk/Auth0) for V1** | Same reasoning as above — auth is undifferentiated, well-solved infrastructure; buying it back speed to focus on the core loop. |
| **Monolith vs. microservices** | **Two services (BFF API + Matchmaking/Signaling), not a full microservices split** | A single monolith would awkwardly mix stateless CRUD with stateful real-time queue logic (different scaling profiles). Full microservices (separate services per domain) is premature complexity for a pre-PMF product with a small team. Two purpose-built services is the right granularity. |
| **SQL vs. NoSQL** | **PostgreSQL as primary store** | The data model (users, contacts, reports, sessions, bans) is inherently relational with real integrity constraints (e.g., can't report a session that doesn't exist, ban must reference a valid user) — Postgres's ACID guarantees and relational modeling are a better fit than a NoSQL document store here. Redis supplements for ephemeral/high-throughput state, not as a replacement. |
| **Real-time audio moderation: live vs. async** | **Async (report-triggered) for V1** | Matches PRD's explicit cost-driven scoping decision — full real-time speech classification on every call is expensive at scale and premature before validating demand. Text chat moderation, which is cheap and fast, runs synchronously as a first line of defense. |
| **Next.js SSR vs. plain SPA** | **Next.js (hybrid)** | Marketing/landing pages benefit from SSR for SEO (organic acquisition matters heavily for this category, per the AirTALK reference's content/blog strategy); the actual call app can behave as a client-heavy SPA once inside the authenticated experience. |

---

## 10. Open Technical Questions for Engineering Kickoff

- Confirm managed WebRTC provider choice (LiveKit vs. Daily.co) via a spike comparing pricing at expected concurrent-call volume and ease of intent-tag-aware room/matching integration.
- Confirm legal guidance on audio-buffer retention before implementing the report pipeline (§8) — this may gate the report feature's launch-market scope.
- Decide device-fingerprinting approach for ban-evasion deterrence (balance effectiveness vs. privacy positioning).
- Define SLA/target for matchmaking wait time and the fallback behavior when queue is empty (e.g., show estimated wait, or notify when a match becomes available).
