// ============================================================
// Placeholder name generator
// Deterministically converts a userId → "Stranger #XXXX"
// Stable across views — same userId always yields same number
// ============================================================

export function getStrangerName(userId: string): string {
  // Simple hash of the userId for deterministic stable output
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const num = Math.abs(hash) % 9000 + 1000; // Range: 1000–9999
  return `Stranger #${num}`;
}

// ============================================================
// Mock data helpers
// ============================================================

export interface MockContact {
  id: string;
  contactUserId: string;
  sourceSessionId: string;
  status: "pending" | "accepted";
  lastTalkedAt: string;
  createdAt: string;
}

export interface MockSession {
  id: string;
  myIntentTag: string;
  matchIntentTag: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  endReason: string;
  contactAdded: boolean;
}

export const MOCK_CONTACTS: MockContact[] = [
  {
    id: "cnt_001",
    contactUserId: "usr_abc123",
    sourceSessionId: "sess_001",
    status: "accepted",
    lastTalkedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "cnt_002",
    contactUserId: "usr_def456",
    sourceSessionId: "sess_002",
    status: "accepted",
    lastTalkedAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "cnt_003",
    contactUserId: "usr_ghi789",
    sourceSessionId: "sess_003",
    status: "accepted",
    lastTalkedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

export const MOCK_SESSIONS: MockSession[] = [
  {
    id: "sess_001",
    myIntentTag: "Pitch My Idea",
    matchIntentTag: "Give Feedback",
    startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    endedAt: new Date(Date.now() - 3600000 * 2 + 1000 * 312).toISOString(),
    durationSeconds: 312,
    endReason: "hangup",
    contactAdded: true,
  },
  {
    id: "sess_002",
    myIntentTag: "Open Discussion",
    matchIntentTag: "Founder Chat",
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    endedAt: new Date(Date.now() - 86400000 + 1000 * 540).toISOString(),
    durationSeconds: 540,
    endReason: "hangup",
    contactAdded: true,
  },
  {
    id: "sess_003",
    myIntentTag: "Give Feedback",
    matchIntentTag: "Pitch My Idea",
    startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    endedAt: new Date(Date.now() - 86400000 * 2 + 1000 * 18).toISOString(),
    durationSeconds: 18,
    endReason: "skip",
    contactAdded: false,
  },
  {
    id: "sess_004",
    myIntentTag: "Pitch My Idea",
    matchIntentTag: "Give Feedback",
    startedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    endedAt: new Date(Date.now() - 86400000 * 5 + 1000 * 720).toISOString(),
    durationSeconds: 720,
    endReason: "hangup",
    contactAdded: true,
  },
];

export const MOCK_MESSAGES: Record<string, Array<{ id: string; senderId: string; body: string; createdAt: string; isOwn: boolean }>> = {
  cnt_001: [
    { id: "m1", senderId: "usr_abc123", body: "Hey! Great chat earlier about your SaaS idea 🚀", createdAt: new Date(Date.now() - 3600000).toISOString(), isOwn: false },
    { id: "m2", senderId: "usr_mock_001", body: "Thanks! Your feedback on the pricing model was super helpful.", createdAt: new Date(Date.now() - 3500000).toISOString(), isOwn: true },
    { id: "m3", senderId: "usr_abc123", body: "Happy to help. Let me know when you launch the beta!", createdAt: new Date(Date.now() - 3400000).toISOString(), isOwn: false },
  ],
  cnt_002: [
    { id: "m4", senderId: "usr_def456", body: "Really enjoyed the conversation about market sizing.", createdAt: new Date(Date.now() - 86400000).toISOString(), isOwn: false },
  ],
  cnt_003: [],
};

// ============================================================
// Format helpers
// ============================================================

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatCallDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const INTENT_LABELS: Record<string, string> = {
  pitch_idea: "Pitch My Idea",
  give_feedback: "Give Feedback",
  open_discussion: "Open Discussion",
  founder_chat: "Founder Chat",
};
