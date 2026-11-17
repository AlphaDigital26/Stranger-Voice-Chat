import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    // Guests (anonymous Supabase sessions) can call too; no session means no token
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const room = searchParams.get("room");

    if (!room) {
      return NextResponse.json({ error: "Missing 'room' query parameter" }, { status: 400 });
    }

    // Only the two people matched into this call may join its room. Row-level
    // security on call_sessions means a user can only see calls they're part of.
    const { data: call, error: callError } = await supabase
      .from("call_sessions")
      .select("id")
      .eq("id", room)
      .is("ended_at", null)
      .maybeSingle();
    if (callError || !call) {
      return NextResponse.json({ error: "This call isn't available. It may have ended." }, { status: 403 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ error: "Server misconfigured: LiveKit credentials missing" }, { status: 500 });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      // Supabase user id as identity; never expose email or real names to the other person
      identity: user.id,
      name: "Stranger",
    });

    at.addGrant({
      roomJoin: true,
      room: room,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
