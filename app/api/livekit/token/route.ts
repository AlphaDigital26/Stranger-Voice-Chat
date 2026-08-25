import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const room = searchParams.get("room");
    
    if (!room) {
      return NextResponse.json({ error: "Missing 'room' query parameter" }, { status: 400 });
    }

    // In a real production app, we would verify here that the user is actually
    // authorized to join this specific room (e.g. by checking the 'sessions' table in Supabase).
    // For V1, we simply issue a token to the authenticated user for the requested room.

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ error: "Server misconfigured: LiveKit credentials missing" }, { status: 500 });
    }

    const participantName = user.primaryEmailAddress?.emailAddress?.split("@")[0] || "Stranger";
    // We use the user's Clerk ID as the participant identity
    const participantIdentity = user.id;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: participantName,
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
