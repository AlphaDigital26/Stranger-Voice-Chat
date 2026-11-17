import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Screens that need this device's hidden session and the 18+ confirmation.
// There is no login anywhere: the session is created silently on "Find someone".
const NEEDS_SESSION = ["/queue", "/call", "/post-call"];

const matches = (path: string, routes: string[]) =>
  routes.some(r => path === r || path.startsWith(`${r}/`));

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Demo mode (NEXT_PUBLIC_DEMO_MODE=true) runs without Supabase at all
  if (!url || !key || process.env.NEXT_PUBLIC_DEMO_MODE === "true") return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  // Refresh the Supabase session and write updated auth cookies onto the response
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const path = request.nextUrl.pathname;

  const redirectTo = (pathname: string, params: Record<string, string> = {}) => {
    const target = request.nextUrl.clone();
    target.pathname = pathname;
    target.search = new URLSearchParams(params).toString();
    const redirect = NextResponse.redirect(target);
    // Keep any refreshed auth cookies
    response.cookies.getAll().forEach(c => redirect.cookies.set(c));
    return redirect;
  };

  const ageConfirmed = !!(claims?.user_metadata as { age_confirmed_at?: string } | undefined)?.age_confirmed_at;
  if (matches(path, NEEDS_SESSION) && (!claims || !ageConfirmed)) {
    return redirectTo("/intent");
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
