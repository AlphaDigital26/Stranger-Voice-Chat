# App Flow Document
## PitchLine — Voice Stranger Web App

**Author:** UX Strategy
**Status:** Draft v1.0
**Companion docs:** PRD-Voice-Stranger-App.md, TRD-Voice-Stranger-App.md
**Last Updated:** August 18, 2026

**Purpose:** This document specifies every screen, state, action, and transition needed to build the V1 product without ambiguity. It assumes the reader (human or AI coding agent) has no other context beyond this file plus the PRD/TRD. Where a decision has product-level implications not yet made, it is flagged as `[OPEN DECISION]` rather than silently assumed.

---

## 0. Global Conventions

- **Auth state gate:** Every screen below is tagged `[PUBLIC]`, `[AUTH REQUIRED]`, or `[AUTH REQUIRED + AGE CONFIRMED]`. Attempting to access an `[AUTH REQUIRED]` screen while logged out redirects to `/login` with a `redirect_to` query param, and returns the user to the originally requested screen after successful login.
- **Loading state convention:** Any screen fetching data on mount shows a skeleton/spinner state before content renders. Timeout at 10s → show error state with "Retry" button.
- **Toast/notification convention:** Non-blocking confirmations (e.g., "Contact added") appear as a toast, top-right, auto-dismiss after 4s. Blocking errors (e.g., call failed) appear as inline UI states, not toasts.
- **Responsive breakpoint convention:** Mobile-first. Single-column layout under 768px; the in-call screen is optimized for mobile-portrait as the primary use case (voice-first, one-handed).
- **Microphone-dependent screens:** Any screen requiring mic access checks `navigator.permissions.query({name: 'microphone'})` on mount and reflects granted/denied/prompt states explicitly (see §5).

---

## 1. Screen: Landing Page (`/`) — `[PUBLIC]`

### Purpose
Marketing/conversion entry point. SEO-facing (per TRD, SSR'd). Goal: get the visitor to sign up or log in and reach the matching queue.

### Layout & Elements
- Header: Logo (left), nav links (About, How it Works, Blog — deferred content, can be placeholder in V1), "Log In" (top-right, secondary button), "Get Started" (top-right, primary button).
- Hero section: Headline ("Talk to a stranger about your idea — right now"), subheadline, primary CTA button "Start Talking" (large, centered).
- Secondary section: "How it Works" — 3-step visual (1. Pick your intent, 2. Get matched instantly, 3. Talk it out).
- Trust section: Safety bullets (No camera. AI-moderated. Report anytime.) — mirrors AirTALK's trust-signal pattern from the PRD reference.
- Footer: Terms of Service, Privacy Policy, Contact links.
- **Ad placement note:** Landing page is a fully AdSense-eligible, non-conversation surface — standard display ad slots (e.g., below the fold, sidebar on desktop) are permitted here.

### User Actions & Behavior
| Action | Behavior |
|---|---|
| Click "Start Talking" (hero) or "Get Started" (header) | If not logged in → navigate to `/signup`. If logged in but age not confirmed → navigate to `/age-confirm`. If logged in and age confirmed → navigate to `/intent` (pre-match screen). |
| Click "Log In" | Navigate to `/login`. |
| Click footer legal links | Navigate to `/terms` or `/privacy` (static pages, out of scope for detailed flow — standard static content). |

### States
- **Default/success:** as described above.
- **Empty state:** N/A (static content page).
- **Error state:** If SSR data fetch fails (e.g., dynamic user-count stat), fall back to static copy without the stat — never block page render on this.

---

## 2. Screen: Sign Up (`/signup`) — `[PUBLIC]`

### Purpose
Create an account. Per TRD, uses managed auth provider (Clerk/Auth0-style) — this spec describes the product-level flow regardless of vendor SDK specifics.

### Layout & Elements
- Form: Email input, Password input, "Continue" button (primary).
- Divider: "or"
- OAuth button: "Continue with Google".
- Link: "Already have an account? Log in" → `/login`.
- Legal checkbox: "I confirm I am 18 years or older and agree to the Terms of Service and Privacy Policy" (unchecked by default) — **required**, not optional (see §0 auth gate rationale, PRD §2).

### User Actions & Behavior
| Action | Behavior |
|---|---|
| Type in Email field | Inline validation on blur: valid email format required. Invalid → red border + helper text "Enter a valid email address." |
| Type in Password field | Inline validation on blur: minimum 8 characters. Invalid → helper text "Password must be at least 8 characters." |
| Attempt submit with checkbox unchecked | Submit button remains disabled (not just erroring on click) until checkbox is checked. Tooltip/helper text near checkbox: "You must confirm you're 18+ to continue." |
| Click "Continue" (valid form, checkbox checked) | Submit → show loading spinner on button → on success, create user record with `age_confirmed_at = now()` (per TRD schema) → auto-log-in → redirect to `/intent`. |
| Click "Continue" (email already registered) | Inline error under email field: "An account with this email already exists. Log in instead." with inline link to `/login`. |
| Click "Continue with Google" | OAuth popup/redirect flow. On success (new user), same checkbox requirement applies **before** account creation completes — if OAuth returns before checkbox is checked, show an intermediate "Confirm your age" modal with the same checkbox before finalizing account creation. On success (returning user via Google), skip to `/intent` directly. |
| Network/server error on submit | Inline banner at top of form: "Something went wrong. Please try again." Button re-enables, form values preserved. |

### States
- **Empty state:** Fresh form, all fields blank, submit disabled.
- **Success state:** Redirect to `/intent` (no dedicated "success" screen needed).
- **Error states:** invalid email, weak password, duplicate email, checkbox unchecked, network failure — all specified above.

---

## 3. Screen: Log In (`/login`) — `[PUBLIC]`

### Layout & Elements
- Email input, Password input, "Log In" button (primary).
- "Continue with Google" button.
- Link: "Forgot password?" → `/reset-password`.
- Link: "Don't have an account? Sign up" → `/signup`.

### User Actions & Behavior
| Action | Behavior |
|---|---|
| Submit valid credentials | Loading spinner → on success, redirect to `redirect_to` query param target if present, else to `/intent` if age confirmed, else `/age-confirm`. |
| Submit invalid credentials | Inline banner: "Incorrect email or password." Do not specify which field is wrong (standard security practice). |
| Account banned (per TRD `users.status = banned`) | Redirect to `/banned` screen (see §12) instead of `/intent`. |
| Click "Forgot password?" | Navigate to `/reset-password`. |
| Rate-limited (too many failed attempts, per TRD §8) | Inline banner: "Too many attempts. Try again in [X] minutes." Submit button disabled during cooldown. |

### States
Standard empty/success/error as above. No unique empty state (form is always the default view).

---

## 4. Screen: Age Confirmation (`/age-confirm`) — `[AUTH REQUIRED]`

### Purpose
Edge case screen for OAuth users or legacy sessions who reached an authenticated state without the age checkbox being recorded. Should rarely be hit if `/signup` and OAuth flows are implemented correctly (per §2), but must exist as a hard gate.

### Layout & Elements
- Headline: "Confirm your age to continue"
- Body copy: "PitchLine is for users 18 and older."
- Checkbox: "I confirm I am 18 years or older and agree to the Terms of Service and Privacy Policy."
- Button: "Continue" (disabled until checked).
- Secondary link: "This isn't right, log out" → logs out, redirects to `/`.

### User Actions & Behavior
| Action | Behavior |
|---|---|
| Check box → Click "Continue" | PATCH user record `age_confirmed_at = now()` → redirect to `/intent`. |
| Click "log out" | Clear session → redirect to `/`. |

### States
No empty/error states beyond standard network failure (inline banner, retry).

---

## 5. Screen: Intent Selection / Pre-Match (`/intent`) — `[AUTH REQUIRED + AGE CONFIRMED]`

### Purpose
Core pre-call screen. User selects their conversation intent tag and grants mic permission before entering the queue. This is the primary "home" screen for logged-in users.

### Layout & Elements
- Header: Logo, user avatar/menu (top-right, dropdown: Contacts, Call History, Settings, Log Out).
- Headline: "What are you here for?"
- Intent tag selector: 4 large tappable cards (final, confirmed set — per PRD §4.2):
  1. "Pitch My Idea"
  2. "Give Feedback"
  3. "Open Discussion"
  4. "Founder Chat"
- Optional filter row (collapsed by default, "Filters" expand link): Country/language dropdown (per PRD §4.9).
- Microphone status indicator: shows current permission state (see below).
- Primary button: "Start Talking" (disabled until an intent tag is selected AND mic permission is granted).
- **Ad placement note:** `/intent` is AdSense-eligible (not a conversation screen itself) — a modest ad slot may appear below the intent selector, but must not crowd the primary CTA or create accidental-click risk near "Start Talking."
- **Freemium gate:** If the user is on the free tier and has hit their daily match limit, the "Start Talking" button is replaced with an "Upgrade to keep talking" state instead of navigating to `/queue` — exact limit and upgrade-flow UI are open decisions (§15).

### User Actions & Behavior
| Action | Behavior |
|---|---|
| Select an intent tag card | Card highlights (selected state, single-select — clicking a different card deselects the previous one). "Start Talking" button becomes enabled if mic is also already granted. |
| Expand "Filters" | Reveals country/language dropdown inline, no navigation. |
| Select country/language filter | Value stored in local state, applied at queue-join time. No confirmation needed — it's a passive filter. |
| Page loads, mic permission = `prompt` | Mic status indicator shows "Microphone access needed" with a "Grant Access" button. `Start Talking` remains disabled. |
| Click "Grant Access" | Triggers `getUserMedia()` browser permission prompt. |
| Mic permission granted (browser prompt) | Mic status indicator updates to "Microphone ready ✓" (green). `Start Talking` becomes enabled if intent tag also selected. |
| Mic permission denied (browser prompt) | Mic status indicator shows "Microphone access denied" (red) with helper text: "PitchLine needs your microphone to connect you by voice. Enable it in your browser settings and refresh." `Start Talking` remains disabled — no bypass. |
| Page loads, mic permission already `granted` (returning user) | Status indicator shows "Microphone ready ✓" immediately, no prompt needed. |
| Click "Start Talking" (enabled state) | Navigate to `/queue` with selected intent tag + filters passed as state/query params. |

### States
- **Empty state:** N/A — this screen always shows the same selector UI; there's no "no data" condition.
- **Error state:** Mic permission denied (above). If `getUserMedia` throws for a non-permission reason (e.g., no mic hardware detected), show: "No microphone detected. Please connect a microphone and refresh the page."
- **Success state:** Leads to `/queue`.

---

## 6. Screen: Matching Queue (`/queue`) — `[AUTH REQUIRED + AGE CONFIRMED]`

### Purpose
Transient screen while the matchmaking service (per TRD §3, Redis-backed queue) finds a pair. This screen owns the WebSocket connection lifecycle for joining the queue.

### Layout & Elements
- Centered animated "searching" indicator (e.g., pulsing waveform or spinner).
- Status text: "Finding someone to talk to..." with the selected intent tag displayed (e.g., "Looking for: Give Feedback").
- Elapsed time counter (e.g., "0:07").
- Button: "Cancel" (secondary, always visible).

### Behavior on Mount
1. Open WebSocket connection to signaling service, authenticated via JWT (per TRD §5).
2. Emit "join queue" event with intent tag + filters.
3. Listen for server events: `match_found`, `queue_error`, `disconnect`.

### User Actions & Behavior
| Action | Behavior |
|---|---|
| Click "Cancel" | Emit "leave queue" event, close WebSocket, navigate back to `/intent`. |
| Server emits `match_found` (paired with another user + session id) | Navigate to `/call/:sessionId`, passing the WebRTC signaling handshake to begin on that screen. |
| Server emits `queue_error` (e.g., service unavailable) | Show inline error state (below), do not auto-navigate. |
| WebSocket disconnects unexpectedly while queued | Attempt auto-reconnect (up to 3 tries, exponential backoff). If reconnect fails, show error state. |
| User navigates away (closes tab, browser back) | `beforeunload`/cleanup handler emits "leave queue" event so they're removed from the server-side queue (prevents ghost queue entries). |
| Queue wait exceeds a threshold (e.g., 30s) `[OPEN DECISION: exact threshold + copy to confirm with product]` | Status text updates to acknowledge the wait: "Still looking — hang tight" or similar, per PRD open question in TRD §10 about matchmaking wait SLA/fallback. Does not auto-cancel. |

### States
- **Empty/loading state:** the searching animation itself IS the primary state of this screen — no separate "empty" case.
- **Error state:** "We couldn't connect you right now. Please try again." with a "Retry" button (re-joins queue) and "Back" button (returns to `/intent`).
- **Success state:** Navigates away to `/call/:sessionId` — no static success UI needed here since transition is immediate.

---

## 7. Screen: Active Call (`/call/:sessionId`) — `[AUTH REQUIRED + AGE CONFIRMED]`

### Purpose
The core product experience: live voice call with in-call text chat, per PRD §4.1 and §4.3.

### Layout & Elements
- Top bar: Call timer (e.g., "02:34"), matched user's intent tag (e.g., "Talking about: Pitch My Idea") — **no name/photo shown** (anonymity by design, per PRD).
- Center: Audio visualizer / speaking indicator (animated waveform reacting to remote audio level — gives visual feedback that the call is live, especially important since there's no video).
- Bottom control bar (persistent, large touch targets for mobile):
  - **Mute/Unmute** toggle button
  - **Hang Up** button (red, distinct from others)
  - **Skip/Next** button
  - **Report** button (flag icon)
  - **Add Contact** button (only enabled/shown after some minimum call duration, e.g. 10 seconds — prevents instant-add spam `[OPEN DECISION: exact threshold]`)
- Collapsible side/bottom panel: **Text chat** (per PRD §4.1 "built-in text chat panel alongside every voice call") — text input + message list, toggle button to expand/collapse.

### Behavior on Mount
1. Establish WebRTC peer connection using signaling data passed from `/queue` (SDP offer/answer, ICE candidates exchanged via signaling service per TRD architecture).
2. Request/confirm mic stream is active (already granted at `/intent`, re-verify here).
3. Start call timer on successful connection (`peerconnection: connected` state), not on screen mount (avoids counting failed-connection time).

### User Actions & Behavior
| Action | Behavior |
|---|---|
| Click "Mute" | Toggle local audio track `enabled = false`. Button visually flips to "Unmute" state. No confirmation needed. |
| Click "Hang Up" | Immediately close peer connection, emit "call ended" (`end_reason: hangup`) to signaling service, navigate to `/post-call/:sessionId`. |
| Click "Skip/Next" | Same as Hang Up but sets `end_reason: skip`, then **automatically re-joins the queue** with the same intent tag (navigates to `/queue` directly, not `/intent`) — per PRD §4.3 "same as AirTALK's skip to next stranger," implying no re-selection friction. |
| Click "Report" | Open Report modal (see §7a below) as an overlay — call remains connected in background unless the report flow explicitly ends it. |
| Click "Add Contact" | If not yet mutually requested: send contact request to matched user, button changes to "Request Sent" (disabled state). If matched user also clicks "Add Contact" → both users see confirmation toast "You're now connected with Stranger #[XXXX]" and contact is created (per Backend Schema `contacts` table). **Confirmed for V1: nicknames are system-generated** (e.g., "Stranger #4821", derived deterministically from the contact's user id so it's stable across views) — no user-editable nickname field in V1. |
| Expand/collapse text chat panel | UI toggle only, no network effect. Unread message count badge shown on the toggle button when panel is collapsed and a new message arrives. |
| Type + send text message | Message sent via signaling/data channel, appended to message list for both users in real time. |
| Remote peer hangs up / skips | Local client receives "call ended" event → immediately navigate to `/post-call/:sessionId` (same screen as if local user had hung up, with `end_reason` reflecting the remote party's action for internal logging, but UI copy is neutral: "Call ended"). |
| Remote peer's connection drops unexpectedly (network failure, not intentional hangup) | Show a brief inline banner "Reconnecting..." with a short grace period (e.g., 5-10s) attempting ICE restart; if reconnection fails, treat as call end (`end_reason: drop`) and navigate to `/post-call/:sessionId`. |
| Local mic/network failure | Inline banner: "Connection issue — trying to reconnect." Same reconnect-then-fail-to-post-call behavior as above. |

### 7a. Sub-flow: Report Modal (overlay on `/call/:sessionId`)

- Modal title: "Report this conversation"
- Reason selector (radio buttons, per TRD `reports.reason_code`): Harassment, Hate speech, Sexual content, Spam/self-promotion, Other.
- If "Other" selected: optional free-text field appears (max 280 chars).
- Buttons: "Cancel" (closes modal, no action), "Submit Report & End Call" (primary, red-tinted).

| Action | Behavior |
|---|---|
| Select reason, click "Submit Report & End Call" | Immediately ends the call (`end_reason: report`), creates `reports` record (`status: pending`) capturing text transcript/metadata only — **no audio is recorded in V1** (confirmed decision, TRD §6.1) — navigates to `/post-call/:sessionId` with a confirmation state: "Your report has been submitted. Our team will review it." |
| Click "Cancel" | Close modal, return to active call view, no report created, call unaffected. |
| Submit fails (network error) | Inline error in modal: "Couldn't submit report. Please try again." Modal stays open, call remains connected. |

### States
- **Loading state:** Brief "Connecting..." state shown between navigation-from-queue and WebRTC connection establishing (should be near-instantaneous if signaling was pre-negotiated during matching, but must be handled explicitly rather than showing a blank/broken UI).
- **Error state:** WebRTC connection fails entirely (e.g., both P2P and TURN relay fail) → "We couldn't connect this call." with buttons "Try Again" (re-queue) and "Back to Home" (`/intent`).
- **Empty state:** Text chat panel with no messages yet shows placeholder: "Say hi 👋" in the message list area.

---

## 8. Screen: Post-Call (`/post-call/:sessionId`) — `[AUTH REQUIRED + AGE CONFIRMED]`

### Purpose
Brief interstitial after any call ends — confirms what happened and offers next actions. Prevents jarring instant-requeue and gives room for the "Add Contact" action if not already completed.

### Layout & Elements
- Headline reflecting end reason:
  - Hangup/skip by either party: "Call ended"
  - Report submitted: "Your report has been submitted. Our team will review it."
  - Connection drop: "Call disconnected"
- Call summary: duration (e.g., "You talked for 4:12").
- If contact wasn't already added during the call: "Add Contact" button available here as a second chance (only if the *other* user also added first — otherwise same request/pending flow as in-call).
- Micro-survey prompt (per PRD §7 success metrics): "Was this conversation useful?" with a simple thumbs up/down or short scale — optional, dismissible.
- Two primary actions: "Talk to Someone New" (returns to `/intent` or directly `/queue` — `[OPEN DECISION: confirm whether this pre-fills the last intent tag or resets to selection]`) and "Go Home" → `/intent`.

### User Actions & Behavior
| Action | Behavior |
|---|---|
| Click "Talk to Someone New" | Navigate to `/intent` (recommended default per open decision above, to allow re-selecting intent) or directly to `/queue` if reusing prior tag — implementer should confirm with product before building; document assumes `/intent` as the safer default. |
| Click thumbs up/down on micro-survey | Records feedback (fire-and-forget, no navigation change), survey UI collapses to "Thanks for the feedback!" |
| Click "Add Contact" (if applicable) | Same request/confirm behavior as in-call version (§7). |
| Click "Go Home" | Navigate to `/intent`. |
| No action taken, user navigates away directly | No penalty/consequence — this screen is not a forced checkpoint. |

### States
- No empty/error states beyond standard network failure on the optional survey submit (silently fail, don't block UI — this is a non-critical action).

---

## 9. Screen: Contacts (`/contacts`) — `[AUTH REQUIRED + AGE CONFIRMED]`

### Purpose
List of mutually-added contacts (per PRD §4.8), accessible from the user menu.

### Layout & Elements
- List of contact rows: system-generated placeholder name (e.g., "Stranger #4821"), "last talked" timestamp, "Message" button. **No "Call" button in V1** — direct call-to-contact is confirmed deferred (not V1 scope); random matchmaking via `/intent` is the only way to start a call in V1.
- Empty state (no contacts yet): Illustration + text: "No contacts yet. Add someone after a great conversation." + button "Start Talking" → `/intent`.
- **Ad placement note:** `/contacts` (the list view) is a non-messaging screen and is AdSense-eligible per the monetization strategy — a single unobtrusive ad slot may appear below the contact list, but never inside it or on the messaging thread screen below.

### User Actions & Behavior
| Action | Behavior |
|---|---|
| Click "Message" on a contact row | Navigate to `/contacts/:contactId/messages` (simple 1:1 text thread — async messaging, separate from in-call chat; screen not detailed further here as it's standard chat UI, but must exist per PRD §4.8). **No ad inventory on this screen** — it is a private-communication surface per AdSense policy and must never render ad slots. |
| Click "Start Talking" (empty state) | Navigate to `/intent`. |

### States
- **Empty state:** described above.
- **Error state:** Failed to load contacts list → inline banner "Couldn't load contacts" with "Retry" button.

---

## 10. Screen: Call History (`/history`) — `[AUTH REQUIRED + AGE CONFIRMED]`

### Purpose
Text log of past calls (per PRD §4.7 — metadata only, no audio retained).

### Layout & Elements
- List of past sessions: date/time, duration, intent tag used, whether a contact was added from that session.
- Empty state: "No conversations yet. Your call history will show up here." + "Start Talking" button.

### User Actions & Behavior
| Action | Behavior |
|---|---|
| Click a history row | Expands inline (accordion) or navigates to a read-only detail view showing the same metadata (no transcript/audio, per TRD data retention decision) — implementer choice, no network-affecting behavior either way. |

### States
Empty/error states as described; standard pagination if list grows long (infinite scroll or "Load more" button — `[OPEN DECISION: confirm pagination pattern]`).

---

## 11. Screen: Settings (`/settings`) — `[AUTH REQUIRED + AGE CONFIRMED]`

### Layout & Elements
- Account section: Email (read-only or editable depending on auth provider capability), "Change Password" (if not OAuth-only account), "Log Out" button.
- Privacy section: "Download my data" button (GDPR/CCPA per TRD §8), "Delete my account" button (destructive, requires confirmation modal).
- Preferences: Default country/language filter (persisted so it's pre-selected on `/intent` next time — `[OPEN DECISION: confirm this persistence is in V1 scope or deferred]`).

### User Actions & Behavior
| Action | Behavior |
|---|---|
| Click "Log Out" | Clear session/JWT, redirect to `/`. |
| Click "Delete my account" | Open confirmation modal: "This will permanently delete your account and data. This cannot be undone." with "Cancel" / "Delete Permanently" buttons. Confirming triggers account deletion flow (soft-delete or hard-delete per legal/TRD data policy), logs out, redirects to `/` with a toast: "Your account has been deleted." |
| Click "Download my data" | Triggers async export job; on completion, email sent with download link (not instant in-browser download, since this may take time to compile) — inline confirmation: "We'll email you a link to download your data shortly." |

### States
Standard error handling (inline banners) for each action's failure case; no unique empty states (form-based screen).

---

## 12. Screen: Banned Account (`/banned`) — `[AUTH REQUIRED, special case]`

### Purpose
Shown instead of any normal authenticated screen when `users.status = banned` (per TRD schema).

### Layout & Elements
- Headline: "Your account has been suspended."
- Body: Reason (if disclosed — `[OPEN DECISION: confirm whether ban reason is shown to user or kept internal]`), and an appeal contact method (e.g., "Think this is a mistake? Contact support@[domain]").
- No other navigation available except "Log Out."

### User Actions & Behavior
| Action | Behavior |
|---|---|
| Click "Log Out" | Clear session, redirect to `/`. |
| Any attempt to navigate to another authenticated route while banned | Server/client redirect back to `/banned` (hard gate, checked on every authenticated route load). |

---

## 13. Global Error Conditions (apply across screens)

| Condition | Behavior |
|---|---|
| Session/JWT expired mid-use | Any API call returning 401 triggers a silent refresh-token attempt; if refresh also fails, clear session and redirect to `/login` with a toast: "Your session expired. Please log in again." |
| User loses internet connection entirely | Global connectivity banner (top of viewport): "You're offline." Reappears/dismisses reactively based on `navigator.onLine` + reconnection events. During an active call, this is distinct from the in-call reconnect banner (§7) — the global banner covers the whole app shell, not just the call. |
| Rate limit hit (signup, report submission, contact requests — per TRD §8) | Inline error at point of action: "You're doing that too often. Please wait and try again." No global modal. |
| Unhandled client error (JS exception) | Error boundary catches it, shows a generic fallback: "Something went wrong." with a "Reload" button — never a blank white screen. |

---

## 14. Navigation Map (summary)

```
/                       [PUBLIC]      -> /signup, /login
/signup                 [PUBLIC]      -> /intent (success) | /login (existing email)
/login                  [PUBLIC]      -> /intent | /age-confirm | /banned | /reset-password
/age-confirm             [AUTH]        -> /intent
/intent                  [AUTH+AGE]    -> /queue
/queue                   [AUTH+AGE]    -> /call/:sessionId | /intent (cancel)
/call/:sessionId         [AUTH+AGE]    -> /post-call/:sessionId | /queue (skip)
/post-call/:sessionId    [AUTH+AGE]    -> /intent | /queue
/contacts                 [AUTH+AGE]    -> /contacts/:id/messages | /call/:sessionId | /intent
/history                  [AUTH+AGE]    -> (self, expand rows)
/settings                 [AUTH+AGE]    -> / (after logout/delete)
/banned                   [AUTH, gated] -> / (logout only)
```

---

## 15. Open Decisions Requiring Product/Design Confirmation Before Build

Resolved as of this revision: intent tag list (§5), contact naming convention (§7), and direct-call-to-contact scope (§9) — see updated sections above. Remaining open items:

1. Exact queue-wait threshold and copy for "still searching" state (§6).
2. Minimum call duration before "Add Contact" becomes available (§7).
3. Whether "Talk to Someone New" from post-call goes to `/intent` or directly re-queues with the last intent tag (§8).
4. Pagination pattern for call history (§10).
5. Whether filter preference persistence across sessions is V1 scope (§11).
6. Whether ban reason is disclosed to the banned user or kept internal (§12).
7. Exact freemium rate-limit thresholds (calls/day for free tier) and where/how the upgrade prompt is surfaced when a free user hits the limit — new item introduced by the monetization strategy; needs a dedicated "Upgrade" screen/modal spec once thresholds are set.
