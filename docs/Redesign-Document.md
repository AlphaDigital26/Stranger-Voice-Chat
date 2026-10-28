# Redesign Document
## PitchLine — Anonymous Voice Rooms for Founders & Ideas

**Status:** Draft v2.0 (supersedes the UI direction in `UIUX-Design-Brief.md` and the stack in `TRD-Voice-Stranger-App.md` where they conflict)
**Last updated:** October 26, 2026
**Reference product (concept only):** AirTalk — https://www.airtalk.live/

---

## 1. Summary

PitchLine keeps its idea: an anonymous, voice-only, 18+ app where strangers are matched to pitch startup ideas, give feedback, or talk founder-to-founder. This redesign does three things:

1. **Borrows AirTalk's product logic.** Instant start, one tap to match, skip anytime, voice first with text alongside, friends and reconnects, and a content-heavy marketing site that brings in search traffic.
2. **Gives PitchLine its own identity and purpose.** AirTalk is casual small talk. PitchLine is structured idea exchange: roles, a one-line idea card, timed pitch rounds, and feedback. The visual language is editorial and calm, not playful, so it won't look like AirTalk.
3. **Moves to a stack that can actually ship matchmaking.** The current repo fakes matching. The new stack puts auth, database, realtime and matching on one platform (Supabase) and keeps LiveKit for voice.

---

## 2. What we take from AirTalk (and what we don't)

### 2.1 What AirTalk does

| Area | AirTalk behaviour |
|---|---|
| Entry | No signup, no download. "Start Voice Chat" goes straight to matching |
| Matching | Random, in seconds. Optional interest and country filters. Gender filter is premium |
| In call | Mute, hang up, skip, add friend, report. Text chat inside voice calls |
| Retention | Friends list with custom names, messages between sessions, call history and reconnect |
| Extras | Image sharing with AI filtering, a small in-app game |
| Monetization | Free voice forever, optional premium filter, donations |
| Growth | Long SEO landing page (use cases, features, FAQ), blog guides, keyword pages such as `/omegle-alternative/` and `/text-chat/` |
| Layout | Marketing site on the main domain, app on a subdomain (`app.airtalk.live`) |

### 2.2 What we adopt

- **Near-zero friction to the first call.** The biggest thing AirTalk gets right. We can't skip everything (we're 18+), but the target is **under 20 seconds from landing to matching** (see §5.1).
- **Marketing site and app kept separate.** Content pages are SSR'd, indexable and can show ads. App screens are client-heavy, not indexed and have no ads in conversations.
- **Skip anytime, report in one tap, friends and reconnect.**
- **Text inside voice calls.**
- **SEO built from use-case pages, guides and FAQ.**

### 2.3 What we deliberately do differently

| AirTalk | PitchLine |
|---|---|
| Open-ended small talk | **Purpose-led matching**: you pick a role (Pitcher, Listener, Founder) and a topic |
| Interest tags | **Idea card**: a moderated one-line pitch your match sees before the call connects |
| Unstructured call | Optional **Pitch Round**: 60 s pitch, 3 min feedback, then free talk, with a visible clock |
| Nothing after the call | **Post-call feedback**: quick ratings ("clarity", "would use it") the pitcher sees privately |
| Always-on random pool | **Pitch Nights**: scheduled peak hours so matching is instant even with few users (cold-start fix) |
| Gender filter as premium | No gender filtering. Premium unlocks **industry/stage filters and extra rounds** instead |
| Images and games | Not in V1. Text plus voice only, which keeps moderation simple |
| Playful, emoji, illustrations | Editorial, typographic, calm (see §4) |
| No age gate stated | **18+ age gate** on every entry path |

---

## 3. Product concept

**Tagline candidates**
- "Pitch it to a stranger."
- "Honest feedback on your idea in 60 seconds."
- "Anonymous voice rooms for people with ideas."

### 3.1 Roles

| Role | Who | Matching rule |
|---|---|---|
| **Pitcher** | Has an idea and wants feedback | Matched with a Listener first, otherwise a Founder, otherwise a Pitcher (who swap turns) |
| **Listener** | Wants to hear ideas and give feedback | Matched with a Pitcher first |
| **Founder** | Building something and wants a peer chat | Matched with a Founder first, otherwise anyone |

The fallback chain means nobody waits forever. After about 15 s in the queue, the matcher widens to "anyone".

### 3.2 Topics (replaces the current four intent tags)

SaaS · Consumer app · AI · Marketplace · D2C / E-commerce · Fintech · Health · Climate · Creator economy · Local business · Other.

Topics are a **soft preference**: same topic first, then any.

### 3.3 Idea card

- Optional for Listeners and Founders, encouraged for Pitchers.
- Up to 120 characters, for example "Uber for dog walkers in tier-2 cities".
- Runs through text moderation before it's saved.
- Shown to the match during "connecting" so the conversation starts with context.
- Never public and never indexed.

### 3.4 Pitch Round (optional, on by default for Pitchers)

```
[ 0:00 ─── Pitch (60s) ───┬──── Feedback (3:00) ────┬──── Free talk ──── ]
```

- Shown as the **Pitch Clock** (the signature component, §4.5).
- Either person can tap "Skip to free talk".
- If both are Pitchers, the clock runs two rounds and swaps who goes first.

### 3.5 After the call

- 2 taps: "Was the pitch clear?" (1–5) and "Would you use this?" (Yes / Maybe / No).
- Optional one-line written feedback, moderated.
- Pitchers get a private **Pitch Notes** history: aggregated scores and comments across calls. This is the reason to come back and the main retention loop.
- "Add as contact", if both people tap it.

### 3.6 Identity & anonymity

- Everyone gets a system handle such as **Founder #4821** or **Listener #0193**. Handles can't be edited in V1.
- No profile photos and no real names.
- Contacts show the handle plus a private nickname that only you see (as on AirTalk).

---

## 4. Visual identity (deliberately not AirTalk)

### 4.1 Direction: "The Pitch Room"

Think of a founder's notebook crossed with late-night radio: warm paper tones, strong serif headlines, thin rules, one confident accent colour. Content pages read like a well-made publication. That suits SEO and AdSense, because content-led pages look trustworthy to both users and reviewers. The call screen switches to a focused dark mode.

Avoid: emoji as icons, cartoon illustrations, purple-pink gradients (the current UI and many chat apps use them), and glassmorphism.

### 4.2 Colour tokens

| Token | Light (marketing & app) | Dark (call screen) | Use |
|---|---|---|---|
| `--bg` | `#F7F4EE` (paper) | `#0F0E0C` | Page background |
| `--surface` | `#FFFFFF` | `#1A1815` | Cards, sheets |
| `--line` | `#E6E0D6` | `#2A2723` | Borders, rules |
| `--ink` | `#16130F` | `#F2EEE7` | Primary text |
| `--muted` | `#6B645A` | `#9C958A` | Secondary text |
| `--signal` | `#FF5B2E` | `#FF6A3D` | Primary accent: CTAs, the live clock, focus |
| `--live` | `#1FB57A` | `#2BD08F` | Connected / online states |
| `--danger` | `#E5484D` | `#FF6369` | Report, hang up |

Contrast: `--ink` on `--bg` and white on `--signal` both meet WCAG AA for text at the sizes used. Check every new pairing with a contrast tool.

### 4.3 Typography

| Role | Font | Notes |
|---|---|---|
| Display (H1–H2, hero) | **Instrument Serif** (or Fraunces) | Large and tight. Gives the editorial feel |
| UI and body | **Geist** (or Inter) | 16 px base, 1.6 line-height for articles |
| Numbers and timers | **Geist Mono** | Tabular figures on the Pitch Clock and queue timer |

Load with `next/font` (self-hosted, no layout shift), not the Google Fonts `<link>` currently in `app/layout.tsx`.

### 4.4 Shape, space, motion

- Radius 12 px for cards and 999 px for pill buttons and chips.
- 4 px spacing grid. Content max-width 1120 px; article max-width 680 px.
- Borders over shadows. One soft shadow level, used only for floating sheets.
- Motion is short and purposeful: 150–250 ms ease-out. Honour `prefers-reduced-motion`. No looping decoration on content pages.
- Icons: Lucide, 1.5 px stroke.

### 4.5 Signature component: the Pitch Clock

A ring around the call centre, split into segments (pitch / feedback / free talk). The ring's thickness responds to the remote speaker's volume, so it acts as both timer and voice visualizer. It replaces the current `AudioVisualizer` blob. It's the one element people should remember PitchLine by. Use it in the logo mark, the hero and social images.

---

## 5. Information architecture

### 5.1 First-call flow (target: under 20 s)

```
Landing ─► "Start pitching" ─► /start
                                 ├─ Choose role (1 tap)
                                 ├─ Topic (optional, 1 tap)
                                 ├─ Idea card (optional)
                                 ├─ ☐ I'm 18 or older and accept the Guidelines  (required)
                                 └─ Mic permission prompt
                              ─► /match (queue) ─► /room/[id] ─► /wrap/[id]
```

- **No signup for the first call.** We create a Supabase **anonymous user** in the background (see §6) and record age confirmation against it.
- An account (Google or email OTP) is **only asked for** when the user tries to add a contact, open Pitch Notes after 3 calls, or go premium. The anonymous user is upgraded in place, so their history is kept.
- Turnstile (CAPTCHA) runs invisibly on `/start` to block bots creating anonymous users.

### 5.2 Route map

**Marketing (SSR or static, indexable, ad-eligible)**

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/how-it-works` | Roles, Pitch Round, safety |
| `/pitch-night` | Schedule of peak hours, with calendar add |
| `/topics/[topic]` | One page per topic, e.g. "Get feedback on your SaaS idea" (programmatic SEO, §8.2) |
| `/tools`, `/tools/[tool]` | Free founder tools (§8.3) |
| `/blog`, `/blog/[slug]` | Guides |
| `/safety`, `/guidelines` | Trust pages (AdSense reviewers look for these) |
| `/about`, `/contact`, `/faq` | Required for AdSense approval and trust |
| `/terms`, `/privacy`, `/cookies` | Legal |

**App (client, `noindex`, ads only where marked)**

| Route | Ads? | Purpose |
|---|---|---|
| `/start` | Yes (below the fold) | Role, topic, idea card, age gate |
| `/match` | No | Queue |
| `/room/[id]` | **Never** | Live call |
| `/wrap/[id]` | Yes | Post-call feedback |
| `/notes` | Yes | Pitch Notes (pitchers' feedback history) |
| `/contacts` | Yes (list only) | Contacts |
| `/contacts/[id]` | **Never** | Messages with a contact |
| `/history`, `/settings` | Yes | History, account, data export/delete |

Renames from the current repo: `/intent` becomes `/start`, `/queue` becomes `/match`, `/call` becomes `/room`, and `/post-call` becomes `/wrap`.

---

## 6. Recommended tech stack

### 6.1 Overview

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router)**, already in the repo | SSR/SSG for SEO and AdSense pages, one codebase for site and app, Vercel-native |
| UI | **Tailwind CSS 4 + shadcn/ui** (restyled to §4 tokens) + **Motion** | Accessible primitives you own and restyle, so it won't look templated |
| State | **Zustand**, already in the repo | Keep `callStore`, reshaped for the new flow |
| Auth | **Supabase Auth**, replacing Clerk | **Anonymous sign-ins** enable the no-signup first call, with in-place upgrade to Google or email. Same platform as the database, so RLS policies use `auth.uid()` directly |
| Database | **Supabase Postgres** | Relational data (users, sessions, contacts, reports), RLS for per-row security, `pg_cron` for cleanup jobs |
| Matchmaking | **Postgres function + Supabase Realtime** (V1) → **Redis worker** (scale) | No separate server to run in V1. See §6.3 |
| Voice | **LiveKit Cloud**, already in the repo | Managed SFU, TURN included, React components, data messages for in-call text |
| In-call text | **Server-relayed via LiveKit** | Client posts to API route, which moderates, then calls `RoomServiceClient.sendData`. Nothing reaches the other person without being moderated |
| Text moderation | **OpenAI Moderation API** (free) + a local blocklist | Idea cards, in-call text, contact messages, written feedback |
| Bot protection | **Cloudflare Turnstile** | Free, invisible, needed with anonymous sign-ins |
| Rate limiting | **Upstash Redis** + `@upstash/ratelimit` | Queue joins, reports, messages, anon-user creation |
| Content / blog | **MDX in repo** (`@next/mdx` or Velite) | Free, versioned, fast static pages. Move to a headless CMS (e.g. Sanity) only when non-developers write regularly |
| Ads | **Google AdSense** with a **Google-certified CMP** (Consent Mode v2) | Required for EEA/UK/CH traffic |
| Payments (later) | **Stripe**, or **Razorpay** if your customers and business are India-based | Premium tier |
| Analytics | **PostHog** (product) + **Google Search Console** (SEO) | Funnels: landing → start → matched → 60 s+ call |
| Errors | **Sentry** | Client and server |
| Hosting | **Vercel** (web) + Supabase Cloud + LiveKit Cloud | No servers to manage in V1 |

### 6.2 What changes from the current repo

| Current | New | Action |
|---|---|---|
| `@clerk/nextjs` | `@supabase/ssr` + `@supabase/supabase-js` | Replace `lib/mockAuth.tsx` with a real `useSession` hook. Remove Clerk sign-in pages and the `.agents/skills/clerk-*` files |
| `middleware.ts` | `proxy.ts` | Next 16 rename. Refresh the Supabase session and gate app routes |
| `socket.io-client` | (removed) | Supabase Realtime replaces it |
| Fake queue (`setTimeout`) | `match_join` RPC + Realtime | See §6.3 |
| Token route accepts any room | Token route checks `sessions` for the user | Only the two matched users can join a room |
| `lib/mockData.ts` | Supabase queries | Delete once screens are wired |
| `livekit-client` (transitive) | Add explicitly to `package.json` | Pin it |
| Google Fonts `<link>` | `next/font` | Faster, no layout shift |

**Why not keep Clerk?** Clerk is excellent for standard login, but it has no anonymous users, and the no-signup first call is the most important growth lever borrowed from AirTalk. Running Clerk alongside Supabase also means syncing two user stores. Supabase gives auth, database, realtime and row-level security in one place, at lower cost at scale.

**Why not a separate Node/Socket.IO signaling server (as in the old TRD)?** LiveKit already handles WebRTC signaling and media, so the only thing left is pairing, which Postgres can do safely in V1. One fewer service to deploy, monitor and scale.

### 6.3 Matchmaking design (V1)

```
Client (/match)                    Supabase                         LiveKit
     │  rpc('match_join', {role,topic,...})                            │
     │ ──────────────────────────────► │                               │
     │                                 │ BEGIN                         │
     │                                 │  SELECT … FROM match_queue    │
     │                                 │   WHERE compatible            │
     │                                 │   ORDER BY joined_at          │
     │                                 │   FOR UPDATE SKIP LOCKED      │
     │                                 │   LIMIT 1                     │
     │                                 │  found?  → DELETE partner row,│
     │                                 │            INSERT sessions    │
     │                                 │  else    → INSERT self        │
     │                                 │ COMMIT                        │
     │ ◄── { session_id } or { queued }│                               │
     │                                 │                               │
     │  (if queued) subscribe Realtime: INSERT on sessions where       │
     │  user_b = me  ──► receive session_id                            │
     │                                                                 │
     │  GET /api/livekit/token?session=…  (checks user ∈ session)      │
     │ ───────────────────────────────────────────────────────────────►│ join room
```

- `FOR UPDATE SKIP LOCKED` lets two users joining at the same moment never grab the same partner.
- Compatibility follows the role fallback chain in §3.1. The topic is matched first, then widened after 15 s (the client calls `match_widen`).
- Waiting clients send a heartbeat every 5 s. A `pg_cron` job removes queue rows older than 20 s without a heartbeat.
- Users who skipped or blocked each other are never re-paired (`blocks` table plus a "recent partners" check over the last 10 minutes).
- **When to move to Redis:** if queue P95 latency goes above about 300 ms or concurrency passes a few thousand, move pairing to a small worker using Redis sorted sets. The client contract (`join`, then `session_id`) stays the same.

### 6.4 Data model changes (on top of `Backend-Schema-Document.md`)

- `users`: add `is_anonymous`, `handle`, `age_confirmed_at`, `status`.
- `match_queue`: `user_id`, `role`, `topic`, `idea_card`, `country`, `language`, `joined_at`, `heartbeat_at`.
- `sessions`: add `user_a_role`, `user_b_role`, `topic`, `pitch_round_enabled`.
- `pitch_feedback`: `session_id`, `from_user`, `to_user`, `clarity` (1–5), `would_use` (yes/maybe/no), `comment` (moderated).
- `blocks`: `blocker_id`, `blocked_id`, `created_at`.
- `pitch_nights`: `starts_at`, `ends_at`, `title`, `topic` (nullable).

Every table gets RLS. Users only read rows where they are a participant.

---

## 7. Screen specifications

### 7.1 Landing (`/`)

Order (deliberately different from AirTalk's hero → mockups → features → testimonials):

1. **Hero:** serif headline "Pitch your idea to a stranger.", a one-line subhead, primary CTA **Start pitching**, secondary **I'll listen**, and a live "N people online" counter (real data only; hidden below 10). An animated Pitch Clock sits on the right.
2. **Pick your seat:** the three role cards (Pitcher / Listener / Founder).
3. **How a round works:** a horizontal 60 s → 3 min → free talk timeline.
4. **Example idea cards:** a slow ticker of curated sample one-liners, labelled "Examples".
5. **Next Pitch Night:** a countdown with "Add to calendar".
6. **Free founder tools:** links to `/tools`.
7. **Safety, briefly:** 18+, anonymous, moderated, one-tap report.
8. **From the blog:** 3 latest guides.
9. **FAQ:** 8–10 questions, marked up with `FAQPage` schema.
10. **Footer.**

One ad slot between sections 6 and 7, and one between 8 and 9. None above the fold.

### 7.2 Start (`/start`)

```
┌──────────────────────────────────────────┐
│  What brings you here?                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Pitcher  │ │ Listener │ │ Founder  │  │
│  │ I have an│ │ I'll give│ │ Peer chat│  │
│  │ idea     │ │ feedback │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘  │
│                                          │
│  Topic  (SaaS)(AI)(Consumer)(Fintech)…   │
│                                          │
│  Your idea in one line (optional)        │
│  ┌────────────────────────────────────┐  │
│  │                              0/120 │  │
│  └────────────────────────────────────┘  │
│  ☐ I'm 18+ and agree to the Guidelines   │
│                                          │
│  [        Find someone  →        ]       │
└──────────────────────────────────────────┘
```

Mic permission is requested on "Find someone". The denied state shows browser-specific instructions.

### 7.3 Match (`/match`)

- Pitch Clock ring idles, slowly breathing. Shows "Finding a Listener for your SaaS idea…" and a mono timer.
- After 15 s: "Widening the search…". After 45 s: a suggestion to come back for the next Pitch Night, with its time.
- Cancel button. No ads.

### 7.4 Room (`/room/[id]`)

```
┌──────────────────────────────────────────┐
│ ● 02:14        Pitch round      ⚑ Report │
├──────────────────────────────────────────┤
│                                          │
│   "Uber for dog walkers in tier-2 cities"│
│              Founder #4821               │
│                                          │
│             ╭──────────────╮             │
│            ╱  PITCH CLOCK   ╲            │
│           │    0:42 left     │           │
│            ╲   (voice ring) ╱            │
│             ╰──────────────╯             │
│                                          │
│        Skip to free talk  ›              │
├──────────────────────────────────────────┤
│  🎤 Mute   💬 Chat   ＋ Contact   ⏭ Skip   ✕ │
└──────────────────────────────────────────┘
```

- Dark theme. Large touch targets (at least 48 px). Hang up is red and separated from Skip.
- The chat opens as a bottom sheet on mobile and a side panel on desktop.
- "Add contact" unlocks after 60 s and needs both people to tap it.
- Report opens a reason picker. Submitting ends the call and blocks the user.
- **No ads, ever.**

### 7.5 Wrap (`/wrap/[id]`)

Duration, feedback taps (§3.5), add contact (second chance), and two buttons: **Next match** (primary) and **Done**. One ad slot below the buttons.

### 7.6 Pitch Notes (`/notes`)

Per idea card: number of calls, average clarity, would-use split, and recent comments. This is the account-upgrade prompt for anonymous users.

---

## 8. Growth & reach plan

### 8.1 Positioning & keywords

AirTalk ranks on "talk to strangers", "random chat" and "Omegle alternative", which are crowded, low-CPC searches. PitchLine should target **founder intent**, which is less competitive and **pays far more per ad click**, because business and startup audiences are valuable to advertisers.

Keyword clusters:
- **Feedback:** "get feedback on my startup idea", "validate business idea", "where to pitch my idea"
- **Practice:** "practice elevator pitch", "pitch practice online"
- **Community:** "talk to founders online", "find a co-founder", "startup communities"
- **Tools:** "startup name generator", "elevator pitch template", "idea validation checklist"

### 8.2 Programmatic topic pages (`/topics/[topic]`)

One genuinely useful page per topic, for example "Get feedback on your fintech idea":
- What listeners usually ask about fintech ideas (curated, original writing)
- Common pitfalls in the sector and 3 validation steps
- A "Start a fintech pitch" CTA that pre-selects the topic on `/start`
- Links to related blog posts and tools

Start with the 11 topics. Expand to topic × stage pages (e.g. "pre-revenue SaaS") only if the first set gets indexed and ranks. Thin, repetitive pages will hurt both SEO and AdSense approval.

### 8.3 Free tools (`/tools`)

Tools earn links and repeat visits and are good ad inventory:
1. **Elevator pitch builder:** fill-in fields that produce a 60 s pitch, then "Try it on a stranger" (into `/start`)
2. **Pitch timer:** a standalone Pitch Clock
3. **Idea validation checklist:** interactive and printable
4. **Startup name generator:** client-side word combinations plus a domain-check link
5. **Lean canvas:** fill in and download as PNG or PDF

Each tool page has an explanation and a how-to-use section with original writing, so it isn't only a widget.

### 8.4 Blog

- 2 posts a week for the first 3 months. Aim for 25–30 posts before applying to AdSense.
- Pillar posts: "How to validate a startup idea in 7 days", "How to pitch in 60 seconds", "Where to get honest feedback on your idea".
- Use `Article` schema, author pages and dated updates. Internally link every post to a topic page and a tool.

### 8.5 Community & launch

- **Pitch Nights:** fixed weekly slots (e.g. Tue/Thu 9 pm in your main time zone plus one US-friendly slot). Promote them everywhere. They are the cold-start fix and a reason to share.
- **Launch channels:** Product Hunt, Indie Hackers, Hacker News "Show HN", Reddit (r/startups, r/SideProject, r/Entrepreneur; read each subreddit's self-promotion rules first), founder communities on X and LinkedIn, and college entrepreneurship cells.
- **Share loop:** after a call with good feedback, offer the pitcher an opt-in share card ("My idea scored 4.6/5 clarity on PitchLine"). It shows the idea text only if they choose to include it.
- **Referral:** invite a friend and you both get extra premium rounds.

### 8.6 Technical SEO checklist

- SSR or SSG for every marketing route. `generateMetadata` per page. Canonical URLs.
- `sitemap.ts` and `robots.ts`, with app routes (`/match`, `/room`, `/wrap`, `/contacts`…) set to `noindex`.
- Open Graph images generated with `next/og`, using the Pitch Clock motif.
- Schema: `Organization`, `WebSite`, `FAQPage`, `Article`, `SoftwareApplication`.
- Core Web Vitals: LCP under 2.5 s on 4G, and CLS under 0.1, with fixed-height ad containers.

---

## 9. AdSense plan

### 9.1 Getting approved

AdSense rejects most new sites for "low-value content" or missing trust pages. Before applying:
- [ ] 25–30 original blog posts, 11 topic pages and at least 3 tool pages live
- [ ] About, Contact (a real email or form), Privacy Policy (naming Google ads and cookies), Terms, Guidelines and Safety pages
- [ ] Clear navigation; no broken links; mobile-friendly
- [ ] Custom domain at least a few weeks old, indexed in Search Console
- [ ] `ads.txt` at the domain root
- [ ] Google-certified CMP installed (needed to serve ads to EEA/UK/CH visitors)

### 9.2 Placement rules (policy)

- **Never** place ads in `/room/[id]` (live call) or `/contacts/[id]` (private messages). AdSense policy doesn't allow ads in private communications, and placing them there risks the whole account.
- No ads on the 18+ gate itself, on error pages, or on pages with no content.
- Never place ads next to buttons where accidental clicks are likely, such as the "Find someone" CTA or call controls.
- User-generated text (idea cards, feedback) never appears on ad pages without moderation. In V1 it never appears on public pages at all.
- Enforce this in code: an ESLint `no-restricted-imports` rule blocks `components/ads/*` inside `app/(app)/room/**` and `app/(app)/contacts/[id]/**`, and a CI test checks it.

### 9.3 Placements

| Page | Slots |
|---|---|
| Blog post | In-article after paragraph 3, one mid-article, one end-of-article |
| Topic & tool pages | One after the intro, one before the FAQ |
| Landing | Two between sections (see §7.1) |
| `/start`, `/wrap`, `/history`, `/notes`, `/contacts` list | One each, below the main action |

Use manual `<AdSlot>` components with reserved heights first. Try Auto Ads only on blog pages and compare RPM against layout shift.

### 9.4 Revenue levers

- Most ad revenue will come from **content pages**, not the app. Growing search traffic to the blog, topics and tools is the real revenue strategy.
- The business/startup niche earns well per visitor, and visitors from the US, UK, Canada and Australia earn several times more than others. Write for a global audience.
- Track RPM per page type in AdSense, and session funnels in PostHog. Add more content of whatever type earns best.
- Premium (Stripe or Razorpay) is a second revenue line: industry/stage filters, unlimited Pitch Rounds, full Pitch Notes history, no ads on app screens.

---

## 10. Trust & safety

- **18+:** age attestation on every entry path, stored as `age_confirmed_at`. Terms state 18+. Users reported as minors are banned immediately.
- **Moderation:** every piece of text (idea card, chat, messages, feedback) passes the moderation API before delivery. Blocked messages show "Message not sent: it breaks our guidelines."
- **No voice recording in V1** (keeps the existing decision). Reports store metadata and text only.
- **Reports:** one tap. Ends the call, blocks the pair, queues the report for the admin page.
- **Bans:** by user ID plus a device signal. Anonymous accounts can't escape a ban by clearing cookies alone; use Turnstile plus IP rate limits.
- **Personal info:** detect phone numbers, emails and links in chat and show a warning before sending ("Sharing contact details with strangers is risky").
- **Legal:** Privacy Policy covers Supabase, LiveKit, OpenAI moderation, Google ads, PostHog and Sentry, and the 30-day deletion window.

---

## 11. Build roadmap

| Phase | Scope | Exit criteria |
|---|---|---|
| **1. Foundations** (≈1 wk) | Supabase project and schema migrations, replace Clerk with Supabase Auth (anonymous + Google + email OTP), rename to `proxy.ts`, design tokens and fonts, shadcn base components restyled | Build and lint pass. An anonymous user can be created and upgraded |
| **2. Real matchmaking** (≈1.5 wk) | `match_join` / `match_widen` RPCs, Realtime notify, heartbeat cleanup, session-checked LiveKit token | Two people on different networks are matched and talk |
| **3. Core app UI** (≈2 wk) | `/start`, `/match`, `/room` with Pitch Clock, `/wrap`, server-relayed moderated chat, report and block | An outside tester completes landing → call → wrap with no help |
| **4. Marketing site** (≈2 wk, can overlap 2–3) | Landing, how-it-works, safety, FAQ, about, contact, legal, 11 topic pages, 3 tools, blog setup with the first 10 posts, sitemap and schema | Lighthouse SEO ≥ 95. All pages indexed in Search Console |
| **5. Retention** (≈1 wk) | Contacts and messages, Pitch Notes, history, settings and data export | A returning user sees feedback history and messages a contact |
| **6. Ads & launch** (≈1 wk + content runway) | CMP, AdSlot plus lint guardrail, `ads.txt`, AdSense application once content targets are met, first Pitch Night, Product Hunt launch | AdSense applied; launch day with a scheduled Pitch Night |
| **7. Premium** (later) | Stripe or Razorpay, filters, unlimited rounds | Test payment unlocks premium immediately |

Content writing (blog, topics) should start in week 1 and run throughout. It is on the critical path for AdSense approval.

---

## 12. Open decisions

1. **Domain and brand:** keep "PitchLine" or rename? Check domain and trademark availability before designing the logo.
2. **Primary market and time zone:** affects Pitch Night times, payment provider (Stripe or Razorpay) and content language.
3. **Free-tier limits:** suggested start is unlimited random matches with 3 Pitch Rounds a day; tune after launch.
4. **Country/language filters:** free or premium? Recommended: free, because they help liquidity in non-English markets.
5. **Subdomain split** (`app.pitchline…` as AirTalk does) **or one domain with route groups?** Recommended: one domain with `(marketing)` and `(app)` route groups. It's simpler for auth cookies and keeps all SEO authority on one domain.
