# Product Requirements Document
## Product Name (working title): "PitchLine" — Voice Stranger Web App for Idea Discussions

**Author:** Product Team
**Status:** Draft v1.0
**Last Updated:** August 18, 2026

---

## 1. App Overview

PitchLine is an 18+ web application that randomly connects users by live voice (and optional text) to discuss ideas, startups, and projects with strangers — including a segment of self-identified founders. It borrows the frictionless, no-camera, instant-match mechanic popularized by random voice chat apps like AirTALK, but narrows the *purpose* of the conversation: instead of open-ended social chat, matches are framed around idea validation, brainstorming, feedback, and founder-to-founder discussion.

The core insight: founders and builders often lack a fast, low-friction way to get an honest outside reaction to an idea. Existing options (friends, Twitter/X, forums, paid mentorship) are slow, biased, or gated. PitchLine offers instant, anonymous, voice-first feedback from a real person, in under 30 seconds.

---

## 2. Target Users

| Segment | Description |
|---|---|
| **Idea-stage founders** | Early-stage builders who want quick gut-check feedback on a concept before investing more time. |
| **Curious listeners / feedback-givers** | People who enjoy hearing pitches, giving opinions, or mentoring informally, without commitment. |
| **Indie hackers / side-project builders** | Want fast validation loops outside their usual bubble. |
| **Students / aspiring entrepreneurs** | Want exposure to real founder conversations and practice articulating ideas. |
| **Networking-curious professionals** | Enjoy serendipitous, low-stakes conversations with strangers in a business/idea context. |

All users must self-attest they are 18+ (age gate + ToS), since the product involves unmoderated real-time voice with strangers.

---

## 3. Problem Statement

Builders need fast, honest, low-friction feedback on ideas, but:
- Friends/family give biased or overly polite feedback.
- Posting online (Reddit, X, forums) is slow, public, and often ignored or trolled.
- Paid mentor/advisor access is gated by network or cost.
- Existing random-chat apps (Omegle-style, AirTALK) are optimized for general social/dating conversation, not idea discussion — there's no context-setting, no relevant matching, and no structure suited to a pitch-and-feedback interaction.

There is no dedicated, anonymous, instant-voice platform purpose-built for "talk to a stranger about your idea right now."

---

## 4. Core Features (V1 candidate set)

### 4.1 Instant Voice Matching
- One-tap "Start Talking" connects the user to a random available stranger via WebRTC voice call.
- No camera, ever — audio-only by design (reduces friction, increases honesty, avoids appearance bias).
- Built-in text chat panel alongside every voice call (for links, notes, typing when mic is inconvenient).

### 4.2 Conversation Framing / Intent Tags
- Before matching, user picks one of 4 finalized intent tags: **"Pitch My Idea," "Give Feedback," "Open Discussion," "Founder Chat."**
- Matching engine pairs complementary intents (e.g., a "Pitch My Idea" user with a "Give Feedback" user) where possible, falling back to random match if no complementary pair is available within a few seconds.

### 4.3 Skip / Next
- Either party can end and re-queue instantly, same as AirTALK's "skip to next stranger."

### 4.4 Report & Block (Trust & Safety)
- One-tap Report (with reason codes: harassment, hate speech, sexual content, spam/self-promo abuse, other) and Block, available at all times during and after a call.
- **V1 decision: no audio buffer capture.** Given two-party consent recording laws vary by jurisdiction, V1 reports capture text transcript (if in-call chat was used) and session metadata only — no audio recording. Audio buffer capture is deferred to a fast-follow release pending full legal review and possible geo-restriction.

### 4.5 AI Moderation Layer
- Real-time or near-real-time audio moderation (toxicity/hate-speech/sexual-content detection) to auto-warn or auto-disconnect severe violations.
- Text chat scanned for spam, links to scams, and abusive language.

### 4.6 Age & Identity Gate
- Mandatory 18+ self-attestation at signup/entry (checkbox + ToS acceptance).
- Lightweight account creation (email or OAuth) required before first call — enables ban enforcement, rate limiting, and report history (fully anonymous randos with no account is not viable for an 18+/safety-sensitive product).

### 4.7 Call History (Text-only)
- Log of past calls (timestamp, duration, intent tag) so users can find someone they clicked with — no recordings retained beyond moderation window.

### 4.8 Add as Contact / Reconnect
- If both parties opt in during/after a call, they can add each other as a contact to message later. Contacts are labeled with **system-generated placeholders** (e.g., "Stranger #4821") in V1 — user-set custom nicknames are a fast-follow, not V1 scope, to avoid needing moderation coverage for a new user-generated text field at launch.
- **Direct call-to-contact (re-calling a saved contact directly) is deferred, not V1.** V1 ships random matchmaking only; the `sessions` table's `match_type` column supports direct calls for when this is prioritized later, but the signaling/presence work needed to fulfill it is out of scope for V1.

### 4.9 Country / Language Filter
- Basic filter to match within a region or language, useful for idea discussions where language fluency matters.

---

## 5. User Stories

**As a founder,**
- I want to instantly talk to a stranger about my idea, so I can get a quick honest reaction without scheduling anything.
- I want to tag my session as "pitching," so I'm more likely matched with someone willing to listen and give feedback.
- I want to skip to a new person if the conversation isn't useful, so I don't waste time.

**As a feedback-giver,**
- I want to tag myself as "here to give feedback," so I get matched with people who actually want to pitch.
- I want to mute, block, or report someone instantly, so I feel safe using the app.

**As any user,**
- I want to sign up quickly (email/OAuth), so I can start talking within a minute.
- I want to confirm I'm 18+, so the platform stays compliant and appropriately moderated.
- I want to add someone as a contact after a good chat, so I can talk to them again later.
- I want to see my past call history, so I can remember who I spoke with and when.

**As a platform operator,**
- I want all sessions to pass through AI moderation, so harmful content is caught quickly.
- I want a clear report/block/ban pipeline, so repeat offenders are removed.

---

## 6. MVP Scope

### In Scope for V1
- Web app only (desktop + mobile browser, responsive).
- Lightweight signup (email or Google OAuth) + 18+ attestation + ToS/Privacy acceptance.
- One-tap instant voice matching (WebRTC), audio-only.
- Intent tag selection before matching (2–4 tags max: e.g., "Pitch," "Give Feedback," "Open Discussion").
- In-call text chat.
- Skip/Next and Hang Up controls.
- Report + Block (with reason codes), rolling audio buffer for moderation review.
- Basic AI moderation (toxicity/hate-speech text filter at minimum; audio moderation can start with post-call flagged-review rather than full real-time if real-time is too costly for V1 — see note below).
- Add Contact after mutual opt-in; simple contact list + reconnect.
- Minimal call history (text log only, no audio storage beyond moderation window).
- Basic country/language filter.
- Rate limiting / cooldowns to deter abuse and bots.

### Explicitly Deferred (Fast-Follow, Not V1)
- Gender-based AI voice matching / premium filters.
- Interest-based matching beyond intent tags.
- In-call mini-games (tic-tac-toe style icebreakers).
- Monetization (premium tiers, subscriptions).
- Native mobile apps.
- Public founder profiles / verified "founder" badges.
- Group calls (3+ people) or panel/roundtable idea sessions.
- Video option.

---

## 7. Success Metrics

**Activation**
- % of signups completing their first call within 24 hours.
- Time from landing → first call connected (target: under 60 seconds).

**Engagement**
- Average calls per active user per week.
- Average call duration (target benchmark: 3–7+ minutes for a "useful" idea conversation, vs. sub-30-second skips).
- Skip rate (early skip = low match quality signal).

**Retention**
- D1 / D7 / D30 retention.
- Contact-add rate (% of calls that end in both users adding each other).

**Trust & Safety**
- Reports per 1,000 calls (lower is better, but also monitor for under-reporting).
- Median time to review a report.
- Repeat-offender ban rate.

**Product-Market Signal**
- % of users selecting "Pitch" or "Give Feedback" intent tags (validates the founder-focused positioning vs. generic chat).
- Qualitative: NPS or post-call "was this useful?" micro-survey.

---

## 8. Features to Avoid in Version 1

- **Video/camera** — adds moderation complexity, appearance bias, and technical overhead; audio-only is also the core differentiator and safety feature (per AirTALK's model).
- **Fully anonymous, accountless usage** — for an 18+ voice product with real-time strangers, some persistent identity (even lightweight) is needed for ban enforcement and abuse prevention; skipping this invites repeat-offender chaos.
- **Monetization / premium filters** — distracts from validating the core matching + retention loop; premature optimization.
- **Complex AI-based interest/personality matching** — expensive to build well; simple intent tags are sufficient to test the concept.
- **Group/panel calls** — significantly harder matchmaking, moderation, and UX problem; 1:1 is the right MVP unit.
- **Public reputation/rating systems ("rate this founder")** — risk of harassment, gaming, and reputational harm; needs careful design later, not V1.
- **Native mobile apps** — web-first validates demand faster and cheaper; go native only after PMF signal.
- **Verified "founder" badges/credentials** — verification infrastructure is a distraction pre-PMF; self-selected intent tags are enough initially.
- **Recording/replay of full calls for users** — legal/privacy risk (two-party consent laws vary by jurisdiction); only retain short buffers strictly for moderation, disclosed transparently.

---

## 9. Monetization Strategy

**Primary model: Freemium.** Free tier gets rate-limited matches per day (e.g., a daily cap or cooldown between calls); a paid tier removes limits and cooldowns. This is the primary revenue driver for V1, not an afterthought — see rationale below.

**Secondary model: Contextual ads (AdSense + backup networks) on non-conversation surfaces only.** Google's AdSense "Ads in Private Communications" policy (effective August 2024) explicitly prohibits ads on screens whose primary focus is live chat, video-chat, or private messaging — this rules out ads on the Active Call screen and the 1:1 contact-messaging thread entirely, by policy, not by choice. Ads are only viable on: landing page, intent-selection screen, post-call screen, call history, settings, and a planned content/blog section (SEO-driven — "how to pitch your idea," founder-interview content). Ezoic and Media.net are viable secondary/backup ad networks for the same surfaces if AdSense approval is slow or partial, given this category draws extra manual review scrutiny even outside the private-communications restriction.

**Tertiary model (post-V1 candidate): Sponsorships.** A startup tool, accelerator, or SaaS product sponsors a specific intent tag (e.g., "Founder Chat") or the post-call screen. Not scoped for V1 — listed here for roadmap awareness only.

**Implication for product scope:** Because ad revenue is capped to non-conversation screens, pageviews and time-on-page for those specific screens (landing, intent, post-call, history, blog) become real revenue metrics, not just engagement vanity metrics — worth factoring into any future content/SEO investment decisions. The freemium tier is the feature most directly tied to sustainable revenue and should be prioritized into the V1.5 roadmap immediately after V1 ships, rather than deferred indefinitely.

---

## 10. Key Risks & Open Questions

- **Legal/compliance:** Real-time audio between strangers, one of whom may be pitching business ideas, raises IP-leakage concerns (a user might reveal a confidential idea to a stranger). Consider a lightweight in-app disclaimer ("Don't share anything you wouldn't want repeated") rather than NDAs, which aren't enforceable in this context.
- **Cold-start liquidity:** Random matching needs a critical mass of concurrent users, or wait times kill the experience. Consider seeding with scheduled "office hours" windows or a waitlist-to-launch-cohort strategy.
- **Moderation cost vs. real-time audio:** Full real-time audio moderation (speech-to-text + toxicity classification) is costly at scale; V1 may rely more heavily on user-initiated reports + rolling buffer review, with real-time moderation as a fast-follow once volume justifies the cost.
- **Two-party consent recording laws:** Some jurisdictions require consent from both parties to record any part of a call, even short buffers. Legal review needed before implementing the report-audio-buffer feature.
- **Abuse vector — "founder chat" as a pretext:** Because the product explicitly invites idea-sharing with strangers, it may attract solicitation/spam (people pitching MLMs, scams, or using it for sales cold-calling). Rate limiting, intent-tag mismatch detection, and reporting need to specifically watch for this pattern.

---

## 11. Positioning vs. Reference Product (AirTALK)

| Dimension | AirTALK | PitchLine (this product) |
|---|---|---|
| Core use case | General social random chat | Idea discussion / founder feedback |
| Camera | None (voice/text) | None (voice/text) — same |
| Matching | Interest/country/gender filters | Intent tags (pitch / feedback / open discussion) + country/language |
| Identity | No signup required | Lightweight signup required (18+, accountability) |
| Extras | Games, friend system, call history | Contact/reconnect, call history — no games in V1 |
| Monetization | Premium gender-match filter | None in V1 |
