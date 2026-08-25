import { create } from "zustand";

// ============================================================
// Call Store — Zustand state machine for call lifecycle
// States: idle → queued → connecting → in_call → post_call
// ============================================================

export type CallState = "idle" | "queued" | "connecting" | "in_call" | "post_call";
export type IntentTag = "pitch_idea" | "give_feedback" | "open_discussion" | "founder_chat";
export type EndReason = "hangup" | "skip" | "report" | "drop" | "timeout";

export interface TextMessage {
  id: string;
  senderId: string;
  body: string;
  timestamp: string;
  isOwn: boolean;
}

export interface CallSession {
  sessionId: string;
  myIntentTag: IntentTag;
  matchIntentTag: IntentTag;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  endReason?: EndReason;
}

interface CallStore {
  callState: CallState;
  selectedIntent: IntentTag | null;
  countryFilter: string | null;
  languageFilter: string | null;
  currentSession: CallSession | null;
  isMuted: boolean;
  textMessages: TextMessage[];
  isChatOpen: boolean;
  unreadCount: number;
  contactRequestSent: boolean;
  contactAdded: boolean;
  queueElapsed: number;

  // Actions
  setIntent: (tag: IntentTag) => void;
  setCountryFilter: (val: string | null) => void;
  setLanguageFilter: (val: string | null) => void;
  joinQueue: () => void;
  cancelQueue: () => void;
  matchFound: (sessionId: string, matchTag: IntentTag) => void;
  connectionEstablished: () => void;
  hangUp: () => void;
  skip: () => void;
  endCall: (reason: EndReason) => void;
  toggleMute: () => void;
  toggleChat: () => void;
  sendMessage: (body: string, senderId: string) => void;
  receiveMessage: (body: string, senderId: string) => void;
  sendContactRequest: () => void;
  confirmContactAdded: () => void;
  resetToIdle: () => void;
  incrementQueueElapsed: () => void;
}

export const useCallStore = create<CallStore>((set, get) => ({
  callState: "idle",
  selectedIntent: null,
  countryFilter: null,
  languageFilter: null,
  currentSession: null,
  isMuted: false,
  textMessages: [],
  isChatOpen: false,
  unreadCount: 0,
  contactRequestSent: false,
  contactAdded: false,
  queueElapsed: 0,

  setIntent: (tag) => set({ selectedIntent: tag }),
  setCountryFilter: (val) => set({ countryFilter: val }),
  setLanguageFilter: (val) => set({ languageFilter: val }),

  joinQueue: () => set({ callState: "queued", queueElapsed: 0, textMessages: [], contactRequestSent: false, contactAdded: false }),

  cancelQueue: () => set({ callState: "idle" }),

  matchFound: (sessionId, matchTag) =>
    set((s) => ({
      callState: "connecting",
      currentSession: {
        sessionId,
        myIntentTag: s.selectedIntent!,
        matchIntentTag: matchTag,
        startedAt: new Date().toISOString(),
      },
    })),

  connectionEstablished: () => set({ callState: "in_call" }),

  hangUp: () => {
    get().endCall("hangup");
  },

  skip: () => {
    get().endCall("skip");
  },

  endCall: (reason) =>
    set((s) => ({
      callState: "post_call",
      currentSession: s.currentSession
        ? {
            ...s.currentSession,
            endedAt: new Date().toISOString(),
            durationSeconds: Math.floor(
              (Date.now() - new Date(s.currentSession.startedAt).getTime()) / 1000
            ),
            endReason: reason,
          }
        : null,
    })),

  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

  toggleChat: () =>
    set((s) => ({
      isChatOpen: !s.isChatOpen,
      unreadCount: !s.isChatOpen ? 0 : s.unreadCount,
    })),

  sendMessage: (body, senderId) => {
    const msg: TextMessage = {
      id: `msg_${Date.now()}`,
      senderId,
      body,
      timestamp: new Date().toISOString(),
      isOwn: true,
    };
    set((s) => ({ textMessages: [...s.textMessages, msg] }));
  },

  receiveMessage: (body, senderId) => {
    const msg: TextMessage = {
      id: `msg_${Date.now()}`,
      senderId,
      body,
      timestamp: new Date().toISOString(),
      isOwn: false,
    };
    set((s) => ({
      textMessages: [...s.textMessages, msg],
      unreadCount: s.isChatOpen ? 0 : s.unreadCount + 1,
    }));
  },

  sendContactRequest: () => set({ contactRequestSent: true }),
  confirmContactAdded: () => set({ contactAdded: true, contactRequestSent: false }),

  resetToIdle: () =>
    set({
      callState: "idle",
      currentSession: null,
      isMuted: false,
      textMessages: [],
      isChatOpen: false,
      unreadCount: 0,
      contactRequestSent: false,
      contactAdded: false,
      queueElapsed: 0,
    }),

  incrementQueueElapsed: () => set((s) => ({ queueElapsed: s.queueElapsed + 1 })),
}));
