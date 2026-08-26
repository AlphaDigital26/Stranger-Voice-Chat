# UI/UX Design Brief
## PitchLine — Voice Stranger Web App

**Author:** Senior UI/UX Design
**Status:** Draft v1.0
**Companion docs:** PRD-Voice-Stranger-App.md, TRD-Voice-Stranger-App.md, App-Flow-Document.md
**Last Updated:** August 18, 2026

**Purpose:** This brief defines the visual and interaction design system for PitchLine, precise enough that an AI app builder (or human designer/engineer) can implement consistent UI without needing to make unstated aesthetic judgment calls. Every design decision below is tied to a product reason — this is not a moodboard, it's a specification.

---

## 1. Design Philosophy & Principles

PitchLine sits at the intersection of two design traditions that don't usually meet: **anonymous social/voice-chat apps** (playful, low-friction, casual — think AirTALK, Discord) and **founder/professional tools** (credible, calm, focused — think Linear, Notion). The brief's job is to reconcile them: the product must feel **safe and casual enough to talk to a stranger in seconds**, but **credible enough that a founder trusts it with a real idea**.

### Core UX Principles

1. **Voice-first, not screen-first.** The interface should never compete with the conversation. During a call, UI elements recede — large touch targets, minimal text, no unnecessary motion — because the user's attention belongs to their ears and mouth, not their eyes. This is the single most important principle governing the Active Call screen.
2. **Zero-hesitation entry.** Every screen between "I want to talk" and "I'm talking" must be frictionless. Fewer choices, bigger buttons, obvious next steps. Every extra decision point on the path to `/queue` is a drop-off risk (per PRD activation metric: time to first call under 60 seconds).
3. **Calm anonymity, not clinical anonymity.** No camera and no names is a safety feature, but the UI should never feel cold or surveillance-like because of it. Warm color, friendly copy, and human illustration/iconography counteract the "faceless" quality so it reads as *relaxed*, not *sterile*.
4. **Trust is a visual language, not just a policy page.** Because users are voice-chatting with total strangers about real ideas, safety affordances (Report, Block, mic status) must be **always visible, never buried in menus** — visible trust cues reduce anxiety and are a competitive/trust differentiator versus generic random-chat apps.
5. **Confidence over cuteness.** This product must not visually read as a dating/hookup app or a gimmicky "meet strangers" toy, given the founder/idea-discussion positioning. Avoid: hearts, flirty micro-copy, gamified match animations. Prefer: clean geometry, confident typography, subtle motion.

---

## 2. Design Style

**Overall style direction: Modern Minimal Warmth** — a clean, geometric, generous-whitespace UI (in the lineage of Linear, Notion, Superhuman) with a warmer, rounder accent layer (soft shapes, a single vibrant accent color, friendly micro-copy) borrowed from consumer social apps to keep it approachable.

- **Not** glassmorphism-heavy, **not** skeuomorphic, **not** neon/cyberpunk (too gimmicky for a founder-trust product).
- **Not** flat corporate-SaaS blue-and-white (too cold for a "talk to a stranger" product — needs warmth to lower social anxiety).
- Rounded corners throughout (see §6 component style) to soften the "stranger danger" edge inherent to the concept.
- Generous whitespace/padding — never dense or cluttered; this is a calm, low-cognitive-load product, not a data dashboard.

---

## 3. Color Palette

Primary approach: **neutral, near-monochrome base with one confident accent color**, plus dedicated semantic colors for call states and safety actions (these must be visually distinct and consistent everywhere — a user should never have to think about what a red button does).

| Role | Color | Hex (reference) | Usage |
|---|---|---|---|
| **Primary accent** | Warm violet | `#7C5CFC` | Primary buttons ("Start Talking"), active/selected states, links, brand marks. *(Note: chosen to sit adjacent to — not copy — the reference product's purple `#8b5cf6`; distinct enough to avoid brand confusion while occupying the same "friendly-tech" register.)* |
| **Primary accent (hover/pressed)** | Deeper violet | `#6547E0` | Hover/active states on primary buttons. |
| **Background (light mode default)** | Off-white | `#FAFAFA` | App background — not pure white, reduces glare/harshness during long voice sessions. |
| **Surface** | White | `#FFFFFF` | Cards, modals, panels. |
| **Border/divider** | Light gray | `#E5E5E8` | Card borders, dividers, input borders. |
| **Text — primary** | Near-black | `#18181B` | Headlines, primary copy. |
| **Text — secondary** | Medium gray | `#71717A` | Helper text, timestamps, secondary labels. |
| **Success / positive** | Green | `#22C55E` | Mic granted, connection success, confirmation toasts. |
| **Warning** | Amber | `#F59E0B` | Reconnecting states, non-blocking alerts (e.g. "still searching"). |
| **Danger / destructive** | Red | `#EF4444` | Hang Up button, Report button, Delete Account, error banners, ban screen accents. |
| **Info / neutral action** | Blue-gray | `#64748B` | Skip/Next button (neutral action — not positive, not destructive), secondary UI icons. |

### Dark Mode
`[OPEN DECISION — recommend building dark mode into V1 given the voice-call use case often happens at night/in low-light settings; if deferred, ship light mode only but structure all colors as design tokens/CSS variables from day one so dark mode is a token-swap, not a rebuild.]`

Suggested dark palette direction if implemented: background `#121214`, surface `#1C1C1F`, primary accent lightened to `#9B82FF` for sufficient contrast, text primary `#F4F4F5`, text secondary `#A1A1AA`. Semantic colors (success/warning/danger) shift 1 step brighter for dark-background contrast.

### Accessibility requirement
All text/background color pairs must meet **WCAG AA contrast minimum (4.5:1 for body text, 3:1 for large text/UI components)**. This is non-negotiable given the safety-critical nature of Report/Block affordances — they must be legible under all conditions.

---

## 4. Typography

| Role | Font | Reasoning |
|---|---|---|
| **Primary typeface** | **Inter** (or **Geist**, if available in the builder's font set) | Highly legible at all sizes, wide language/character support (relevant given the country/language filter feature), free/open-source, and already the de facto standard for modern SaaS/consumer-tech products — reduces build risk vs. a custom/paid font. |
| **Monospace (if needed)** | **JBMono** or **Roboto Mono** | Only for incidental use (e.g., session IDs in dev/debug views) — not user-facing in V1. |

### Type Scale

| Token | Size | Weight | Usage |
|---|---|---|---|
| `display` | 40px / 2.5rem | 700 (Bold) | Landing page hero headline only. |
| `h1` | 28px / 1.75rem | 700 (Bold) | Screen titles ("What are you here for?"). |
| `h2` | 20px / 1.25rem | 600 (Semibold) | Section headers, modal titles. |
| `body-lg` | 16px / 1rem | 400 (Regular) | Primary body copy, button labels. |
| `body` | 14px / 0.875rem | 400 (Regular) | Secondary copy, form helper text, list items. |
| `caption` | 12px / 0.75rem | 500 (Medium) | Timestamps, tags, micro-labels (e.g. intent tag chips). |

- Line height: 1.5 for body text, 1.2 for headlines.
- Letter spacing: default/normal for body; -0.01em on large headlines for tightness.
- **Never use font sizes below 12px anywhere** — accessibility floor, especially important since this product may be used one-handed/on mobile while talking.

---

## 5. Layout Direction

- **Grid system:** 12-column responsive grid, 24px gutter on desktop, 16px on mobile. Max content width 1200px on desktop, centered, with generous side margins on ultra-wide screens (never stretch content edge-to-edge past ~1200px).
- **Spacing scale:** 4px base unit (4, 8, 12, 16, 24, 32, 48, 64px) — consistent spacing tokens across all components, no arbitrary pixel values.
- **Vertical rhythm:** Generous section spacing (48–64px between major sections on landing/marketing pages; 24–32px between grouped elements on app screens).
- **Single-column-first mobile layout:** per App Flow Document §0, mobile is the primary use case for the in-app experience (voice-first, one-handed) — design mobile layouts first, then expand to desktop, not the reverse.
- **Centered, focused layouts for core flow screens** (`/intent`, `/queue`, `/call`): these are NOT dashboard-style multi-panel layouts. They are single-focus, centered-content screens with minimal peripheral UI — reinforces principle #1 (voice-first, not screen-first).
- **Dashboard-style layout reserved for secondary/utility screens only** (`/contacts`, `/history`, `/settings`) — see §7.

---

## 6. Component Style

### General component language
- **Corner radius:** 12px on cards/panels/modals, 8px on buttons/inputs, 999px (fully rounded/pill) on tags, chips, and the primary "Start Talking" CTA button — rounded pill CTAs read as approachable/low-friction, reinforcing principle #2.
- **Elevation:** Subtle shadows only (`0 1px 3px rgba(0,0,0,0.08)` for cards, `0 4px 16px rgba(0,0,0,0.12)` for modals/popovers) — avoid heavy drop shadows, keep it flat-leaning-toward-soft rather than skeuomorphic.
- **Buttons:**
  - Primary: filled violet (`#7C5CFC`), white text, 8px radius (999px for the hero/main CTA specifically), medium weight text.
  - Secondary: white/transparent fill, 1px border (`#E5E5E8`), dark text.
  - Destructive: filled red (`#EF4444`), white text — used exclusively for Hang Up, Report submit, Delete Account. Never use red for anything non-destructive (consistency = trust).
  - Disabled state: 40% opacity, no hover interaction, cursor `not-allowed`.
- **Inputs:** 1px border (`#E5E5E8`), 8px radius, 12–16px internal padding, clear focus state (2px violet outline ring, `#7C5CFC` at 40% opacity) — focus rings must be visible for keyboard/accessibility navigation.
- **Cards:** White surface, 12px radius, 1px border or subtle shadow (not both — pick one per context to avoid visual heaviness), 16–24px internal padding.
- **Intent tag selector cards** (`/intent` screen): Large tappable cards (not small chips/pills for this specific selection, since it's the single most important pre-call decision) — icon + label, selected state = violet border + light violet background tint (`#7C5CFC` at 8% opacity) + checkmark icon.
- **Toasts:** Rounded rectangle, dark surface (`#18181B`) with white text for contrast against any page background, positioned top-right desktop / top-center mobile, slide-in animation (200ms ease-out).
- **Modals:** Centered overlay, dark scrim background (`rgba(0,0,0,0.5)`), white surface panel, 12px radius, max-width 480px, close on scrim click except for destructive-confirmation modals (require explicit button choice, no accidental dismiss).

### Icons
- **Icon set:** Lucide (or Feather Icons as fallback) — outline style, consistent 1.5–2px stroke weight, matches the "clean geometric" style direction. Avoid filled/glyph icon sets (feels heavier/more corporate than the warm-minimal direction calls for).
- Icon sizing: 16px (inline with body text), 20px (buttons/nav), 24px (standalone/feature icons).

### Audio Visualizer (Active Call screen — signature component)
This is the product's most important custom component, since it's the primary visual feedback during the core experience (no video, per PRD). Specification:
- Circular or waveform-bar visualization, centered on `/call/:sessionId`.
- Reacts to **remote peer's** audio input level in real time (amplitude-driven scale/opacity animation) — gives the visual sense of "someone is there and speaking," compensating for the lack of video.
- Idle state (no one speaking): gentle, slow pulse animation (not static) — communicates "connected and live," not "frozen/broken."
- Color: violet accent (`#7C5CFC`), animated in the 40–100% opacity range tied to amplitude.
- Must be performant (CSS transform/opacity only, not layout-triggering properties) since it runs continuously for the duration of every call.

---

## 7. Dashboard Structure (secondary/utility screens)

Unlike the core flow (landing → intent → queue → call), the utility screens (`/contacts`, `/history`, `/settings`) DO use a light dashboard structure:

- **Persistent top navigation bar** (not a sidebar — the app's screen count doesn't justify sidebar-level navigation complexity in V1): Logo (left, links to `/intent`), user avatar/menu (right, dropdown: Contacts, Call History, Settings, Log Out).
- Each utility screen is a **single-column list/content layout** under the top nav — no multi-panel dashboard grids needed at this product stage (V1 has no analytics/data-heavy screens per PRD scope).
- `/contacts` and `/history`: vertical list of row-items, each row = avatar/placeholder + primary label + secondary metadata + action button(s), consistent row height and padding across both screens for visual consistency.
- `/settings`: grouped sections with clear section headers (Account, Privacy, Preferences), standard form-row pattern (label left or above, control right or below depending on breakpoint).

`[OPEN DECISION: if the product roadmap post-V1 adds founder-specific analytics (e.g. "ideas discussed," "feedback received over time"), a true dashboard/data-viz layout would be introduced at that point — not needed for V1 scope per PRD.]`

---

## 8. Mobile Responsiveness

Given the App Flow Document's explicit call-out that the Active Call screen is optimized for mobile-portrait as the primary use case, mobile responsiveness is not an afterthought — it's the primary design target.

### Breakpoints
| Breakpoint | Width | Behavior |
|---|---|---|
| Mobile | `< 768px` | Single column, full-width components, bottom-anchored control bar on call screen, collapsible nav → hamburger/avatar-only header. |
| Tablet | `768px – 1024px` | Single column content, wider margins, some two-column layout on landing page sections only. |
| Desktop | `> 1024px` | Full layout as specified, max-width 1200px container, multi-column landing sections. |

### Mobile-specific requirements
- **Touch targets minimum 44x44px** (Apple HIG standard) — critical for the Active Call bottom control bar (Mute, Hang Up, Skip, Report, Add Contact) since users may be interacting one-handed or without looking at the screen while talking.
- **Bottom-anchored primary controls on `/call/:sessionId`** — thumb-reachable zone, not top of screen.
- **No hover-dependent interactions** — every hover state (buttons, tooltips) must have a tap/active-state equivalent; tooltips convert to tap-to-reveal or are omitted on mobile in favor of always-visible helper text.
- **Safe-area padding** for iOS notch/home-indicator on the call screen control bar (`env(safe-area-inset-bottom)`).
- **Text chat panel on mobile** (`/call/:sessionId`): full-screen overlay when expanded (not a cramped side panel), with a clear close/collapse affordance back to the call view.
- **Forms** (`/signup`, `/login`): full-width inputs, no side-by-side field layouts on mobile, appropriate `inputmode`/`type` attributes (email keyboard for email field, etc.) since this affects real typing friction on mobile.

---

## 9. Motion & Animation Principles

- **Purposeful, not decorative.** Every animation should communicate state (connecting, loading, live, error) — never purely ornamental.
- **Timing:** 150–250ms for UI transitions (button states, modal open/close), 300–400ms for screen-level transitions (page navigation fade/slide).
- **Easing:** `ease-out` for elements entering/appearing, `ease-in` for elements exiting — standard, unsurprising motion, no bouncy/springy effects (reinforces principle #5, confidence over cuteness).
- **Queue screen "searching" animation:** continuous, calm pulse/waveform loop — must not feel anxious or urgent (avoid fast pulsing, red/warm alert colors) since this is a normal waiting state, not an error.
- **Reduced motion support:** Respect `prefers-reduced-motion` media query — disable non-essential animation (pulsing, sliding) for users with this preference, keep only functionally necessary transitions.

---

## 10. Visual References

Use these as **directional** references, not literal copy sources — the goal is to triangulate PitchLine's specific position between them:

| Reference | What to take from it | What to leave behind |
|---|---|---|
| **Linear** (linear.app) | Typography confidence, whitespace discipline, subtle shadows, restrained color use, overall "calm professional tool" feel. | Its density/keyboard-shortcut-heavy power-user patterns — not relevant to a simple voice-matching flow. |
| **AirTALK** (airtalk.live — direct product reference from PRD) | The core interaction pattern: big central CTA, no-camera warmth, visible safety controls (Mute/Hang Up/Report) always present during calls, friendly conversational micro-copy. | Its more playful/dating-adjacent visual tone (casual illustration style, emoji-heavy copy) — PitchLine needs more credibility given the founder/idea-discussion positioning. |
| **Notion** | Clean neutral base palette, generous rounded corners, approachable-but-professional balance. | Its content-heavy, document-editor-style density — not applicable to this product's simpler screen set. |
| **Discord (voice channel UI specifically)** | Voice-first UI patterns: speaking indicators, mute states, minimal-but-present participant UI during a live voice session. | Its dense sidebar/server-list navigation paradigm — PitchLine's V1 has too few screens to justify that structure. |
| **Headspace / Calm (tone only, not visual system)** | The *emotional register* — calm, reassuring, non-anxious — appropriate for a product where users are entering a slightly vulnerable social situation (talking to a stranger). | Their soft-illustration/character-driven visual style — too whimsical for the founder-trust positioning here. |

---

## 11. Accessibility Requirements (summary)

- WCAG AA color contrast minimum across all text/UI (per §3).
- Full keyboard navigability for all interactive elements (tab order must follow logical reading order; focus states always visible).
- All icon-only buttons (Mute, Report flag, etc.) require `aria-label`s — no icon-only button without an accessible name.
- Live regions (`aria-live`) for dynamic state changes users need announced: call connected, call ended, report submitted, connection issues — screen reader users must receive these updates without needing to visually scan the screen.
- Given PRD's note (from AirTALK's FAQ reference) that voice-first, no-camera products are naturally well-suited to blind/visually impaired users, this product should actively support that use case — meaning screen-reader testing on `/intent`, `/queue`, and `/call` is a design QA requirement, not optional polish.
- Respect `prefers-reduced-motion` (per §9) and `prefers-color-scheme` if dark mode is implemented.

---

## 12. Design Tokens Summary (for implementation)

For an AI app builder or design-system setup, the following should be established as reusable tokens/variables from the start (not hardcoded per-component):

```
colors:
  primary: #7C5CFC
  primary-hover: #6547E0
  background: #FAFAFA
  surface: #FFFFFF
  border: #E5E5E8
  text-primary: #18181B
  text-secondary: #71717A
  success: #22C55E
  warning: #F59E0B
  danger: #EF4444
  neutral-action: #64748B

radius:
  sm: 8px    (buttons, inputs)
  md: 12px   (cards, modals)
  full: 999px (pills, tags, primary CTA)

spacing: [4, 8, 12, 16, 24, 32, 48, 64]  (px)

typography:
  font-family: "Inter", sans-serif
  display: 40px / 700
  h1: 28px / 700
  h2: 20px / 600
  body-lg: 16px / 400
  body: 14px / 400
  caption: 12px / 500

motion:
  fast: 150ms ease-out
  base: 250ms ease-out
  screen: 350ms ease-out
```

---

## 12a. Ad Slot & Paywall Component Guidance

Per the product's freemium + ad-supported monetization model, two new component patterns are needed:

- **Ad slot component:** A container with a fixed min-height (to prevent layout shift on load) and a small "Sponsored" label above it (per AdSense's disclosure requirements) in `caption` typography, `text-secondary` color. Ad slots use the same 12px card radius as surrounding content so they don't visually clash, but are never styled to look like native app content (no violet accent border, no interactive hover states) — this is both an AdSense compliance requirement (ads must not be indistinguishable from content) and a trust-preserving design choice. **Ad slots are only ever placed on the screens flagged AdSense-eligible in the App Flow Document** (landing, `/intent`, `/post-call`, `/history`, `/contacts` list view, `/settings`) — never on `/call/:sessionId` or any messaging thread.
- **Upgrade/paywall prompt:** Triggered when a free-tier user hits their daily match limit (App Flow §5 freemium gate). Style as a centered card (not a jarring modal takeover) with the same warm-minimal language as the rest of the app — headline explaining the limit reached, a clear violet primary "Upgrade" button, and a secondary "Come back tomorrow" dismiss option. Must not feel punitive or aggressive — consistent with principle #5 (confidence over cuteness) and the product's overall calm tone; this is a soft upsell, not a hard paywall wall.

---

## 13. Open Decisions Requiring Confirmation Before Build

1. Dark mode in V1 vs. deferred (§3) — recommend building the token system to support it regardless of launch-day inclusion.
2. Final icon set license/availability confirmation (Lucide vs. Feather) depending on the AI app builder's available libraries (§6).
3. Whether the audio visualizer is a custom canvas/WebAudio-driven component or a simpler CSS-only approximation for V1 speed — technical complexity tradeoff to confirm with engineering (§6).
4. Illustration style (if any is added to empty states/landing page) — this brief specifies iconography but not a custom illustration system; recommend deferring custom illustration to post-V1 and using icon+color combinations for empty states initially, to keep V1 build scope lean.
