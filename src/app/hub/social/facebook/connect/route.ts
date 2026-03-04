import { NextRequest, NextResponse } from "next/server";

const FACEBOOK_AUTH_BASE = "https://www.facebook.com/v22.0/dialog/oauth";

export async function GET(_req: NextRequest) {
  const clientId = process.env.META_APP_ID;
  if (!clientId) {
    return new NextResponse("META_APP_ID is not configured.", { status: 500 });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const redirectUri = `${appUrl}/hub/social/facebook/callback`;

  const scope = [
    "public_profile",
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_metadata",
  ].join(",");

  const url =
    `${FACEBOOK_AUTH_BASE}?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(url);
}

