-- Backend Schema Migration for PitchLine v1
-- Applies definitions from Backend-Schema-Document.md

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. users
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    auth_provider TEXT NOT NULL CHECK (auth_provider IN ('email','google')),
    oauth_subject_id TEXT,
    age_confirmed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','banned')),
    status_reason TEXT,
    default_country_filter TEXT,
    default_language_filter TEXT,
    last_seen_at TIMESTAMPTZ,
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free','paid')),
    stripe_customer_id TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','moderator','admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX users_email_lower_idx ON public.users (LOWER(email)) WHERE deleted_at IS NULL;
CREATE INDEX users_status_idx ON public.users (status) WHERE deleted_at IS NULL;
CREATE INDEX users_oauth_subject_idx ON public.users (oauth_subject_id) WHERE oauth_subject_id IS NOT NULL;

-- 2. intent_tags
CREATE TABLE public.intent_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX intent_tags_active_idx ON public.intent_tags (is_active, sort_order);

-- Insert initial intent tags from MockData
INSERT INTO public.intent_tags (slug, label, sort_order) VALUES
    ('pitch_idea', 'Pitch My Idea', 1),
    ('give_feedback', 'Give Feedback', 2),
    ('open_discussion', 'Open Discussion', 3),
    ('founder_chat', 'Founder Chat', 4);

-- 3. sessions
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_b_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    intent_tag_a_id UUID REFERENCES public.intent_tags(id) ON DELETE SET NULL,
    intent_tag_b_id UUID REFERENCES public.intent_tags(id) ON DELETE SET NULL,
    match_type TEXT NOT NULL DEFAULT 'random' CHECK (match_type IN ('random','direct_contact')),
    country_filter TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER CHECK (duration_seconds >= 0),
    end_reason TEXT CHECK (end_reason IN ('hangup','skip','report','drop','timeout')),
    ended_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sessions_user_a_idx ON public.sessions (user_a_id, created_at DESC);
CREATE INDEX sessions_user_b_idx ON public.sessions (user_b_id, created_at DESC);
CREATE INDEX sessions_end_reason_idx ON public.sessions (end_reason);

-- 4. session_messages
CREATE TABLE public.session_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    body TEXT NOT NULL CHECK (char_length(body) <= 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX session_messages_session_idx ON public.session_messages (session_id, created_at ASC);

-- 5. contacts
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    contact_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    nickname TEXT,
    source_session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX contacts_unique_pair_idx ON public.contacts (user_id, contact_user_id);
CREATE INDEX contacts_user_idx ON public.contacts (user_id, status, created_at DESC);

-- 6. contact_messages
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_pair_key UUID NOT NULL,
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    body TEXT NOT NULL CHECK (char_length(body) <= 2000),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX contact_messages_pair_idx ON public.contact_messages (contact_pair_key, created_at ASC);
CREATE INDEX contact_messages_recipient_unread_idx ON public.contact_messages (recipient_id) WHERE read_at IS NULL;

-- 7. reports
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reported_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reason_code TEXT NOT NULL CHECK (reason_code IN ('harassment','hate_speech','sexual_content','spam_self_promo','other')),
    free_text_note TEXT CHECK (char_length(free_text_note) <= 280),
    audio_buffer_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','actioned','dismissed')),
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX reports_status_idx ON public.reports (status, created_at ASC);
CREATE INDEX reports_reported_user_idx ON public.reports (reported_id, created_at DESC);

-- 8. bans
CREATE TABLE public.bans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    related_report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    issued_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX bans_user_active_idx ON public.bans (user_id, expires_at);

-- 9. data_export_requests
CREATE TABLE public.data_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
    download_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX data_export_user_idx ON public.data_export_requests (user_id, created_at DESC);

-- 10. session_feedback
CREATE TABLE public.session_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    rating SMALLINT NOT NULL CHECK (rating IN (0,1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX session_feedback_unique_idx ON public.session_feedback (session_id, user_id);

-- 11. subscriptions
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active','past_due','canceled','incomplete')),
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX subscriptions_user_idx ON public.subscriptions (user_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) policies
-- Note: As specified in Backend Schema Document 15, V1 primarily enforces rules at the API layer.
-- However, since the client may access Supabase directly, we lock down direct read/write access to internal.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intent_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to intent_tags
CREATE POLICY "Public intent tags are viewable by everyone" ON public.intent_tags FOR SELECT USING (true);

-- Service Role (backend API) has full bypass by default in Supabase.
-- For actual client direct queries (anon/authenticated), we are blocking everything else for now to force usage of the API layer per Backend Schema §15.
-- "This matrix is enforced at the API/application layer... not via Postgres Row-Level Security (RLS) in V1"
